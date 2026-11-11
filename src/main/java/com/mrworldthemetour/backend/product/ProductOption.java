package com.mrworldthemetour.backend.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_option")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", length = 20, nullable = false)
    private ProductOptionType optionType;

    @Column(name = "option_name", length = 100)
    private String optionName;

    @Column(name = "extra_price")
    private Long extraPrice;

    @Column(name = "apply_rule", length = 20)
    private String applyRule;

    @Enumerated(EnumType.STRING)
    @Column(name = "hotel_level", length = 20)
    private HotelLevel hotelLevel;

    @Column(name = "hotel_rating")
    private Integer hotelRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 30)
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", length = 30)
    private MealType mealType;

    @Column(name = "service_level")
    private Integer serviceLevel;

    public static ProductOption meal(Product product, MealType type, Long price) {
        if (type == null) {
            throw new IllegalArgumentException("식사 종류(LUNCHBOX/LOCAL_RESTAURANT/FINE_DINING)가 필요합니다.");
        }
        ProductOption option = new ProductOption(product, ProductOptionType.MEAL,
                type.getLabel(), price, "PER_PERSON");
        option.mealType = type;
        option.serviceLevel = type.getLevel();
        return option;
    }

    public static ProductOption drink(Product product, String name, Long price, String rule) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("음료 이름이 필요합니다.");
        }
        return new ProductOption(product, ProductOptionType.DRINK, name.strip(), price, rule);
    }

    public static ProductOption hotel(Product product, HotelLevel level, Long price) {
        if (level == null) {
            throw new IllegalArgumentException("호텔 등급(STAR_3/4/5)이 필요합니다.");
        }
        ProductOption option = new ProductOption(product, ProductOptionType.HOTEL,
                level.getLabel(), price, "PER_PERSON");
        option.hotelLevel = level;
        option.hotelRating = level.getRating();
        return option;
    }

    public static ProductOption vehicle(Product product, VehicleType type, Long price) {
        if (type == null) {
            throw new IllegalArgumentException("차량 종류가 필요합니다.");
        }
        ProductOption option = new ProductOption(product, ProductOptionType.VEHICLE,
                type.getLabel(), price, "PER_RESERVATION");
        option.vehicleType = type;
        return option;
    }

    public ProductOption(
            Product product,
            ProductOptionType optionType,
            String optionName,
            Long extraPrice,
            String applyRule
    ) {
        if (!"PER_PERSON".equals(applyRule) && !"PER_RESERVATION".equals(applyRule)) {
            throw new IllegalArgumentException("지원하지 않는 요금 적용 규칙입니다.");
        }
        this.product = product;
        this.optionType = java.util.Objects.requireNonNull(optionType, "옵션 종류가 필요합니다.");
        this.optionName = optionName;
        this.extraPrice = extraPrice;
        this.applyRule = applyRule;
    }
}

//호텔, 식사, 차량은 enum으로 저장