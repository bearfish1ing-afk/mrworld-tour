package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.product.Product;
import com.mrworldthemetour.backend.product.ProductRepository;
import com.mrworldthemetour.backend.sms.SmsService;
import com.mrworldthemetour.backend.user.User;
import com.mrworldthemetour.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

// [신규] 출발 확정 / 출발 취소 문자 발송
// 커밋된 뒤에만 발송 (롤백됐는데 문자가 나가는 것 방지)
@Slf4j
@Component
@RequiredArgsConstructor
public class DepartureSmsListener {
    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SmsService smsService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDepartureConfirmed(DepartureConfirmedEvent event) {
        send(event.productId(), event.reservationIds(), (user, product, r) ->
                "[미스터월드] " + user.getName() + "님, '" + product.getTitle() + "' ("
                        + product.getDepartureDate() + " 출발) 여행이 출발 확정되었습니다. 예약번호 "
                        + r.getReservationCode());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDepartureCanceled(DepartureCanceledEvent event) {
        send(event.productId(), event.reservationIds(), (user, product, r) ->
                "[미스터월드] " + user.getName() + "님, '" + product.getTitle() + "' ("
                        + product.getDepartureDate() + " 출발) 여행이 " + event.reason()
                        + " 출발 취소되었습니다. 예약번호 " + r.getReservationCode()
                        + ". 결제 금액 환불은 별도로 안내드리겠습니다.");
    }

    private void send(Long productId, List<Long> reservationIds, MessageBuilder builder) {
        if (reservationIds == null || reservationIds.isEmpty()) {
            return;
        }
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return;
        }

        List<Reservation> reservations = reservationRepository.findAllById(reservationIds);
        Map<Long, User> users = userRepository.findAllById(
                        reservations.stream().map(Reservation::getUserId).distinct().toList())
                .stream().collect(Collectors.toMap(User::getId, Function.identity()));

        for (Reservation r : reservations) {
            User user = users.get(r.getUserId());
            if (user == null) {
                continue;
            }
            try {
                smsService.sendText(user.getPhoneNum(), builder.build(user, product, r));
            } catch (Exception e) {
                // 한 명 실패해도 나머지는 계속 발송
                log.warn("안내 문자 발송 실패 reservationId={}", r.getId(), e);
            }
        }
    }

    @FunctionalInterface
    private interface MessageBuilder {
        String build(User user, Product product, Reservation reservation);
    }
}
