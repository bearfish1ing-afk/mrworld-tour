package com.example.mrworldthemetour.backend.dto;

import com.example.mrworldthemetour.backend.entity.ReservationStatus;

public record ReservationCreateResponse(
        Long reservationId,
        String reservationCode,
        ReservationStatus status,
        Long finalAmount
) {
}
