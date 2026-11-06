package com.mrworldthemetour.backend.user;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDateTime;
import java.util.Locale;

public record UserResponse(
        Long id,
        String email,
        String phoneNum,
        String name,
        String nickname,
        String address,
        LocalDateTime createdAt,
        User.Level level,
        User.Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getPhoneNum(),
                user.getName(),
                user.getNickname(),
                user.getAddress(),
                user.getCreatedAt(),
                user.getLevel(),
                user.getRole()
        );
    }
}

//리뷰 등 기능 넣을 시 phoneNum, address, email 다른 사용자에게 노출하면 안됨
