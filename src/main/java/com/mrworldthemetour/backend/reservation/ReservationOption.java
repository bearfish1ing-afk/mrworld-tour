package com.mrworldthemetour.backend.reservation;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reservation_option")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReservationOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_option_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OptionType optionType;

    private Long productOptionId;

    @Column(nullable = false, length = 100)
    private String optionName;

    @Column(nullable = false)
    private Integer quantity;

    // 이 항목의 총 추가 금액 (단가 × 수량)
    @Column(nullable = false)
    private Long extraPrice;

    //기본 옵션인지(true), 고객이 바꾼 옵션인지
    @Column(name = "is_default")
    private Boolean defaultSelected;

    public ReservationOption(OptionType optionType, Long productOptionId, String optionName,
                             Integer quantity, Long extraPrice, boolean defaultSelected) {
        this.optionType = optionType;
        this.productOptionId = productOptionId;
        this.optionName = optionName;
        this.quantity = quantity;
        this.extraPrice = extraPrice;
        this.defaultSelected = defaultSelected;
    }

    public boolean isDefaultSelected() {
        return Boolean.TRUE.equals(defaultSelected);
    }

    void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }
}
