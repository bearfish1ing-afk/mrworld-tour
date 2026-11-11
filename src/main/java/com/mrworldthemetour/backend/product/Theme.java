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

    @Enumerated(EnumType.STRING)
    @Column(name = "default_vehicle", length = 100)
    private VehicleType defaultVehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "min_grade", length = 20)
    private TravelGrade minGrade;

    @Column(name = "fixed_people")
    private Integer fixedPeople;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "souvenir_item_id")
    private Item souvenirItem;

    public Theme(String themeName, String description, VehicleType defaultVehicle,
                 TravelGrade minGrade, Integer fixedPeople) {
        this(themeName, description);
        changeRules(defaultVehicle, minGrade, fixedPeople);
    }

    public void changeRules(VehicleType defaultVehicle, TravelGrade minGrade, Integer fixedPeople) {
        if (fixedPeople != null && fixedPeople <= 0) {
            throw new IllegalArgumentException("고정 예약 인원은 양수여야 합니다.");
        }
        this.defaultVehicle = defaultVehicle;
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
