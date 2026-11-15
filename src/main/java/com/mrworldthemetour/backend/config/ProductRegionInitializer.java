package com.mrworldthemetour.backend.config;

import com.mrworldthemetour.backend.product.Product;
import com.mrworldthemetour.backend.product.ProductRegion;
import com.mrworldthemetour.backend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// 대륙(region) 컬럼 추가 전에 등록된 상품의 대륙을 국가명으로 채움
// 국가명으로 알 수 없는 상품은 비워 두고 관리자 화면에서 지정
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductRegionInitializer implements ApplicationRunner {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int filled = 0;
        int unknown = 0;
        for (Product product : productRepository.findByRegionIsNull()) {
            ProductRegion region = ProductRegion.guessFromCountry(product.getCountry());
            if (region == null) {
                unknown++;
                continue;
            }
            product.changeRegion(region);
            filled++;
        }
        if (filled > 0 || unknown > 0) {
            log.info("상품 대륙 채움: {}건, 국가명으로 알 수 없어 미지정: {}건 (관리자 화면에서 지정)", filled, unknown);
        }
    }
}
