package com.mrworldthemetour.backend.product;

import com.mrworldthemetour.backend.inventory.Item;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "theme")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "theme_id")
    private Long id;

    @Column(name = "theme_name", length = 50)
    private String themeName;

    @Column(name = "description", length = 255)
    private String description;

    // 기본 차량 옵션명 상품 생성 시 이름이 일치하는 차량 옵션을 기본값으로 연결한다.
    @Column(name = "default_vehicle", length = 100)
    private String defaultVehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "min_grade", length = 20)
    private TravelGrade minGrade;

    @Column(name = "fixed_people")
    private Integer fixedPeople;

    //테마 기념품 (커플티, 인삼, 골프공, 스카프) - 예약 시 재고에서 인원 수만큼 배정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "souvenir_item_id")
    private Item souvenirItem;

    public Theme(String themeName, String description, String defaultVehicle,
                 TravelGrade minGrade, Integer fixedPeople) {
        this(themeName, description);
        changeRules(defaultVehicle, minGrade, fixedPeople);
    }

    public void changeRules(String defaultVehicle, TravelGrade minGrade, Integer fixedPeople) {
        if (fixedPeople != null && fixedPeople <= 0) {
            throw new IllegalArgumentException("고정 예약 인원은 양수여야 합니다.");
        }
        if (defaultVehicle != null && defaultVehicle.strip().length() > 100) {
            throw new IllegalArgumentException("기본 차량명은 100자 이하여야 합니다.");
        }
        this.defaultVehicle = defaultVehicle == null || defaultVehicle.isBlank()
                ? null : defaultVehicle.strip();
        this.minGrade = minGrade;
        this.fixedPeople = fixedPeople;
    }


    public void changeSouvenirItem(Item item) {
        this.souvenirItem = item;
    }

    public void validateReservationPeople(Integer people) {
        if (people == null || people <= 0 || (fixedPeople != null && !fixedPeople.equals(people))) {
            throw new IllegalArgumentException("테마의 예약 인원 조건을 확인해 주세요.");
        }
    }

    public Theme(String themeName, String description) {
        this.themeName = themeName;
        this.description = description;
    }
}
