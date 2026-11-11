package com.mrworldthemetour.backend.product;

public enum HotelLevel {
    STAR_3(3, "3등급 호텔"),
    STAR_4(4, "4등급 호텔"),
    STAR_5(5, "5등급 호텔");

    private final int rating;
    private final String label;

    HotelLevel(int rating, String label) {
        this.rating = rating;
        this.label = label;
    }

    public int getRating() {
        return rating;
    }

    public String getLabel() {
        return label;
    }

    // 여행 등급의 기본 호텔
    public static HotelLevel forGrade(TravelGrade grade) {
        return switch (grade) {
            case CLASSIC -> STAR_3;
            case GRAND -> STAR_4;
            case PREMIUM -> STAR_5;
        };
    }
}
