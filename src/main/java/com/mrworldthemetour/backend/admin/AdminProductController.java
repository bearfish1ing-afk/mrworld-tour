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
    } //상품 생성

    @PatchMapping("/{productId}/grades/{gradeId}/default-options")
    public ResponseEntity<Void> changeGradeDefaults(@PathVariable("productId") Long productId,
            @PathVariable("gradeId") Long gradeId,
            @Valid @RequestBody ProductDto.DefaultGradeOptionsRequest request) {
        productService.changeGradeDefaults(productId, gradeId, request);
        return ResponseEntity.noContent().build();
    } //등급별 기본 호텔, 식사 변경

    @PostMapping("/{productId}/options")
    public ResponseEntity<ProductDto.OptionResponse> addOption(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody ProductDto.OptionCreateRequest request) {
        return ResponseEntity.status(201)
                .body(productService.addOption(productId, request));
    } //상품에 옵션 추가

}
