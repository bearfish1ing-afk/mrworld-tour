package com.mrworldthemetour.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDto {

    private AuthDto() {
    }

    // 일반 회원가입 요청
    public record SignupRequest(

            @NotBlank(message = "이메일을 입력해 주세요.")
            @Email(message = "올바른 이메일 형식이어야 합니다.")
            @Size(max = 255, message = "이메일은 255자 이하여야 합니다.")
            String email,

            @NotBlank(message = "비밀번호를 입력해 주세요.")
            @Size(
                    min = 8,
                    max = 20,
                    message = "비밀번호는 8~20자여야 합니다."
            )
            @Pattern(
                    regexp = "^[\\x21-\\x7E]+$",
                    message = "비밀번호는 공백 없이 영문, 숫자, 특수문자로 입력해 주세요."
            )
            String password,

            @NotBlank(message = "전화번호를 입력해 주세요.")
            @Pattern(
                    regexp = "^010-?\\d{4}-?\\d{4}$",
                    message = "전화번호는 01012345678 또는 010-1234-5678 형식이어야 합니다."
            )
            String phoneNum,

            @NotBlank(message = "이름을 입력해 주세요.")
            @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
            String name,

            @Size(max = 30, message = "닉네임은 30자 이하여야 합니다.")
            String nickname,

            @NotBlank(message = "주소를 입력해 주세요.")
            @Size(max = 255, message = "주소는 255자 이하여야 합니다.")
            String address,

            @NotBlank(message = "전화번호 인증을 완료해 주세요.")
            String signupProof
    ) {
    }

    // 회원가입 완료 응답
    public record SignupResponse(
            Long userId,
            String message
    ) {
    }

    // 일반·관리자 로그인 요청
    public record LoginRequest(

            @NotBlank(message = "이메일을 입력해 주세요.")
            @Email(message = "올바른 이메일 형식이어야 합니다.")
            @Size(max = 255, message = "이메일은 255자 이하여야 합니다.")
            String email,

            @NotBlank(message = "비밀번호를 입력해 주세요.")
            String password
    ) {
    }

    // 로그인 완료 응답
    public record LoginResponse(
            String accessToken,
            String tokenType,
            long expiresIn
    ) {
    }
}