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

    public void changeDefaultOptions(ProductOption hotel, ProductOption meal) {
        validateDefault(hotel, ProductOptionType.HOTEL);
        validateDefault(meal, ProductOptionType.MEAL);
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