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

    //프리미엄은 샴페인 기본으로 제공
    @JoinColumn(name = "default_drink_option_id")
    private ProductOption defaultDrinkOption;

    public static final String PREMIUM_DEFAULT_DRINK = "샴페인";

    public void initializeDefaultOptions(ProductOption hotel, ProductOption meal, ProductOption drink) {
        validateDefault(hotel, ProductOptionType.HOTEL);
        validateDefault(meal, ProductOptionType.MEAL);
        TravelGrade travelGrade = TravelGrade.valueOf(grade);

        if (hotel.getHotelLevel() != HotelLevel.forGrade(travelGrade)) {
            throw new IllegalArgumentException("호텔 등급이 여행 등급과 일치해야 합니다.");
        }

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