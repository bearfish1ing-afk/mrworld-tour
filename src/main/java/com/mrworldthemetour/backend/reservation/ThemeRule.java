package com.mrworldthemetour.backend.reservation;

import java.util.Optional;

public enum ThemeRule {
    HONEYMOON("허니문", TourGrade.GRAND, 2, "커플 기념티", "2인 전용 고급차량"),
    PARENTS("효도", TourGrade.GRAND, null, "건강 인삼", "10인 승합 고급차량"),
    GOLF("골프", TourGrade.CLASSIC,  null, "골프공", "10인 승합 고급차량"),
    TREKKING("트레킹", TourGrade.CLASSIC, null, "스카프", "10인 승합 고급차량");

    private final String keyword;
    private final TourGrade minGrade;
    private final Integer fixedPeople;
    private final String souvenirName;
    private final String defaultVehicleName;

    ThemeRule(String keyword, TourGrade minGrade, Integer fixedPeople,
              String souvenirName, String defaultVehicleName) {
        this.keyword = keyword;
        this.minGrade = minGrade;
        this.fixedPeople = fixedPeople;
        this.souvenirName = souvenirName;
        this.defaultVehicleName = defaultVehicleName;
    }

    public static Optional<ThemeRule> fromThemeName(String themeName){
        if(themeName==null){
            return Optional.empty();
        }
        for(ThemeRule rule:values()){
            if(themeName.contains(rule.keyword)){
                return Optional.of(rule);
            }
        }
        return Optional.empty();
    }

    public TourGrade getMinGrade() {
        return minGrade;
    }
    public Integer getFixedPeople() {
        return fixedPeople;
    }
    public String getSouvenirName() {
        return souvenirName;
    }
    public String getDefaultVehicleName() {
        return defaultVehicleName;
    }
}
