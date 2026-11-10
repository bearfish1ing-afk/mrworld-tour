package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.product.Product;
import com.mrworldthemetour.backend.product.ProductGradeRepository;
import com.mrworldthemetour.backend.product.ProductRepository;
import com.mrworldthemetour.backend.product.ProductStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    // 모집 중, 출발 확정 후에도 정원/마감 전이면 예약 가능
    private static final Set<ProductStatus> RESERVABLE =
            EnumSet.of(ProductStatus.RECRUITING, ProductStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final PriceService priceService;
    private final DepartureService departureService;
    private final SouvenirService souvenirService;
    private final ProductGradeRepository productGradeRepository; // 새 등급의 기본 음료 조회 (final 필수: 생성자 주입)

    //예약 신청
    @Transactional
    public ReservationCreateResponse create(Long userId, ReservationCreateRequest request) {
        if (request.productId() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "REQUIRED_VALUE_MISSING", "상품을 선택해 주세요.");
        }

        Product product = lockProduct(request.productId()); // 동시 예약 정원 초과 방지
        validateReservable(product, request.people());

        //금액 계산
        PriceResponse price = priceService.calculate(request.toPriceRequest(), userId);

        Reservation reservation = Reservation.builder()
                .reservationCode(generateCode())
                .userId(userId)
                .productId(product.getId())
                .productGradeId(findSourceId(price, OptionType.GRADE))
                .people(request.people())
                .vehicle(findName(price, OptionType.VEHICLE))
                .baseAmount(price.baseAmount())
                .optionAmount(price.optionAmount())
                .discountAmount(price.discountAmount())
                .finalAmount(price.finalAmount())
                .paymentMethod(request.paymentMethod())
                .build();
        replaceOptions(reservation, price);
        Reservation saved = reservationRepository.save(reservation);

        product.changePeople(saved.getPeople());                              //신청 인원 증가
        souvenirService.adjust(saved, product.getSouvenirItem(), saved.getPeople());  //기념품 재고 배정
        departureService.reevaluate(product);                                 //3명 이상이면 출발 확정 + 문자
        departureService.confirmIfDepartureConfirmed(product, saved);         //이미 확정된 상품이면 바로 확정

        return toResponse(saved);
    }

    //예약 변경 고객
    @Transactional
    public ReservationCreateResponse change(Long userId, Long reservationId, ReservationChangeRequest request) {
        Reservation reservation = findMyReservation(userId, reservationId);
        Product product = lockProduct(reservation.getProductId());
        validateBeforeDeadline(product, "RECRUITMENT_CLOSED", "모집 마감 후에는 변경할 수 없습니다.");
        return applyChange(reservation, product, request);
    }

    // 고객/관리자 공통 변경 로직
    @Transactional
    public ReservationCreateResponse applyChange(Reservation reservation, Product product,
                                                 ReservationChangeRequest request) {
        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new BusinessException(HttpStatus.CONFLICT, "CANNOT_CHANGE", "취소된 예약은 변경할 수 없습니다.");
        }
        if (product.getStatus() == ProductStatus.CANCELED) {
            throw new BusinessException(HttpStatus.CONFLICT, "CANNOT_CHANGE", "출발 취소된 상품입니다.");
        }

        int newPeople = request.people() == null ? reservation.getPeople() : request.people();
        int delta = newPeople - reservation.getPeople();
        validateSeats(product, delta);

        // 요청에 없는 항목은 현재 선택 유지 (할인은 예약자 기준)
        PriceRequest priceRequest = mergeWithCurrent(reservation, request, newPeople);
        PriceResponse price = priceService.calculate(priceRequest, reservation.getUserId());

        replaceOptions(reservation, price);
        reservation.changeSelection(findSourceId(price, OptionType.GRADE), newPeople,
                findName(price, OptionType.VEHICLE),
                price.baseAmount(), price.optionAmount(), price.discountAmount(), price.finalAmount());

        product.changePeople(delta);
        souvenirService.adjust(reservation, product.getSouvenirItem(), newPeople); //인원 차이만큼 배정/복구
        departureService.reevaluate(product);
        departureService.confirmIfDepartureConfirmed(product, reservation);

        return toResponse(reservation);
    }

    //예약 취소 고객
    @Transactional
    public void cancel(Long userId, Long reservationId) {
        Reservation reservation = findMyReservation(userId, reservationId);
        Product product = lockProduct(reservation.getProductId());
        validateBeforeDeadline(product, "CANNOT_CANCEL", "모집 마감일이 지나 취소할 수 없습니다.");
        cancelInternal(reservation, product);
    }

    // 고객/관리자 공통 취소 로직
    @Transactional
    public void cancelInternal(Reservation reservation, Product product) {
        reservation.cancel();                                       //이미 취소면 409
        product.changePeople(-reservation.getPeople());
        souvenirService.adjust(reservation, product.getSouvenirItem(), 0); //배정했던 만큼만 복구
        departureService.reevaluate(product);                       //최소 인원 밑이면 다시 모집 중
    }


    //내 예약 목록(로그인 팝업용, 최근 순)
    @Transactional(readOnly = true)
    public List<ReservationListResponse> getMyReservation(Long userId) {
        List<Reservation> list = reservationRepository.findByUserIdOrderByReservedAtDesc(userId);

        List<Long> productIds = list.stream().map(Reservation::getProductId).distinct().toList();
        Map<Long, Product> products = new HashMap<>();
        for (Product p : productRepository.findAllById(productIds)) {
            products.put(p.getId(), p);
        }

        return list.stream()
                .map(r -> toListResponse(r, products.get(r.getProductId())))
                .toList();
    }

    //예약 상세
    @Transactional(readOnly = true)
    public ReservationDetailResponse detailListReservation(Long userId, Long reservationId) {
        Reservation reservation = findMyReservation(userId, reservationId);
        Product product = findProduct(reservation.getProductId());

        List<ReservationDetailResponse.OptionResponse> options = reservation.getOptions().stream()
                .map(ReservationDetailResponse.OptionResponse::from)
                .toList();

        return new ReservationDetailResponse(
                reservation.getId(),
                reservation.getReservationCode(),
                reservation.getStatus(),
                reservation.getReservedAt(),
                reservation.getPeople(),
                product.getId(),
                product.getTitle(),
                product.getDepartureDate(),
                product.getReturnDate(),
                reservation.gradeName(),
                reservation.getVehicle(),
                options,
                reservation.getBaseAmount(),
                reservation.getOptionAmount(),
                reservation.getDiscountAmount(),
                reservation.getFinalAmount(),
                reservation.getPaymentMethod()
        );
    }

    private PriceRequest mergeWithCurrent(Reservation r, ReservationChangeRequest req, int people) {
        Long gradeId = req.productGradeId() != null ? req.productGradeId() : r.getProductGradeId();
        boolean gradeChanged = !gradeId.equals(r.getProductGradeId());

        return new PriceRequest(
                r.getProductId(),
                gradeId,
                people,
                req.hotelOptionId() != null ? req.hotelOptionId() : keepCustomized(r, OptionType.HOTEL, gradeChanged),
                req.mealOptionId() != null ? req.mealOptionId() : keepCustomized(r, OptionType.MEAL, gradeChanged),
                req.vehicleOptionId() != null ? req.vehicleOptionId() : keepCustomized(r, OptionType.VEHICLE, false),
                req.drinks() != null ? req.drinks() : currentExtraDrinks(r, gradeChanged ? gradeId : null) // [수정]
        );
    }

    // 고객이 직접 바꾼 옵션이면 유지
    // 등급이 바뀌면 호텔/식사는 새 등급 기본값으로 초기화
    private Long keepCustomized(Reservation r, OptionType type, boolean resetOnGradeChange) {
        if (resetOnGradeChange) {
            return null;
        }
        return r.getOptions().stream()
                .filter(o -> o.getOptionType() == type && !o.isDefaultSelected())
                .map(ReservationOption::getProductOptionId)
                .findFirst()
                .orElse(null);
    }

    // 등급이 바뀌었으면 새 등급의 기본 음료와 같은 것은 제외 (예: 그랜드+샴페인 추가 → 프리미엄: 샴페인 중복 결제 방지)
    private List<PriceRequest.DrinkRequest> currentExtraDrinks(Reservation r, Long newGradeId) {
        Long newDefaultDrinkId = newGradeId == null ? null
                : productGradeRepository.findByIdAndProduct_Id(newGradeId, r.getProductId())
                .map(g -> g.getDefaultDrinkOption() == null ? null : g.getDefaultDrinkOption().getId())
                .orElse(null);

        return r.getOptions().stream()
                .filter(o -> o.getOptionType() == OptionType.DRINK && !o.isDefaultSelected())
                .filter(o -> !o.getProductOptionId().equals(newDefaultDrinkId))
                .map(o -> new PriceRequest.DrinkRequest(o.getProductOptionId(), o.getQuantity()))
                .toList();
    }

    private void validateReservable(Product product, Integer people) {
        if (!RESERVABLE.contains(product.getStatus())) {
            throw new BusinessException(HttpStatus.CONFLICT,
                    "PRODUCT_NOT_RESERVABLE", "판매 중인 상품이 아닙니다.");
        }
        validateBeforeDeadline(product, "RECRUITMENT_CLOSED", "모집이 마감된 상품입니다.");
        validateSeats(product, people);
    }

    private void validateBeforeDeadline(Product product, String code, String message) {
        if (product.getDeadline() != null && LocalDateTime.now().isAfter(product.getDeadline())) {
            throw new BusinessException(HttpStatus.CONFLICT, code, message);
        }
    }

    private void validateSeats(Product product, Integer addPeople) {
        int current = product.getCurrentPeople() == null ? 0 : product.getCurrentPeople();
        if (addPeople != null && addPeople > 0 && product.getMaxPeople() != null
                && current + addPeople > product.getMaxPeople()) {
            throw new BusinessException(HttpStatus.CONFLICT,
                    "NOT_ENOUGH_SEATS", "남은 자리가 부족합니다.");
        }
    }

    private String generateCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (reservationRepository.existsByReservationCode(code));
        return code;
    }

    private Long findSourceId(PriceResponse price, OptionType type) {
        return price.items().stream().filter(i -> i.type() == type)
                .map(PriceResponse.PriceItem::sourceId).findFirst().orElse(null);
    }

    private String findName(PriceResponse price, OptionType type) {
        return price.items().stream().filter(i -> i.type() == type)
                .map(PriceResponse.PriceItem::name).findFirst().orElse(null);
    }

    private void replaceOptions(Reservation reservation, PriceResponse price) {
        reservation.clearOptions();
        for (PriceResponse.PriceItem item : price.items()) {
            reservation.addOption(new ReservationOption(
                    item.type(), item.sourceId(), item.name(), item.quantity(), item.amount(), item.isDefault()));
        }
    }

    private Product lockProduct(Long productId) {
        return productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다."));
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다."));
    }

    private Reservation findMyReservation(Long userId, Long reservationId) {
        return reservationRepository.findByIdAndUserId(reservationId, userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "RESERVATION_NOT_FOUND", "존재하지 않는 예약입니다."));
    }

    private ReservationCreateResponse toResponse(Reservation reservation) {
        return new ReservationCreateResponse(reservation.getId(), reservation.getReservationCode(),
                reservation.getStatus(), reservation.getFinalAmount());
    }

    private ReservationListResponse toListResponse(Reservation r, Product product) {
        return new ReservationListResponse(
                r.getId(),
                r.getReservationCode(),
                r.getProductId(),
                product == null ? null : product.getTitle(),
                product == null ? null : product.getDepartureDate(),
                product == null ? null : product.getReturnDate(),
                r.gradeName(),
                r.getPeople(),
                r.getFinalAmount(),
                r.getStatus(),
                r.getReservedAt()
        );
    }
}
