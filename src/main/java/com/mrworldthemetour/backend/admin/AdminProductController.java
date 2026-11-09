package com.mrworldthemetour.backend.admin;

import com.mrworldthemetour.backend.product.ProductDto;
import com.mrworldthemetour.backend.product.ProductService;
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

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody ProductDto.CreateRequest request) {
        return ResponseEntity.status(201).body(Map.of("productId", productService.createProduct(request)));
    } //여행 상품 생성

    @PatchMapping("/{productId}/grades/{gradeId}/default-options")
    public ResponseEntity<Void> changeGradeDefaults(@PathVariable("productId") Long productId,
            @PathVariable("gradeId") Long gradeId,
            @Valid @RequestBody ProductDto.DefaultGradeOptionsRequest request) {
        productService.changeGradeDefaults(productId, gradeId, request);
        return ResponseEntity.noContent().build();
    } //상품 선택해 등급별 기본 호텔, 식사 변경 (너무 복잡할 경우 구현 포기)

    @PostMapping("/{productId}/options")
    public ResponseEntity<ProductDto.OptionResponse> addOption(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody ProductDto.OptionCreateRequest request) {
        return ResponseEntity.status(201)
                .body(productService.addOption(productId, request));
    } //여행 상품에 옵션 추가

}

    /*
    호텔 정보, 교통수단, 식사 옵션 모두 ProductOption으로 처리하고 직원이 직접 지정하는 구조,
    직원이 Option 생성하지 않고 Option 데이터는 사전에 입력, 직원은 상품의 option 지정만 하는 구조로 바꿀지 논의 필요
    */