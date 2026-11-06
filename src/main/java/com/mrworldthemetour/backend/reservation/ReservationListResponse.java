package com.mrworldthemetour.backend.reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationListResponse(
        Long reservationId,
        String reservationCode,
        Long productId,
        String productTitle,
        LocalDate departureDate,
        LocalDate returnDate,
        String grade,
        Integer people,
        Long finalAmount,
        ReservationStatus status,
        LocalDateTime reservedAt
) {
}
