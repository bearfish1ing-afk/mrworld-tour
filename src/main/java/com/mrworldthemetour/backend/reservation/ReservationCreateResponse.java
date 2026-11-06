package com.mrworldthemetour.backend.reservation;

public record ReservationCreateResponse(
        Long reservationId,
        String reservationCode,
        ReservationStatus status,
        Long finalAmount
) {
}
