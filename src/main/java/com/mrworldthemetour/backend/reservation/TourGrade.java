package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum TourGrade {
    CLASSIC("클래식"),
    GRAND("그랜드"),
    PREMIUM("프리미엄");

    private final String label;

    TourGrade(String label){
        this.label=label;
    }

    public static TourGrade from(String value){
        if(value!=null){
            String v=value.trim();
            for(TourGrade grade:values()){
                if(grade.name().equalsIgnoreCase(v) || grade.label.equals(v)){
                    return grade;
                }
            }
        }
        throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR,
                "UNKNOWN_TOUR_GRADE", "알 수 없는 투어 등급입니다: " + value);
    }
}
