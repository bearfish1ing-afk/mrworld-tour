package com.example.mrworldthemetour.backend.service;

import com.example.mrworldthemetour.backend.dto.PriceRequest;
import com.example.mrworldthemetour.backend.dto.PriceResponse;
import com.example.mrworldthemetour.backend.dto.ReservationCreateRequest;
import com.example.mrworldthemetour.backend.dto.ReservationCreateResponse;
import com.example.mrworldthemetour.backend.entity.*;
import com.example.mrworldthemetour.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

//TODO: 기념품 재고 차감 (재고 부족해도 예약은 진행)
//TODO: 신청 인원 3명 이상이면 출발 확정 + 예약자 전원에게 문자

@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ReservationRepository reservationRepository;
    //private final ProductRepository productRepository;
    private final PriceService priceService;

    @Transactional
    public ReservationCreateResponse create(ReservationCreateRequest request) {
        if (request.userId() == null) {
            throw new IllegalArgumentException("회원 정보가 없습니다.");
        }

        //상품 상태 확인
//        Product product = productRepository.findById(request.productId())
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다."));
//        validateReservable(product, request.people());

        //금액 계산
        PriceRequest priceRequest = new PriceRequest(
                request.productId(), request.productGradeId(), request.people(),
                request.hotelOptionId(), request.mealOptionId(), request.vehicleOptionId(),
                request.drinks());
        PriceResponse price = priceService.calculate(priceRequest);

        //예약 생성 (테마 기념품 자동 배정)
        //Long souvenirItemId = product.getTheme().getItem().getId();

        Reservation reservation = Reservation.builder()
                .reservationCode(generateCode())
                .userId(request.userId())
                .productId(product.getId())
                .productGradeId(request.productGradeId())
                .itemId(souvenirItemId)
                .people(request.people())
                .vehicle(findVehicleName(price))
                .baseAmount(price.baseAmount())
                .optionAmount(price.optionAmount())
                .discountAmount(price.discountAmount())
                .finalAmount(price.finalAmount())
                .paymentMethod(request.paymentMethod())
                .build();

        for (PriceResponse.PriceItem item : price.items()) {
            reservation.addOption(new ReservationOption(
                    item.type(), item.sourceId(), item.name(), item.quantity(), item.amount()));
        }

        Reservation saved = reservationRepository.save(reservation);

        //신청 인원 증가
        //product.increasePeople(request.people());

        //기념품 재고 차감
        // TODO inventoryService.allocate(souvenirItemId, request.people(), saved.getId());

        //TODO: 출발 확정(2,3명)

        return new ReservationCreateResponse(
                saved.getId(), saved.getReservationCode(), saved.getStatus(), saved.getFinalAmount());
    }

    //TODO: private void validateReservable(Product product, Integer people) {
//        상품 상태와 인원수 확인
//    }

    private String generateCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (reservationRepository.existsByReservationCode(code));
        return code;
    }

    //선택한 차량 이름
    private String findVehicleName(PriceResponse price) {
        for (PriceResponse.PriceItem item : price.items()) {
            if (item.type() == OptionType.VEHICLE) {
                return item.name();
            }
        }
        return null;
    }
}