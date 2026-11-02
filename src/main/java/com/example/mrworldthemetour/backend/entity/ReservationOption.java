package com.example.mrworldthemetour.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name="reservation_option")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReservationOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_option_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id",nullable = false)
    private com.example.mrworldthemetour.backend.entity.Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 20)
    private OptionType optionType;

    private Long productOptionId;

    @Column(nullable = false,length = 100)
    private String optionName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Long extraPrice;

    public ReservationOption(OptionType optionType, Long productOptionId, String optionName, Integer quantity, Long extraPrice) {
        this.optionType = optionType;
        this.productOptionId=productOptionId;
        this.optionName = optionName;
        this.quantity=quantity;
        this.extraPrice = extraPrice;
    }

    void setReservation(com.example.mrworldthemetour.backend.entity.Reservation reservation) {
        this.reservation = reservation;
    }
}
