package com.mrworldthemetour.backend.reservation;

import java.util.List;

//문자 받을 예약 목록 전달
public record DepartureConfirmedEvent(Long productId, List<Long> reservationIds) {
}
