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

    // [수정] 호텔은 고정 등급(enum)으로 관리, 주소는 받지 않음
    @Enumerated(EnumType.STRING)
    @Column(name = "hotel_level", length = 20)
    private HotelLevel hotelLevel;

    @Column(name = "hotel_rating")
    private Integer hotelRating;

    // [추가] 차량은 고정 종류(enum)로 관리
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 30)
    private VehicleType vehicleType;

    @Column(name = "service_level")
    private Integer serviceLevel;

    public static ProductOption foodOrDrink(Product product, ProductOptionType type,
            String name, Long price, String rule, Integer level) {
        if ((type != ProductOptionType.MEAL && type != ProductOptionType.DRINK)
                || level == null || level < 1 || level > 3) {
            throw new IllegalArgumentException("식사와 음료는 1~3단계 등급이 필요합니다.");
        }
        ProductOption option = new ProductOption(product, type, name, price, rule);
        option.serviceLevel = level;
        return option;
    }

    // [수정] 호텔: 이름은 등급 라벨로 자동, 1인당 요금
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

    // [추가] 차량: 이름은 차량 라벨로 자동, 예약당 요금
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