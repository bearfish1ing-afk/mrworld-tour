package com.mrworldthemetour.backend.product;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    //기본 상품 목록 조회
    @GetMapping
    public ResponseEntity<ProductDto.PageResponse> getProducts(
            @RequestParam(name = "page", defaultValue = "0")
            int page,

            @RequestParam(name = "size", defaultValue = "20")
            int size
    ) {
        return ResponseEntity.ok(
                productService.getProducts(
                        null, // themeId
                        null, // departureFrom
                        null, // departureTo
                        null, // minPrice
                        null, // maxPrice
                        null, // keyword
                        page,
                        size
                )
        );
    }

    //조건별 상품 검색
    @GetMapping("/search")
    public ResponseEntity<ProductDto.PageResponse> searchProducts(
            @RequestParam(name = "themeId", required = false)
            Long themeId,

            @RequestParam(name = "departureFrom", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate departureFrom,

            @RequestParam(name = "departureTo", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate departureTo,

            @RequestParam(name = "minPrice", required = false)
            Long minPrice,

            @RequestParam(name = "maxPrice", required = false)
            Long maxPrice,

            @RequestParam(name = "keyword", required = false)
            String keyword,

            @RequestParam(name = "page", defaultValue = "0")
            int page,

            @RequestParam(name = "size", defaultValue = "20")
            int size
    ) {
        return ResponseEntity.ok(
                productService.getProducts(
                        themeId,
                        departureFrom,
                        departureTo,
                        minPrice,
                        maxPrice,
                        keyword,
                        page,
                        size
                )
        );
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDto.DetailResponse> getProduct(
            @PathVariable("productId") Long productId
    ) {
        return ResponseEntity.ok(
                productService.getProduct(productId)
        );
    }
}