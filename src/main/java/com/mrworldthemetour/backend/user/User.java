package com.mrworldthemetour.backend.user;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "phone_num", nullable = false, unique = true)
    private String phoneNum;

    @Column(nullable = false)
    private String name;

    private String nickname;

    @Column(nullable = false)
    private String address;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level = Level.BRONZE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    // JPA가 Entity 객체를 생성할 때 사용
    protected User() {
    }

    // 일반 회원가입에 사용
    public User(
            String email,
            String passwordHash,
            String phoneNum,
            String name,
            String nickname,
            String address
    ) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.phoneNum = phoneNum;
        this.name = name;
        this.nickname = nickname;
        this.address = address;
    }

    public static User createAdmin(
            String email,
            String passwordHash,
            String phoneNum,
            String name,
            String address
    ) {
        User admin = new User(
                email,
                passwordHash,
                phoneNum,
                name,
                null, // 직원 닉네임은 생략
                address
        );

        admin.role = Role.ADMIN;

        return admin;
    }

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getPhoneNum() {
        return phoneNum;
    }

    public String getName() {
        return name;
    }

    public String getNickname() {
        return nickname;
    }

    public String getAddress() {
        return address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Level getLevel() {
        return level;
    }

    public Role getRole() {
        return role;
    }

    public enum Role {
        ADMIN,
        USER
    }

    public enum Level {
        BRONZE,
        SILVER,
        GOLD,
        DIAMOND
    }
}