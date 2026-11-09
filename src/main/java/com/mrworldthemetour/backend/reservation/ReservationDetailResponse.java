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
            Long productOptionId, // [추가] 변경 화면에서 현재 선택값 표시용
            String name,
            Integer quantity,
            Long amount,
            boolean isDefault     // [추가] 기본 포함 / 고객 변경 구분
    ) {
        public static OptionResponse from(ReservationOption option) {
            return new OptionResponse(
                    option.getOptionType(),
                    option.getProductOptionId(),
                    option.getOptionName(),
                    option.getQuantity(),
                    option.getExtraPrice(),
                    option.isDefaultSelected()
            );
        }
    }
}
