package com.mrworldthemetour.backend.admin;

import com.mrworldthemetour.backend.reservation.AdminReservationDto;
import com.mrworldthemetour.backend.reservation.AdminReservationService;
import com.mrworldthemetour.backend.reservation.ReservationChangeRequest;
import com.mrworldthemetour.backend.reservation.ReservationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// [신규] 관리자 예약 관리 API (/api/admin/** 는 SecurityConfig에서 ADMIN 권한 필요)
@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
public class AdminReservationController {
    private final AdminReservationService adminReservationService;

    @GetMapping
    public ResponseEntity<AdminReservationDto.PageResponse> search(
            @RequestParam(name = "productId", required = false) Long productId,
            @RequestParam(name = "status", required = false) ReservationStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(adminReservationService.search(productId, status, page, size));
    } //예약 목록, 필터

    @GetMapping("/{reservationId}")
    public ResponseEntity<AdminReservationDto.Detail> get(@PathVariable("reservationId") Long reservationId) {
        return ResponseEntity.ok(adminReservationService.get(reservationId));
    } //예약 상세 (예약자 이름, 연락처, 기념품 포함)

    @PatchMapping("/{reservationId}")
    public ResponseEntity<AdminReservationDto.Detail> change(
            @PathVariable("reservationId") Long reservationId,
            @RequestBody ReservationChangeRequest request) {
        return ResponseEntity.ok(adminReservationService.change(reservationId, request));
    } //등급, 숙소, 식사, 음료, 인원 수정

    @PatchMapping("/{reservationId}/status")
    public ResponseEntity<Void> changeStatus(
            @PathVariable("reservationId") Long reservationId,
            @Valid @RequestBody AdminReservationDto.StatusRequest request) {
        adminReservationService.changeStatus(reservationId, request.status());
        return ResponseEntity.noContent().build();
    } //확정 / 확정 대기 / 취소

    @PatchMapping("/{reservationId}/memo")
    public ResponseEntity<Void> memo(
            @PathVariable("reservationId") Long reservationId,
            @Valid @RequestBody AdminReservationDto.MemoRequest request) {
        adminReservationService.writeMemo(reservationId, request.memo());
        return ResponseEntity.noContent().build();
    } //관리자 메모

    @PostMapping("/{reservationId}/sms")
    public ResponseEntity<Void> sms(
            @PathVariable("reservationId") Long reservationId,
            @Valid @RequestBody AdminReservationDto.SmsRequest request) {
        adminReservationService.sendSms(reservationId, request.text());
        return ResponseEntity.noContent().build();
    } //안내 문자 발송
}
