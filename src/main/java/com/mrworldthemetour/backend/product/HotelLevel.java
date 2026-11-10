package com.mrworldthemetour.backend.product;

// 호텔 등급 (요구사항으로 고정): 클래식 3등급, 그랜드 4등급, 프리미엄 5등급
// 직원은 상품마다 등급별 가격만 입력하고, 고객은 다른 등급으로 변경 가능 (차액 부과)
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
