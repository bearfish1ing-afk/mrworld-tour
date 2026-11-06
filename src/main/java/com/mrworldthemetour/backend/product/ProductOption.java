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

    @Column(name = "option_type", length = 20)
    private String optionType;

    @Column(name = "option_name", length = 100)
    private String optionName;

    @Column(name = "extra_price")
    private Long extraPrice;

    @Column(name = "apply_rule", length = 20)
    private String applyRule;

    public ProductOption(
            Product product,
            String optionType,
            String optionName,
            Long extraPrice,
            String applyRule
    ) {
        this.product = product;
        this.optionType = optionType;
        this.optionName = optionName;
        this.extraPrice = extraPrice;
        this.applyRule = applyRule;
    }
}