package com.mrworldthemetour.backend.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theme_id")
    private Theme theme;

    @Column(name = "product_code", length = 30)
    private String productCode;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "country", length = 50)
    private String country;

    @Column(name = "duration", length = 20)
    private String duration;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "base_price")
    private Long basePrice;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "max_people")
    private Integer maxPeople;

    @Column(name = "min_people")
    private Integer minPeople;

    @Column(name = "current_people")
    private Integer currentPeople;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product(
            Theme theme,
            String productCode,
            String title,
            String country,
            String duration,
            String description,
            Long basePrice,
            String status,
            LocalDate departureDate,
            LocalDate returnDate,
            LocalDateTime deadline,
            Integer maxPeople,
            Integer minPeople
    ) {
        this.theme = theme;
        this.productCode = productCode;
        this.title = title;
        this.country = country;
        this.duration = duration;
        this.description = description;
        this.basePrice = basePrice;
        this.status = status;
        this.departureDate = departureDate;
        this.returnDate = returnDate;
        this.deadline = deadline;
        this.maxPeople = maxPeople;
        this.minPeople = minPeople;
        this.currentPeople = 0;
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}