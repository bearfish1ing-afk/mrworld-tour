package com.mrworldthemetour.backend.user;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyInfo(
            Authentication authentication){

        Long userId = Long.valueOf(authentication.getName());

        return ResponseEntity.ok(userService.getMyInfo(userId));
    } //내 정보 조회
}
