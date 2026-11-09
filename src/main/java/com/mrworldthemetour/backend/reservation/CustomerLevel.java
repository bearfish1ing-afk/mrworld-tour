package com.mrworldthemetour.backend.reservation;

import lombok.Getter;

@Getter
public enum CustomerLevel {
    BRONZE(1, "브론즈", 0L, 0),
    SILVER(2, "실버", 3_000_000L, 2),
    GOLD(3, "골드", 10_000_000L, 5);

    private final int level;
    private final String label;
    private final long minAmount;
    private final int discountRate;

    CustomerLevel(int level, String label, long minAmount, int discountRate) {
        this.level = level;
        this.label = label;
        this.minAmount = minAmount;
        this.discountRate = discountRate;
    }

    public static CustomerLevel from(long yearlyAmount) {
        if (yearlyAmount >= GOLD.minAmount) return GOLD;
        if (yearlyAmount >= SILVER.minAmount) return SILVER;
        return BRONZE;
    }

    public long discount(long baseAmount) {
        return baseAmount * discountRate / 100;
    }
}