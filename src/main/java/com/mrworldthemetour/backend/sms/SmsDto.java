package com.mrworldthemetour.backend.sms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SmsDto {

    private SmsDto() {
    }

    public record SendRequest(
            @NotBlank(message = "전화번호를 입력해 주세요.")
            @Pattern(
                    regexp = "^010(?:\\d{8}|-\\d{4}-\\d{4})$",
                    message = "올바른 휴대전화번호 형식이어야 합니다."
            )
            String phoneNum
    ) {
    }

    public record SendResponse(
            String requestId,
            long expiresIn,
            long resendAfter
    ) {
    }

    public record VerifyRequest(
            @NotBlank(message = "인증 요청 ID가 필요합니다.")
            String requestId,

            @NotBlank(message = "인증번호를 입력해 주세요.")
            @Pattern(
                    regexp = "^\\d{6}$",
                    message = "인증번호는 숫자 6자리여야 합니다."
            )
            String code
    ) {
    }

    public record VerifyResponse(
            String signupProof,
            long expiresIn
    ) {
    }
}