package com.mrworldthemetour.backend.reservation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final PriceService priceService;
    private final ReservationService reservationService;

    //예상 금액 계산
    @PostMapping("/price")
    public ResponseEntity<PriceResponse> calculatePrice(
            Authentication authentication,
            @RequestBody PriceRequest request){
        Long userId = authentication == null ? null : Long.valueOf(authentication.getName());
        return ResponseEntity.ok(priceService.calculate(request,userId));
    }

    //예약신청
    @PostMapping()
    public ResponseEntity<ReservationCreateResponse> create(
            Authentication authentication,
            @RequestBody ReservationCreateRequest request
    ){
        Long userId=Long.valueOf(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.create(userId, request));
    }

    //예약 목록
    @GetMapping("/me")
    public List<ReservationListResponse> getMy(
            Authentication authentication
    ){
        Long userId=Long.valueOf(authentication.getName());
        return (reservationService.getMyReservation(userId));
    }

    //예약 상세
    @GetMapping("/me/{reservationId}")
    public ResponseEntity<ReservationDetailResponse> getMyReservationDetail(
            Authentication authentication,
            @PathVariable Long reservationId
    ){
        Long userId=Long.valueOf(authentication.getName());
        return ResponseEntity.ok(reservationService.detailListReservation(userId,reservationId));
    }


    //예약 변경(호텔, 차량, 식사, 인원)
    @PatchMapping("/{reservationId}")
    public ResponseEntity<ReservationCreateResponse> change(
            Authentication authentication,
            @PathVariable Long reservationId,
            @RequestBody ReservationChangeRequest request
    ){
        Long userId=Long.valueOf(authentication.getName());
        return ResponseEntity.ok(reservationService.change(userId, reservationId, request));
    }

    //예약 취소
    @PatchMapping("/{reservationId}/cancel")
    public ResponseEntity<Void> cancel(
            Authentication authentication,
            @PathVariable Long reservationId
    ){
        Long userId=Long.valueOf(authentication.getName());
        reservationService.cancel(userId, reservationId);
        return ResponseEntity.noContent().build();
    }
}