package com.mrworldthemetour.backend.inventory;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "base_amount", nullable = false)
    private Integer baseAmount; // 물품 1개 가격 (원)

    @Column(name = "current_amount", nullable = false)
    private Integer currentAmount;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Item(String itemName, Integer baseAmount) {
        if (itemName == null || itemName.isBlank()) {
            throw new IllegalArgumentException("물품명이 필요합니다.");
        }

        if (baseAmount == null || baseAmount < 0) {
            throw new IllegalArgumentException("물품 가격은 0 이상이어야 합니다.");
        }

        this.itemName = itemName.strip();
        this.baseAmount = baseAmount;
        this.currentAmount = 0;
    }

    public void receive(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("입고 수량은 양수여야 합니다.");
        }

        this.currentAmount = Math.addExact(currentAmount, quantity);
    }

    //예약 배정: 재고가 부족하면 있는 만큼만 배정하고 실제 배정 수량 반환 (예약은 계속 진행)
    public int allocate(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("배정 수량은 양수여야 합니다.");
        }
        int allocated = Math.min(quantity, currentAmount);
        this.currentAmount -= allocated;
        return allocated;
    }

    //예약 변경/취소로 복구
    public void restore(int quantity) {
        if (quantity <= 0) {
            return;
        }
        this.currentAmount = Math.addExact(currentAmount, quantity);
    }

    @PrePersist
    @PreUpdate
    private void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}
