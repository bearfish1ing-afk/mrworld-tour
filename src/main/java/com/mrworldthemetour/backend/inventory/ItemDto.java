package com.mrworldthemetour.backend.inventory;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public final class ItemDto {

    private ItemDto() {
    }

    public record CreateRequest(
            @NotBlank
            @Size(max = 100)
            String itemName,

            @NotNull
            @PositiveOrZero
            Integer baseAmount,

            @NotNull
            @PositiveOrZero
            Integer initialAmount,

            @Size(max = 255)
            String reason
    ) {
    }

    public record ReceiveRequest(
            @NotNull
            @Positive
            Integer quantity,

            @Size(max = 255)
            String reason
    ) {
    }

    public record ItemResponse(
            Long id,
            String itemName,
            Integer baseAmount, // 물품 1개 가격 (원)
            Integer currentAmount,
            LocalDateTime updatedAt
    ) {
        public static ItemResponse from(Item item) {
            return new ItemResponse(
                    item.getId(),
                    item.getItemName(),
                    item.getBaseAmount(),
                    item.getCurrentAmount(),
                    item.getUpdatedAt()
            );
        }
    }

    public record HistoryResponse(
            Long id,
            Long itemId,
            Long reservationId,
            StockChangeType type,
            Integer quantity,
            Integer stockAfter,
            String reason,
            LocalDateTime createdAt
    ) {
        public static HistoryResponse from(StockHistory history) {
            return new HistoryResponse(
                    history.getId(),
                    history.getItem().getId(),
                    history.getReservationId(),
                    history.getType(),
                    history.getQuantity(),
                    history.getStockAfter(),
                    history.getReason(),
                    history.getCreatedAt()
            );
        }
    }

    public record PageResponse(
            List<ItemResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {
    }
}