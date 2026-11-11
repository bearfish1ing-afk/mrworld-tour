package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String reservationCode;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Long productGradeId;

    //배정된 기념품 물품
    @Column(name = "item_id")
    private Long souvenirItemId;

    //실제 배정된 기념품 수량
    @Column(name = "souvenir_quantity")
    private Integer souvenirQuantity;

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

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationOption> options = new ArrayList<>();

    @Builder
    private Reservation(String reservationCode, Long userId, Long productId, Long productGradeId,
                        Integer people, String vehicle, Long baseAmount, Long optionAmount,
                        Long discountAmount, Long finalAmount, String paymentMethod) {
        this.reservationCode = reservationCode;
        this.userId = userId;
        this.productId = productId;
        this.productGradeId = productGradeId;
        this.people = people;
        this.vehicle = vehicle;
        this.baseAmount = baseAmount;
        this.optionAmount = optionAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.paymentMethod = paymentMethod;
        this.souvenirQuantity = 0;
        this.status = ReservationStatus.PENDING;
        this.reservedAt = LocalDateTime.now();
    }

    public void addOption(ReservationOption option) {
        options.add(option);
        option.setReservation(this);
    }

    public void clearOptions() {
        options.clear();
    }

    public void cancel() {
        if (status == ReservationStatus.CANCELED) {
            throw conflict("ALREADY_CANCELED", "이미 취소된 예약입니다.");
        }
        this.status = ReservationStatus.CANCELED;
    }

    public void confirm() {
        if (status == ReservationStatus.CANCELED) {
            throw conflict("CANNOT_CONFIRM", "취소된 예약은 확정할 수 없습니다.");
        }
        this.status = ReservationStatus.CONFIRMED;
    }

    //상품 인원이 최소 인원 밑으로 내려갈 경우, 다시 확정 대기
    public void revertToPending() {
        if (status == ReservationStatus.CANCELED) {
            throw conflict("CANNOT_REVERT", "취소된 예약은 되돌릴 수 없습니다.");
        }
        this.status = ReservationStatus.PENDING;
    }

    //마감일 이전에 옵션 변경 가능 (서비스에서 마감일 검사)
    public void changeSelection(Long productGradeId, Integer people, String vehicle,
                                Long baseAmount, Long optionAmount,
                                Long discountAmount, Long finalAmount) {
        if (status == ReservationStatus.CANCELED) {
            throw conflict("CANNOT_CHANGE", "취소된 예약은 변경할 수 없습니다.");
        }
        this.productGradeId = productGradeId;
        this.people = people;
        this.vehicle = vehicle;
        this.baseAmount = baseAmount;
        this.optionAmount = optionAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
    }
    public void assignSouvenir(Long itemId, int quantity) {
        this.souvenirItemId = itemId;
        this.souvenirQuantity = quantity;
    }

    public int souvenirQuantityOrZero() {
        return souvenirQuantity == null ? 0 : souvenirQuantity;
    }

    public void writeAdminMemo(String memo) {
        this.adminMemo = (memo == null || memo.isBlank()) ? null : memo.strip();
    }

    // 예약 당시 등급 이름
    public String gradeName() {
        for (ReservationOption o : options) {
            if (o.getOptionType() == OptionType.GRADE) {
                return o.getOptionName();
            }
        }
        return null;
    }

    private static BusinessException conflict(String code, String message) {
        return new BusinessException(HttpStatus.CONFLICT, code, message);
    }
}
