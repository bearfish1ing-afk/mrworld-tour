package com.mrworldthemetour.backend.reservation;

import java.util.List;

/**
 * null인 항목은 "현재 선택 유지".
 * - 기본값으로 되돌리려면 그 기본 옵션 id를 명시해서 보낸다.
 * - 등급을 바꾸면 호텔/식사는 (명시하지 않는 한) 새 등급의 기본값으로 초기화된다.
 * - drinks: null = 유지, [] = 추가 음료 전부 제거
 */
public record ReservationChangeRequest(
        Long productGradeId,
        Integer people,
        Long hotelOptionId,
        Long mealOptionId,
        Long vehicleOptionId,
        List<PriceRequest.DrinkRequest> drinks
) {
}
