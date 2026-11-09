package com.mrworldthemetour.backend.admin;

import com.mrworldthemetour.backend.product.ProductDto;
import com.mrworldthemetour.backend.product.ProductService;
import com.mrworldthemetour.backend.product.ProductStatus;
import com.mrworldthemetour.backend.reservation.DepartureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {
    private final ProductService productService;
    private final DepartureService departureService; // [추가] 출발 취소 시 예약 일괄 취소

    // [추가]
    @GetMapping
    public ResponseEntity<ProductDto.PageResponse> list(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getProductsForAdmin(page, size));
    } //관리자 상품 목록 (비공개 상품 포함)

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody ProductDto.CreateRequest request) {
        return ResponseEntity.status(201).body(Map.of("productId", productService.createProduct(request)));
    } //여행 상품 생성

    // [추가]
    @PatchMapping("/{productId}/status")
    public ResponseEntity<Map<String, Integer>> changeStatus(@PathVariable("productId") Long productId,
            @Valid @RequestBody ProductDto.StatusChangeRequest request) {
        if (request.status() == ProductStatus.CANCELED) {
            // 출발 취소: 남은 예약 일괄 취소 + 기념품 복구 + 예약자 문자
            int canceled = departureService.cancelByAdmin(productId);
            return ResponseEntity.ok(Map.of("canceledReservations", canceled));
        }
        productService.changeStatus(productId, request.status());
        return ResponseEntity.noContent().build();
    } //판매 시작, 판매 중지, 출발 취소 등 상태 변경

    @PatchMapping("/{productId}/grades/{gradeId}/default-options")
    public ResponseEntity<Void> changeGradeDefaults(@PathVariable("productId") Long productId,
            @PathVariable("gradeId") Long gradeId,
            @Valid @RequestBody ProductDto.DefaultGradeOptionsRequest request) {
        productService.changeGradeDefaults(productId, gradeId, request);
        return ResponseEntity.noContent().build();
    } //상품 선택해 등급별 기본 호텔, 식사, 음료 변경

    @PostMapping("/{productId}/options")
    public ResponseEntity<ProductDto.OptionResponse> addOption(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody ProductDto.OptionCreateRequest request) {
        return ResponseEntity.status(201)
                .body(productService.addOption(productId, request));
    } //여행 상품에 옵션 추가

    // [추가]
    @PatchMapping("/themes/{themeId}/souvenir-item")
    public ResponseEntity<Void> changeThemeSouvenir(@PathVariable("themeId") Long themeId,
            @RequestBody ProductDto.SouvenirItemRequest request) {
        productService.changeThemeSouvenir(themeId, request.itemId());
        return ResponseEntity.noContent().build();
    } //테마 기념품(재고 물품) 연결
}
