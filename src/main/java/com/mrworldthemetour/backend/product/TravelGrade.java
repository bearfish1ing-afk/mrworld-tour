package com.mrworldthemetour.backend.product;

import com.mrworldthemetour.backend.exception.BusinessException;
import org.springframework.http.HttpStatus;

// reservation/TourGrade 를 대체 (TourGrade.java 는 삭제)
public enum TravelGrade {
    CLASSIC(1, "클래식"),
    GRAND(2, "그랜드"),
    PREMIUM(3, "프리미엄");

    private final int rank;
    private final String label;

    TravelGrade(int rank, String label) {
        this.rank = rank;
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public boolean satisfies(TravelGrade minimum) {
        return minimum == null || rank >= minimum.rank;
    }

    // "PREMIUM", "premium", "프리미엄" 모두 허용
    public static TravelGrade from(String value) {
        if (value != null) {
            String v = value.trim();
            for (TravelGrade grade : values()) {
                if (grade.name().equalsIgnoreCase(v) || grade.label.equals(v)) {
                    return grade;
                }
            }
        }
        throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR,
                "UNKNOWN_TOUR_GRADE", "알 수 없는 투어 등급입니다: " + value);
    }
}
