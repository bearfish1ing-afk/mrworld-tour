package com.mrworldthemetour.backend.product;

// 차량 종류 (고정). 테마별 기본 차량은 Theme.defaultVehicle 로 지정
// 직원은 상품마다 업그레이드 차량의 가격만 입력하고, 고객은 변경 가능 (예약당 차액 부과)
public enum VehicleType {
    COUPLE_LUXURY("2인 전용 고급차량"),   // 허니문 기본
    VAN_10_LUXURY("10인 승합 고급차량"),  // 효도, 골프, 트레킹 기본
    PRIVATE_LIMOUSINE("VIP 리무진");      // 업그레이드 (TODO: 팀에서 업그레이드 차량 목록 확정)

    private final String label;

    VehicleType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
