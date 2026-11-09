package com.mrworldthemetour.backend.reservation;

import java.util.List;

// 출발 취소(마감 미달 / 관리자 취소) 시 예약자 문자 발송용
// reason 예: "최소 출발 인원 미달로", "여행사 사정으로"
public record DepartureCanceledEvent(Long productId, List<Long> reservationIds, String reason) {
}
