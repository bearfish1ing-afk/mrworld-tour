package com.mrworldthemetour.backend.reservation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    //예약번호 중복 확인
    boolean existsByReservationCode(String reservationCode);

    Optional<Reservation> findByIdAndUserId(Long id, Long userId);

    //예약 목록 최신순 조회
    List<Reservation> findByUserIdOrderByReservedAtDesc(Long userId);

    List<Reservation> findByProductIdAndStatus(Long productId, ReservationStatus status);

    //출발 취소 시, 취소되지 않은 예약 조회
    List<Reservation> findByProductIdAndStatusIn(Long productId, Collection<ReservationStatus> statuses);

    //VIP 등급 할인 적용
    @Query("select coalesce(sum(r.finalAmount), 0) from Reservation r " +
            "where r.userId = :userId and r.status = :status and r.reservedAt >= :from")
    Long sumAmount(@Param("userId") Long userId,
                   @Param("status") ReservationStatus status,
                   @Param("from") LocalDateTime from);

    // 관리자용 예약 검색
    @Query("""
            select r from Reservation r
            where (:productId is null or r.productId = :productId)
              and (:status is null or r.status = :status)
            """)
    Page<Reservation> searchForAdmin(@Param("productId") Long productId,
                                     @Param("status") ReservationStatus status,
                                     Pageable pageable);

}
