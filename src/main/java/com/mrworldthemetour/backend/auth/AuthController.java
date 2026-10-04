package com.mrworldthemetour.backend.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 회원가입
    @PostMapping("/auth/signup")
    public ResponseEntity<AuthDto.SignupResponse> signup(
            @Valid @RequestBody AuthDto.SignupRequest request
    ) {
        AuthDto.SignupResponse response = authService.signup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 일반 회원 로그인
    @PostMapping("/auth/login")
    public ResponseEntity<AuthDto.LoginResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request
    ) {
        AuthDto.LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    // 관리자 로그인
    @PostMapping("/admin/auth/login")
    public ResponseEntity<AuthDto.LoginResponse> adminLogin(
            @Valid @RequestBody AuthDto.LoginRequest request
    ) {
        AuthDto.LoginResponse response = authService.adminLogin(request);

        return ResponseEntity.ok(response);
    }
}
