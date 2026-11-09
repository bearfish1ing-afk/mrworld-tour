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

    @Column(name = "hotel_address", length = 255)
    private String hotelAddress;

    @Column(name = "hotel_rating")
    private Integer hotelRating;

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

    public static ProductOption hotel(Product product, String name, Long price,
                                      String rule, String address, Integer rating) {
        if (address == null || address.isBlank() || rating == null
                || rating < 3 || rating > 5) {
            throw new IllegalArgumentException("호텔 주소와 3~5성급 정보가 필요합니다.");
        }
        ProductOption option = new ProductOption(product, ProductOptionType.HOTEL, name, price, rule);
        option.hotelAddress = address;
        option.hotelRating = rating;
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