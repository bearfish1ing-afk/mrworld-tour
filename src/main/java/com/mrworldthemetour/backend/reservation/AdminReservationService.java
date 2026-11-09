package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.inventory.Item;
import com.mrworldthemetour.backend.inventory.ItemRepository;
import com.mrworldthemetour.backend.product.Product;
import com.mrworldthemetour.backend.product.ProductRepository;
import com.mrworldthemetour.backend.sms.SmsService;
import com.mrworldthemetour.backend.user.User;
import com.mrworldthemetour.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

//관리자 예약 관리
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReservationService {
    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ReservationService reservationService;
    private final SmsService smsService;
    private final ApplicationEventPublisher eventPublisher;

    public AdminReservationDto.PageResponse search(Long productId, ReservationStatus status, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PAGE",
                    "페이지는 0 이상, 페이지 크기는 1~100이어야 합니다.");
        }
        Page<Reservation> result = reservationRepository.searchForAdmin(productId, status,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reservedAt")));

        List<Reservation> list = result.getContent();
        Map<Long, Product> products = productRepository.findAllById(
                        list.stream().map(Reservation::getProductId).distinct().toList())
                .stream().collect(Collectors.toMap(Product::getId, Function.identity()));
        Map<Long, User> users = userRepository.findAllById(
                        list.stream().map(Reservation::getUserId).distinct().toList())
                .stream().collect(Collectors.toMap(User::getId, Function.identity()));

        return new AdminReservationDto.PageResponse(
                list.stream().map(r -> toSummary(r, products.get(r.getProductId()), users.get(r.getUserId()))).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    public AdminReservationDto.Detail get(Long reservationId) {
        Reservation r = find(reservationId);
        Product product = productRepository.findById(r.getProductId()).orElse(null);
        User user = userRepository.findById(r.getUserId()).orElse(null);
        String souvenirName = r.getSouvenirItemId() == null ? null
                : itemRepository.findById(r.getSouvenirItemId()).map(Item::getItemName).orElse(null);

        return new AdminReservationDto.Detail(
                toSummary(r, product, user),
                r.getVehicle(),
                r.getOptions().stream().map(ReservationDetailResponse.OptionResponse::from).toList(),
                souvenirName,
                r.souvenirQuantityOrZero(),
                r.getBaseAmount(),
                r.getOptionAmount(),
                r.getDiscountAmount(),
                r.getPaymentMethod(),
                r.getAdminMemo()
        );
    }

    // 관리자 옵션 변경 (등급, 숙소, 식사, 차량, 음료, 인원) - 마감일 이후에도 가능
    @Transactional
    public AdminReservationDto.Detail change(Long reservationId, ReservationChangeRequest request) {
        Reservation r = find(reservationId);
        reservationService.applyChange(r, lockProduct(r.getProductId()), request);
        return get(reservationId);
    }

    @Transactional
    public void changeStatus(Long reservationId, ReservationStatus target) {
        Reservation r = find(reservationId);
        if (r.getStatus() == target) {
            return;
        }
        switch (target) {
            case CANCELED -> reservationService.cancelInternal(r, lockProduct(r.getProductId()));
            case CONFIRMED -> {
                r.confirm(); // 수동 확정 (예외 상황용) + 확정 문자
                eventPublisher.publishEvent(new DepartureConfirmedEvent(r.getProductId(), List.of(r.getId())));
            }
            case PENDING -> r.revertToPending();
        }
    }

    @Transactional
    public void writeMemo(Long reservationId, String memo) {
        find(reservationId).writeAdminMemo(memo);
    }

    public void sendSms(Long reservationId, String text) {
        Reservation r = find(reservationId);
        User user = userRepository.findById(r.getUserId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND", "예약자를 찾을 수 없습니다."));
        smsService.sendText(user.getPhoneNum(), "[미스터월드] " + text);
    }

    private AdminReservationDto.Summary toSummary(Reservation r, Product p, User u) {
        return new AdminReservationDto.Summary(
                r.getId(), r.getReservationCode(), r.getProductId(),
                p == null ? null : p.getTitle(),
                p == null ? null : p.getDepartureDate(),
                p == null ? null : p.getReturnDate(),
                u == null ? null : u.getName(),
                u == null ? null : u.getPhoneNum(),
                r.getPeople(), r.gradeName(), r.getFinalAmount(), r.getStatus(), r.getReservedAt());
    }

    private Reservation find(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "RESERVATION_NOT_FOUND", "존재하지 않는 예약입니다."));
    }

    private Product lockProduct(Long productId) {
        return productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다."));
    }
}
