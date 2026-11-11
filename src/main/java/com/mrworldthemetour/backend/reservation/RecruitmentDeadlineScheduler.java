package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.product.ProductRepository;
import com.mrworldthemetour.backend.product.ProductStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

//마감 시점에 출발 인원 미달 시 일괄 취소, 문자 전송
@Slf4j
@Component
@RequiredArgsConstructor
public class RecruitmentDeadlineScheduler {
    private final ProductRepository productRepository;
    private final DepartureService departureService;

    @Scheduled(cron = "0 */10 * * * *") // 10분마다
    public void cancelUnderfilledProducts() {
        List<Long> productIds = productRepository.findIdsByStatusAndDeadlineBefore(
                ProductStatus.RECRUITING, LocalDateTime.now());

        for (Long productId : productIds) {
            try {
                if (departureService.cancelIfUnderfilled(productId)) {
                    log.info("모집 마감 인원 미달로 출발 취소 productId={}", productId);
                }
            } catch (Exception e) {
                log.error("모집 마감 처리 실패 productId={}", productId, e);
            }
        }
    }
}
