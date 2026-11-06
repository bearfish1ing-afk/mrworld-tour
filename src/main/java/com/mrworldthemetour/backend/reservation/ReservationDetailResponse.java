package com.mrworldthemetour.backend.reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ReservationDetailResponse(
        // 예약 정보
        Long reservationId,
        String reservationCode,
        ReservationStatus status,
        LocalDateTime reservedAt,
        Integer people,

        // 상품
        Long productId,
        String productTitle,
        LocalDate departureDate,
        LocalDate returnDate,

        // 선택 옵션
        String grade,
        String vehicle,
        List<OptionResponse> options,

        // 결제 금액
        Long baseAmount,
        Long optionAmount,
        Long discountAmount,
        Long finalAmount,
        String paymentMethod
) {
    public record OptionResponse(
            OptionType type,
            String name,
            Integer quantity,
            Long amount
    ) {
        public static OptionResponse from(ReservationOption option) {
            return new OptionResponse(
                    option.getOptionType(),
                    option.getOptionName(),
                    option.getQuantity(),
                    option.getExtraPrice()
            );
        }
    }
}