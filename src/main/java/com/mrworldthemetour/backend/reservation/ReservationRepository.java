package com.mrworldthemetour.backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {
    //예약번호 중복확인
    boolean existsByReservationCode(String reservationCode);
}
