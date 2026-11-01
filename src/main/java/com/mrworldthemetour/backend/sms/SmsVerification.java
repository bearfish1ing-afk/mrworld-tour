package com.mrworldthemetour.backend.sms;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sms_verifications")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SmsVerification {

    @Id
    @Column(name = "phone_num", length = 11)
    private String phoneNum;

    @Column(name = "request_id", unique = true, length = 36)
    private String requestId;

    @Column(name = "code_hash", length = 64)
    private String codeHash;

    @Column(name = "requested_at")
    private Instant requestedAt;

    @Column(name = "code_expires_at")
    private Instant codeExpiresAt;

    @Column(nullable = false)
    private boolean sent;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "proof_hash", unique = true, length = 64)
    private String proofHash;

    @Column(name = "proof_expires_at")
    private Instant proofExpiresAt;

    @Column(nullable = false)
    private boolean consumed;

    @Column(name = "window_started_at")
    private Instant windowStartedAt;

    @Column(name = "request_count", nullable = false)
    private int requestCount;
}