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
            Long unitPrice,
            Long amount,
            boolean isDefault
    ) {
        public static PriceItem of(OptionType type, Long sourceId, String name,
                                   int quantity, long unitPrice, boolean isDefault) {
            return new PriceItem(type, sourceId, name, quantity, unitPrice, unitPrice * quantity, isDefault);
        }
    }
}
