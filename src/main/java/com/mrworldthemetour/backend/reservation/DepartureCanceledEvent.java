package com.mrworldthemetour.backend.reservation;

import java.util.List;

// 출발 취소 시 문자 발송
public record DepartureCanceledEvent(Long productId, List<Long> reservationIds, String reason) {
}
