package com.mrworldthemetour.backend.reservation;

import lombok.Getter;

@Getter
public enum TourGrade {
    CLASSIC("클래식"),
    GRAND("그랜드"),
    PREMIUM("프리미엄");

    private final String label;

    TourGrade(String label){
        this.label=label;
    }
}
