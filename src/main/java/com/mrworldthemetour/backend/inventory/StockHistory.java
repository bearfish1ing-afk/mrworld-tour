package com.mrworldthemetour.backend.inventory;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 10)
    private StockChangeType type;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "stock_after", nullable = false)
    private Integer stockAfter;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static StockHistory receive(
            Item item,
            int quantity,
            String reason
    ) {
        if (item == null || quantity <= 0) {
            throw new IllegalArgumentException("물품과 양수 입고 수량이 필요합니다.");
        }

        StockHistory history = new StockHistory();
        history.item = item;
        history.type = StockChangeType.RECEIVE;
        history.quantity = quantity;
        history.stockAfter = item.getCurrentAmount();
        history.reason = reason;
        return history;
    } //item.recieve(quantity) 이후에 호출

    // [추가] item.allocate() 이후 호출
    public static StockHistory allocate(Item item, Long reservationId, int quantity, String reason) {
        return of(item, reservationId, StockChangeType.ALLOCATE, quantity, reason);
    }

    // [추가] item.restore() 이후 호출
    public static StockHistory restore(Item item, Long reservationId, int quantity, String reason) {
        return of(item, reservationId, StockChangeType.RESTORE, quantity, reason);
    }

    private static StockHistory of(Item item, Long reservationId, StockChangeType type,
                                   int quantity, String reason) {
        if (item == null || quantity <= 0) {
            throw new IllegalArgumentException("물품과 양수 수량이 필요합니다.");
        }
        StockHistory history = new StockHistory();
        history.item = item;
        history.reservationId = reservationId;
        history.type = type;
        history.quantity = quantity;
        history.stockAfter = item.getCurrentAmount();
        history.reason = reason;
        return history;
    }

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
