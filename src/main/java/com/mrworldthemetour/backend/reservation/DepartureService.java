package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.product.Product;
import com.mrworldthemetour.backend.product.ProductRepository;
import com.mrworldthemetour.backend.product.ProductStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;

// [신규] 출발 확정 / 재모집 / 출발 취소 처리
@Service
@RequiredArgsConstructor
public class DepartureService {
    private static final int DEFAULT_MIN_PEOPLE = 3;

    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final SouvenirService souvenirService;
    private final ApplicationEventPublisher eventPublisher;

    // 신청 인원이 최소 인원 이상이면 출발 확정 + 문자, 밑으로 내려가면 다시 모집 중
    @Transactional(propagation = Propagation.MANDATORY)
    public void reevaluate(Product product) {
        int min = product.getMinPeople() == null ? DEFAULT_MIN_PEOPLE : product.getMinPeople();
        int current = product.getCurrentPeople() == null ? 0 : product.getCurrentPeople();

        if (product.getStatus() == ProductStatus.RECRUITING && current >= min) {
            product.confirmDeparture();
            List<Reservation> pendings =
                    reservationRepository.findByProductIdAndStatus(product.getId(), ReservationStatus.PENDING);
            pendings.forEach(Reservation::confirm);
            eventPublisher.publishEvent(new DepartureConfirmedEvent(
                    product.getId(), pendings.stream().map(Reservation::getId).toList()));

        } else if (product.getStatus() == ProductStatus.CONFIRMED && current < min) {
            product.reopenRecruiting();
            reservationRepository.findByProductIdAndStatus(product.getId(), ReservationStatus.CONFIRMED)
                    .forEach(Reservation::revertToPending);
        }
    }

    // 이미 출발 확정된 상품에 새로 들어온 예약은 바로 확정 + 문자
    @Transactional(propagation = Propagation.MANDATORY)
    public void confirmIfDepartureConfirmed(Product product, Reservation reservation) {
        if (product.getStatus() == ProductStatus.CONFIRMED
                && reservation.getStatus() == ReservationStatus.PENDING) {
            reservation.confirm();
            eventPublisher.publishEvent(new DepartureConfirmedEvent(product.getId(), List.of(reservation.getId())));
        }
    }

    // 모집 마감 스케줄러용: 마감일이 지났는데 아직 모집 중(최소 인원 미달)이면 출발 취소
    // 상품마다 별도 트랜잭션 → 한 상품 실패가 다른 상품에 영향 없음
    @Transactional
    public boolean cancelIfUnderfilled(Long productId) {
        Product product = lockProduct(productId);
        // 조회와 잠금 사이에 인원이 차서 확정됐을 수 있으므로 다시 확인
        if (product.getStatus() != ProductStatus.RECRUITING
                || product.getDeadline() == null
                || !LocalDateTime.now().isAfter(product.getDeadline())) {
            return false;
        }
        cancelAll(product, "최소 출발 인원 미달로");
        return true;
    }

    // 관리자 출발 취소: 남은 예약 일괄 취소 + 문자, 취소된 예약 수 반환
    @Transactional
    public int cancelByAdmin(Long productId) {
        Product product = lockProduct(productId);
        if (product.getStatus() == ProductStatus.CANCELED || product.getStatus() == ProductStatus.COMPLETED) {
            throw new BusinessException(HttpStatus.CONFLICT, "CANNOT_CANCEL_DEPARTURE",
                    "이미 취소되었거나 완료된 상품입니다.");
        }
        return cancelAll(product, "여행사 사정으로");
    }

    private int cancelAll(Product product, String reason) {
        List<Reservation> targets = reservationRepository.findByProductIdAndStatusIn(
                product.getId(), EnumSet.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED));

        for (Reservation r : targets) {
            r.cancel();
            product.changePeople(-r.getPeople());
            souvenirService.adjust(r, product.getTheme(), 0); // 배정했던 기념품 복구
        }
        product.cancelDeparture();

        eventPublisher.publishEvent(new DepartureCanceledEvent(
                product.getId(), targets.stream().map(Reservation::getId).toList(), reason));
        return targets.size();
    }

    private Product lockProduct(Long productId) {
        return productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다."));
    }
}
