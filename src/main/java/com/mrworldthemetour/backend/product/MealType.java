package com.mrworldthemetour.backend.product;

// 식사 종류 (요구사항으로 고정): 클래식 도시락, 그랜드 현지식 레스토랑, 프리미엄 고급 레스토랑(스테이크)
// 직원은 상품마다 식사별 가격만 입력하고, 고객은 다른 식사로 변경 가능 (차액 부과)
public enum MealType {
    LUNCHBOX(1, "도시락"),
    LOCAL_RESTAURANT(2, "현지식 레스토랑"),
    FINE_DINING(3, "고급 레스토랑 스테이크");

    private final int level;
    private final String label;

    MealType(int level, String label) {
        this.level = level;
        this.label = label;
    }

    public int getLevel() {
        return level;
    }

    public String getLabel() {
        return label;
    }

    // 여행 등급의 기본 식사
    public static MealType forGrade(TravelGrade grade) {
        return switch (grade) {
            case CLASSIC -> LUNCHBOX;
            case GRAND -> LOCAL_RESTAURANT;
            case PREMIUM -> FINE_DINING;
        };
    }
}
