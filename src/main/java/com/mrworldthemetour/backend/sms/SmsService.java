package com.mrworldthemetour.backend.sms;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.user.UserRepository;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SmsService implements SignupProofVerifier {

    private static final long CODE_TTL_SECONDS = 180;
    private static final long PROOF_TTL_SECONDS = 600;
    private static final long RESEND_SECONDS = 60;

    private static final int MAX_ATTEMPTS = 5;
    private static final int MAX_REQUESTS_PER_HOUR = 5;

    private final SmsVerificationRepository smsRepository;
    private final UserRepository userRepository;

    private final DefaultMessageService messageService;
    private final String senderNumber;
    private final byte[] hmacKey;

    private final SecureRandom random = new SecureRandom();

    public SmsService(
            SmsVerificationRepository smsRepository,
            UserRepository userRepository,
            @Value("${app.solapi.api-key}") String apiKey,
            @Value("${app.solapi.api-secret}") String apiSecret,
            @Value("${app.solapi.sender-number}") String senderNumber,
            @Value("${app.sms.hmac-secret-base64}") String hmacSecret
    ) {
        this.smsRepository = smsRepository;
        this.userRepository = userRepository;

        this.messageService =
                SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);

        this.senderNumber = senderNumber.replace("-", "");
        this.hmacKey = Base64.getDecoder().decode(hmacSecret);

        if (hmacKey.length < 32) {
            throw new IllegalArgumentException(
                    "SMS HMAC 키는 최소 32바이트여야 합니다."
            );
        }
    }

    // 발송 실패도 요청 횟수와 재발송 간격에 포함한다.
    @Transactional(noRollbackFor = BusinessException.class)
    public SmsDto.SendResponse requestCode(SmsDto.SendRequest request) {
        String phoneNum = normalizePhone(request.phoneNum());

        if (userRepository.existsByPhoneNum(phoneNum)) {
            throw error(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_EXISTS",
                    "이미 가입된 전화번호입니다."
            );
        }

        smsRepository.initializePhone(phoneNum);

        SmsVerification verification =
                smsRepository.findByPhoneNumForUpdate(phoneNum)
                        .orElseThrow(() ->
                                new IllegalStateException("인증정보 초기화 실패")
                        );

        Instant now = Instant.now();

        if (verification.getRequestedAt() != null
                && now.isBefore(
                verification.getRequestedAt()
                        .plusSeconds(RESEND_SECONDS)
        )) {
            throw error(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "SMS_RESEND_TOO_SOON",
                    "인증번호는 60초 후 다시 요청할 수 있습니다."
            );
        }

        if (verification.getWindowStartedAt() == null
                || !now.isBefore(
                verification.getWindowStartedAt().plusSeconds(3600)
        )) {
            verification.setWindowStartedAt(now);
            verification.setRequestCount(0);
        }

        if (verification.getRequestCount() >= MAX_REQUESTS_PER_HOUR) {
            throw error(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "SMS_REQUEST_LIMIT",
                    "전화번호별 인증 요청은 한 시간에 5회까지 가능합니다."
            );
        }

        String requestId = UUID.randomUUID().toString();
        String code = String.format(
                java.util.Locale.ROOT,
                "%06d",
                random.nextInt(1_000_000)
        );

        verification.setRequestId(requestId);
        verification.setCodeHash(
                digest("code:" + requestId + ":" + code)
        );
        verification.setRequestedAt(now);
        verification.setCodeExpiresAt(now.plusSeconds(CODE_TTL_SECONDS));
        verification.setAttempts(0);
        verification.setSent(false);

        // 재발송하면 이전 가입 증표도 무효화
        verification.setProofHash(null);
        verification.setProofExpiresAt(null);
        verification.setConsumed(false);

        verification.setRequestCount(
                verification.getRequestCount() + 1
        );

        // 외부 발송 전에 DB 제약조건 등 확인
        smsRepository.saveAndFlush(verification);

        Message message = new Message();
        message.setFrom(senderNumber);
        message.setTo(phoneNum);
        message.setText(
                "[미스터월드] 회원가입 인증번호는 "
                        + code
                        + "입니다. 3분 이내에 입력해 주세요."
        );

        try {
            var response = messageService.send(message, null);

            if (response == null
                    || (response.getFailedMessageList() != null
                    && !response.getFailedMessageList().isEmpty())) {
                throw new IllegalStateException("SMS 발송 접수 실패");
            }
        } catch (Exception exception) {
            // 인증번호나 API Secret, 업체 오류 원문은 응답에 넣지 않는다.
            throw error(
                    HttpStatus.BAD_GATEWAY,
                    "SMS_SEND_FAILED",
                    "문자 발송에 실패했습니다. 잠시 후 다시 시도해 주세요."
            );
        }

        verification.setSent(true);

        return new SmsDto.SendResponse(
                requestId,
                CODE_TTL_SECONDS,
                RESEND_SECONDS
        );
    }

    // 인증번호 오류를 반환해도 실패 횟수는 DB에 남겨야 한다.
    @Transactional(noRollbackFor = BusinessException.class)
    public SmsDto.VerifyResponse verifyCode(SmsDto.VerifyRequest request) {
        SmsVerification verification =
                smsRepository.findByRequestIdForUpdate(request.requestId())
                        .orElseThrow(() -> error(
                                HttpStatus.BAD_REQUEST,
                                "SMS_REQUEST_NOT_FOUND",
                                "유효한 인증 요청이 없습니다."
                        ));

        Instant now = Instant.now();

        if (!verification.isSent()
                || verification.getCodeExpiresAt() == null
                || !now.isBefore(verification.getCodeExpiresAt())) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "SMS_CODE_EXPIRED",
                    "인증 요청이 만료되었거나 유효하지 않습니다."
            );
        }

        if (verification.isConsumed()
                || verification.getProofHash() != null) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "SMS_ALREADY_VERIFIED",
                    "이미 처리된 인증 요청입니다."
            );
        }

        if (verification.getAttempts() >= MAX_ATTEMPTS) {
            throw error(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "SMS_ATTEMPT_LIMIT",
                    "인증 시도 횟수를 초과했습니다. 새 번호를 요청해 주세요."
            );
        }

        String inputHash = digest(
                "code:" + request.requestId() + ":" + request.code()
        );

        if (!sameHash(verification.getCodeHash(), inputHash)) {
            verification.setAttempts(verification.getAttempts() + 1);

            throw error(
                    HttpStatus.BAD_REQUEST,
                    "SMS_CODE_MISMATCH",
                    "인증번호가 올바르지 않습니다."
            );
        }

        byte[] proofBytes = new byte[32];
        random.nextBytes(proofBytes);

        String signupProof = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(proofBytes);

        verification.setProofHash(digest("proof:" + signupProof));
        verification.setProofExpiresAt(
                now.plusSeconds(PROOF_TTL_SECONDS)
        );

        return new SmsDto.VerifyResponse(
                signupProof,
                PROOF_TTL_SECONDS
        );
    }

    // 반드시 AuthService.signup()의 트랜잭션에 참여한다.
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void verifyAndConsume(String signupProof, String phoneNum) {
        if (signupProof == null || signupProof.isBlank()) {
            throw invalidProof();
        }

        SmsVerification verification =
                smsRepository.findByProofHashForUpdate(
                        digest("proof:" + signupProof)
                ).orElseThrow(this::invalidProof);

        if (!verification.isSent()
                || verification.isConsumed()
                || verification.getProofExpiresAt() == null
                || !Instant.now().isBefore(
                verification.getProofExpiresAt()
        )
                || !verification.getPhoneNum().equals(
                normalizePhone(phoneNum)
        )) {
            throw invalidProof();
        }

        verification.setConsumed(true);
    }

    private String normalizePhone(String phoneNum) {
        if (phoneNum == null
                || !phoneNum.matches("^010(?:\\d{8}|-\\d{4}-\\d{4})$")) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PHONE",
                    "올바른 휴대전화번호를 입력해 주세요."
            );
        }

        return phoneNum.replace("-", "");
    }

    private String digest(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hmacKey, "HmacSHA256"));

            byte[] result = mac.doFinal(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(result);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                    "SMS 인증값 생성 실패",
                    exception
            );
        }
    }

    private boolean sameHash(String storedHash, String inputHash) {
        return storedHash != null && MessageDigest.isEqual(
                storedHash.getBytes(StandardCharsets.US_ASCII),
                inputHash.getBytes(StandardCharsets.US_ASCII)
        );
    }

    private BusinessException invalidProof() {
        return error(
                HttpStatus.BAD_REQUEST,
                "INVALID_SIGNUP_PROOF",
                "전화번호 인증 정보가 유효하지 않습니다."
        );
    }

    private BusinessException error(
            HttpStatus status,
            String code,
            String message
    ) {
        return new BusinessException(status, code, message);
    }
}