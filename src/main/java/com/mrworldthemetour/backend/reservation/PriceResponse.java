package com.mrworldthemetour.backend.reservation;

import java.util.List;

public record PriceResponse(
        Long baseAmount,
        List<PriceItem> items,
        Long optionAmount,
        Long discountAmount,
        Long finalAmount
) {
    public record PriceItem(
            OptionType type,
            Long sourceId,
            String name,
            Integer quantity,
            Long unitPrice,   // 호텔/식사/차량: 기본 옵션 대비 차액, 음료: 단가
            Long amount,
            boolean isDefault // [추가] true면 프론트에서 "기본 포함" 표시
    ) {
        public static PriceItem of(OptionType type, Long sourceId, String name,
                                   int quantity, long unitPrice, boolean isDefault) {
            return new PriceItem(type, sourceId, name, quantity, unitPrice, unitPrice * quantity, isDefault);
        }
    }
}
