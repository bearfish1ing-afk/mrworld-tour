package com.mrworldthemetour.backend.product;

import com.mrworldthemetour.backend.inventory.Item;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_vehicle_option_id")
    private ProductOption defaultVehicleOption;

    // [추가] 상품 기념품: 상품 생성 시 테마의 기념품이 복사됨 (예약 시 인원 수만큼 재고에서 배정)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "souvenir_item_id")
    private Item souvenirItem;

    public void assignSouvenirItem(Item item) {
        this.souvenirItem = item;
    }

    public void changeDefaultVehicleOption(ProductOption option) {
        if (option == null || getId() == null || option.getProduct() == null
                || !getId().equals(option.getProduct().getId())
                || option.getOptionType() != ProductOptionType.VEHICLE) {
            throw new IllegalArgumentException("해당 상품의 차량 옵션만 기본 교통수단으로 지정할 수 있습니다.");
        }
        this.defaultVehicleOption = option;
    }


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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ProductStatus status;

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
            ProductStatus status,
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
        this.status = java.util.Objects.requireNonNull(status, "상품 상태가 필요합니다.");
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

    // 예약 신청,변경,취소 시 신청 인원 변경 (양수: 증가, 음수: 감소)
    public void changePeople(int delta) {
        int current = this.currentPeople == null ? 0 : this.currentPeople;
        this.currentPeople = Math.max(current + delta, 0);
    }

    // 신청 인원이 최소 인원 이상이 되면 출발 확정
    public void confirmDeparture() {
        if (this.status == ProductStatus.RECRUITING) {
            this.status = ProductStatus.CONFIRMED;
        }
    }

    // 취소로 최소 인원 밑이 되면 다시 모집 중
    public void reopenRecruiting() {
        if (this.status == ProductStatus.CONFIRMED) {
            this.status = ProductStatus.RECRUITING;
        }
    }

    // 모집 마감일까지 최소 인원 미달이면 출발 취소
    public void cancelDeparture() {
        this.status = ProductStatus.CANCELED;
    }

    //관리자 판매 상태 변경
    public void changeStatus(ProductStatus status) {
        if (status == null || status == ProductStatus.CONFIRMED || status == ProductStatus.CANCELED) {
            throw new IllegalArgumentException("변경할 수 없는 상품 상태입니다.");
        }
        this.status = status;
    }
}
