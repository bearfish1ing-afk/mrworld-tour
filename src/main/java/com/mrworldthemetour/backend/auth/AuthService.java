package com.mrworldthemetour.backend.auth;


import com.mrworldthemetour.backend.sms.SignupProofVerifier;
import com.mrworldthemetour.backend.user.User;
import com.mrworldthemetour.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrworldthemetour.backend.exception.BusinessException;
import org.springframework.http.HttpStatus;

import java.util.Locale;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SignupProofVerifier signupProofVerifier;

    @Transactional
    public AuthDto.SignupResponse signup(AuthDto.SignupRequest request) {

        String email = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        String phoneNum = request.phoneNum().replace("-", "");

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "이미 사용 중인 이메일입니다."
            );
        }

        if (userRepository.existsByPhoneNum(phoneNum)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_EXISTS",
                    "이미 가입된 전화번호입니다."
            );
        }

        String passwordHash = passwordEncoder.encode(request.password());

        // 인증된 전화번호와 가입 전화번호가 같은지 확인
        signupProofVerifier.verifyAndConsume(
                request.signupProof(),
                phoneNum
        );

        User user = new User(
                email,
                passwordHash,
                phoneNum,
                request.name().strip(),
                request.nickname(),
                request.address().strip()
        );

        User savedUser = userRepository.saveAndFlush(user);

        return new AuthDto.SignupResponse(
                savedUser.getId(),
                "회원가입이 완료되었습니다."
        );
    } //회원가입

    @Transactional
    public AuthDto.SignupResponse signupAdmin(AuthDto.SignupRequest request) {

        String email = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        String phoneNum = request.phoneNum().replace("-", "");

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "이미 사용 중인 이메일입니다."
            );
        }

        if (userRepository.existsByPhoneNum(phoneNum)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_EXISTS",
                    "이미 가입된 전화번호입니다."
            );
        }

        String passwordHash = passwordEncoder.encode(request.password());

        signupProofVerifier.verifyAndConsume(
                request.signupProof(),
                phoneNum
        );

        User admin = User.createAdmin(
                email,
                passwordHash,
                phoneNum,
                request.name().strip(),
                request.address().strip()
        );

        User savedAdmin = userRepository.saveAndFlush(admin);

        return new AuthDto.SignupResponse(
                savedAdmin.getId(),
                "관리자 회원가입이 완료되었습니다."
        );
    } // 관리자 회원가입

    @Transactional(readOnly = true)
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {

        String loginEmail = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(loginEmail)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "이메일 또는 비밀번호가 올바르지 않습니다."
                ));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }

        if (user.getRole() != User.Role.USER) {
            throw new BusinessException(
                    HttpStatus.FORBIDDEN,
                    "USER_ACCESS_DENIED",
                    "관리자 계정은 관리자 모드로 로그인해야 합니다."
            );
        }//로그인 모드에 맞는 권한 검증

        return new AuthDto.LoginResponse(
                jwtTokenService.createAccessToken(user),
                "Bearer",
                jwtTokenService.getAccessTokenExpiresIn()
        );
    } //로그인

    @Transactional(readOnly = true)
    public AuthDto.LoginResponse adminLogin(AuthDto.LoginRequest request) {

        String loginEmail = request.email()
                .strip()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(loginEmail)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "이메일 또는 비밀번호가 올바르지 않습니다."
                ));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }

        if (user.getRole() != User.Role.ADMIN) {
            throw new BusinessException(
                    HttpStatus.FORBIDDEN,
                    "ADMIN_ACCESS_DENIED",
                    "관리자 계정만 로그인할 수 있습니다."
            );
        }//로그인 모드에 맞는 권한 검증

        return new AuthDto.LoginResponse(
                jwtTokenService.createAccessToken(user),
                "Bearer",
                jwtTokenService.getAccessTokenExpiresIn()
        );
    } //관리자 로그인
}

// 로그아웃은 프론트에서 처리함
