package com.mrworldthemetour.backend.product;

// 차량 종류는 enum으로 고정, 고객은 예약 시 차량 변경 가능
public enum VehicleType {
    COUPLE_LUXURY("2인 전용 고급차량"),   // 허니문 기본
    VAN_10_LUXURY("10인 승합 고급차량"),  // 효도, 골프, 트레킹 기본
    PRIVATE_LIMOUSINE("VIP 리무진");      // 업그레이드

    private final String label;

    VehicleType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
