package com.mrworldthemetour.backend.product;

public enum TravelGrade {
    CLASSIC(1), GRAND(2), PREMIUM(3);

    private final int rank;
    TravelGrade(int rank) { this.rank = rank; }
    public boolean satisfies(TravelGrade minimum) {
        return minimum == null || rank >= minimum.rank;
    }
}
