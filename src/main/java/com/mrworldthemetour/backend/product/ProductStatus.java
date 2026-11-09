package com.mrworldthemetour.backend.product;

public enum ProductStatus {
    RECRUITING,  // 모집 중: 예약 가능
    CONFIRMED,   // 출발 확정: 최소 출발 인원 충족
    CLOSED,      // 모집 마감: 추가 예약 불가
    CANCELED,    // 출발 취소
    COMPLETED    // 여행 완료
}
