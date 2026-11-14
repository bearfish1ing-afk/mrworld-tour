package com.mrworldthemetour.backend.reservation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

//관리자 예약 관리 DTO
public final class AdminReservationDto {
    private AdminReservationDto() {
    }

    public record Summary(
            Long reservationId,
            String reservationCode,
            Long productId,
            String productTitle,
            LocalDate departureDate,
            LocalDate returnDate,
            String customerName,
            String customerPhone,
            Integer people,
            String grade,
            Long finalAmount,
            ReservationStatus status,
            LocalDateTime reservedAt
    ) {}

    public record Detail(
            Summary summary,
            String vehicle,
            List<ReservationDetailResponse.OptionResponse> options,
            String souvenirName,
            Integer souvenirQuantity, // 인원보다 적으면 재고 부족
            Long baseAmount,
            Long optionAmount,
            Long discountAmount,
            String paymentMethod,
            String adminMemo
    ) {}

    public record StatusRequest(@NotNull ReservationStatus status) {}

    public record MemoRequest(@Size(max = 1000) String memo) {}

    public record PageResponse(List<Summary> content, int page, int size,
                               long totalElements, int totalPages) {}
}
