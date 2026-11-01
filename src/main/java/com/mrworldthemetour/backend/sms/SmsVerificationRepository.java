package com.mrworldthemetour.backend.sms;

import jakarta.persistence.LockModeType;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SmsVerificationRepository
        extends JpaRepository<SmsVerification, String> {

    @Modifying
    @Query(value = """
            INSERT IGNORE INTO sms_verifications
                (phone_num, sent, attempts, consumed, request_count)
            VALUES
                (:phoneNum, false, 0, false, 0)
            """, nativeQuery = true)
    void initializePhone(@Param("phoneNum") String phoneNum);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM SmsVerification s
            WHERE s.phoneNum = :phoneNum
            """)
    Optional<SmsVerification> findByPhoneNumForUpdate(
            @Param("phoneNum") String phoneNum
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM SmsVerification s
            WHERE s.requestId = :requestId
            """)
    Optional<SmsVerification> findByRequestIdForUpdate(
            @Param("requestId") String requestId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM SmsVerification s
            WHERE s.proofHash = :proofHash
            """)
    Optional<SmsVerification> findByProofHashForUpdate(
            @Param("proofHash") String proofHash
    );
}