package com.mrworldthemetour.backend.inventory;

public enum StockChangeType {
    RECEIVE,   // 입고
    ALLOCATE,  // 예약에 배정
    RESTORE    // 예약 취소로 복구
}