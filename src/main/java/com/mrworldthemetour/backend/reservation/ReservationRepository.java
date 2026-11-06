package com.mrworldthemetour.backend.reservation;

import org.hibernate.sql.results.spi.ListResultsConsumer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {
    //예약번호 중복확인
    boolean existsByReservationCode(String reservationCode);

    Optional<Reservation> findByIdAndUserId(Long id, Long userId);

    //예약 목록
    List<Reservation> findByUserIdOrderByReservedAtDesc(Long userId);
}
