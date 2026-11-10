package com.mrworldthemetour.backend.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_grade")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_grade_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "grade", length = 20)
    private String grade;

    @Column(name = "extra_price")
    private Long extraPrice;

    @Column(name = "is_default")
    private Boolean defaultGrade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_hotel_option_id", nullable = false)
    private ProductOption defaultHotelOption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_meal_option_id", nullable = false)
    private ProductOption defaultMealOption;

    @ManyToOne(fetch = FetchType.LAZY)
    // [수정] 기본 음료는 프리미엄(샴페인)만. 클래식, 그랜드는 null
    @JoinColumn(name = "default_drink_option_id")
    private ProductOption defaultDrinkOption;

    // 프리미엄 기본 음료 이름 (요구사항: 프리미엄은 스테이크와 샴페인 제공)
    public static final String PREMIUM_DEFAULT_DRINK = "샴페인";

    // drink: 프리미엄이면 샴페인 옵션 필수, 클래식/그랜드는 null
    public void initializeDefaultOptions(ProductOption hotel, ProductOption meal, ProductOption drink) {
        validateDefault(hotel, ProductOptionType.HOTEL);
        validateDefault(meal, ProductOptionType.MEAL);
        TravelGrade travelGrade = TravelGrade.valueOf(grade);
        // 요구사항: 클래식 3등급, 그랜드 4등급, 프리미엄 5등급 호텔
        if (hotel.getHotelLevel() != HotelLevel.forGrade(travelGrade)) {
            throw new IllegalArgumentException("호텔 등급이 여행 등급과 일치해야 합니다.");
        }
        // [수정] 요구사항: 클래식 도시락, 그랜드 현지식 레스토랑, 프리미엄 고급 레스토랑
        if (meal.getMealType() != MealType.forGrade(travelGrade)) {
            throw new IllegalArgumentException("식사 종류가 여행 등급과 일치해야 합니다.");
        }
        if (travelGrade == TravelGrade.PREMIUM) {
            validateDefault(drink, ProductOptionType.DRINK);
            if (!PREMIUM_DEFAULT_DRINK.equals(drink.getOptionName())) {
                throw new IllegalArgumentException("프리미엄 기본 음료는 샴페인이어야 합니다.");
            }
        } else if (drink != null) {
            throw new IllegalArgumentException("기본 음료는 프리미엄 등급에만 지정할 수 있습니다.");
        }
        this.defaultDrinkOption = drink;
        this.defaultHotelOption = hotel;
        this.defaultMealOption = meal;
    }

    private void validateDefault(ProductOption option, ProductOptionType type) {
        if (option == null || option.getOptionType() != type || product == null
                || product.getId() == null || option.getProduct() == null
                || !product.getId().equals(option.getProduct().getId())) {
            throw new IllegalArgumentException("동일 상품의 기본 " + type + " 옵션이 필요합니다.");
        }
    }

    public ProductGrade(
            Product product,
            String grade,
            Long extraPrice,
            Boolean defaultGrade
    ) {
        this.product = product;
        this.grade = grade;
        this.extraPrice = extraPrice;
        this.defaultGrade = defaultGrade;
    }
}