package com.example.mrworldthemetour.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="reservation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    @Column(nullable = false,unique = true,length = 20)
    private String reservationCode;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Long productGradeId;

    private Long itemId;

    @Column(nullable = false)
    private Integer people;

    @Column(length = 50)
    private String vehicle;

    @Column(nullable = false)
    private Long baseAmount;

    @Column(nullable = false)
    private Long optionAmount;

    @Column(nullable = false)
    private Long discountAmount;

    @Column(nullable = false)
    private Long finalAmount;

    @Column(length = 30)
    private String paymentMethod;

    @Column(length = 1000)
    private String adminMemo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    @Column(nullable = false)
    private LocalDateTime reservedAt;

    @OneToMany(mappedBy = "reservation",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<ReservationOption> options=new ArrayList<>();

    @Builder
    private Reservation(String reservationCode, Long userId, Long productId, Long productGradeId,
                        Long itemId,Integer people, String vehicle, Long baseAmount, Long optionAmount,
                        Long discountAmount, Long finalAmount, String paymentMethod) {
        this.reservationCode = reservationCode;
        this.userId = userId;
        this.productId = productId;
        this.productGradeId = productGradeId;
        this.itemId=itemId;
        this.people = people;
        this.vehicle = vehicle;
        this.baseAmount = baseAmount;
        this.optionAmount = optionAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.paymentMethod = paymentMethod;
        this.status =ReservationStatus.PENDING;
        this.reservedAt = LocalDateTime.now();
    }

    public void addOption(com.example.mrworldthemetour.backend.entity.ReservationOption option){
        options.add(option);
        option.setReservation(this);
    }

    public void cancel(){
        if(status== ReservationStatus.CANCELED){
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }
        this.status= ReservationStatus.CANCELED;
    }

    public void confirm(){
//        if(status==ReservationStatus.CANCELED){
//            throw new IllegalStateException("취소된 예약은 확정하지 못합니다.");
//        }
        this.status= ReservationStatus.CONFIRMED;
    }
}
