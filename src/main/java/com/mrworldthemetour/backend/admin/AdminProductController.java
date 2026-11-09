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

    @PostMapping("/{productId}/options")
    public ResponseEntity<ProductDto.OptionResponse> addOption(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody ProductDto.OptionCreateRequest request) {
        return ResponseEntity.status(201)
                .body(productService.addOption(productId, request));
    } //여행 상품에 옵션 추가

}

