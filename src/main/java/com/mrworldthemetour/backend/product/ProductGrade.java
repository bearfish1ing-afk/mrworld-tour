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