package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.product.Product;
import com.mrworldthemetour.backend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

//TODO 동시성: 여러 명이 동시에 예약해도 정원을 넘지 않게 상품 조회 시 잠금 (@Lock 비관적 락 또는 @Version)

@Service
@RequiredArgsConstructor
public class ReservationService {
    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final PriceService priceService;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ReservationCreateResponse create(Long userId, ReservationCreateRequest request) {
        if (request.productId() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "REQUIRED_VALUE_MISSING", "상품을 선택해 주세요.");
        }

        //상품 상태 확인
        Product product = findProduct(request.productId());
        validateReservable(product, request.people());

        //금액 계산
        PriceResponse price = priceService.calculate(request.toPriceRequest(),userId);

        //예약 생성 (테마 기념품 자동 배정)
        //Long souvenirItemId = product.getTheme().getItem().getId();

        Reservation reservation = Reservation.builder()
                .reservationCode(generateCode())
                .userId(userId)
                .productId(product.getId())
                .productGradeId(findGradeId(price))
                .itemId(null)//TODO Item 엔티티 생기면 테마 기념품 ID
                .people(request.people())
                .vehicle(findVehicleName(price))
                .baseAmount(price.baseAmount())
                .optionAmount(price.optionAmount())
                .discountAmount(price.discountAmount())
                .finalAmount(price.finalAmount())
                .paymentMethod(request.paymentMethod())
                .build();

        replaceOptions(reservation, price);

        Reservation saved = reservationRepository.save(reservation);

        //신청 인원 증가
        product.changePeople(request.people());

        //TODO 기념품 재고 차감: 테마 기념품을 인원 수만큼, 재고 부족해도 예약은 진행
        //TODO 출발 확정: 상품 전체 인원 >= min_people(3명)이면 출발 확정 + 예약자 전원 문자

        return toResponse(saved);
    }

    //출발전, 출발 확정 후 계속 예약 가능
    private static final Set<Product.ProductStatus> RESERVABLE=
            EnumSet.of(Product.ProductStatus.RECRUITING, Product.ProductStatus.CONFIRMED);

    private void validateReservable(Product product, Integer people) {
        if (!RESERVABLE.equals(product.getStatus())) {
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

    private Long findGradeId(PriceResponse price) {
        for (PriceResponse.PriceItem item : price.items()) {
            if (item.type() == OptionType.GRADE) {
                return item.sourceId();
            }
        }
        return null;
    }

    //선택한 차량 이름
    private String findVehicleName(PriceResponse price) {
        for (PriceResponse.PriceItem item : price.items()) {
            if (item.type() == OptionType.VEHICLE) {
                return item.name();
            }
        }
        return null;
    }

    //옵션 변경하기
    private void replaceOptions(Reservation reservation, PriceResponse price) {
        reservation.clearOptions();
        for (PriceResponse.PriceItem item : price.items()) {
            reservation.addOption(new ReservationOption(
                    item.type(), item.sourceId(), item.name(), item.quantity(), item.amount()));
        }
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

    //출발 상태 평가(신청 인원 3명 이상이면 출발 확정)
    private void reevaluateDeparture(Product product){
        int min=product.getMinPeople()==null? 3: product.getMinPeople();
        int current=product.getCurrentPeople()==null? 0:product.getCurrentPeople();

        if(product.getStatus() == Product.ProductStatus.RECRUITING && current >= min){
            //product depart confirm이라는것을 알수 잇어야함
            eventPublisher.publishEvent(new DepartureConfirmedEvent(product.getId()));
        }
        else if(product.getStatus() == Product.ProductStatus.CONFIRMED && current < min){
            //취소되어야하나?
        }
    }


    //내 예약 목록(팝업용)
    @Transactional(readOnly = true)
    public List<ReservationListResponse> getMyReservation(Long userId){
        List<Reservation>list=reservationRepository.findByUserIdOrderByReservedAtDesc(userId);

        List<Long> productId=list.stream().map(Reservation::getProductId).distinct().toList();
        Map<Long,Product> products=new HashMap<>();
        for(Product p: productRepository.findAllById(productId)){
            products.put(p.getId(),p);
        }

        return list.stream()
                .map(r->toListResponse(r,products.get(r.getProductId())))
                .toList();
    }

    private ReservationListResponse toListResponse(Reservation r, Product product) {
        return new ReservationListResponse(
                r.getId(),
                r.getReservationCode(),
                r.getProductId(),
                product == null ? null : product.getTitle(),
                product == null ? null : product.getDepartureDate(),
                product == null ? null : product.getReturnDate(),
                findGradeName(r),
                r.getPeople(),
                r.getFinalAmount(),
                r.getStatus(),
                r.getReservedAt()
        );
    }

    // 예약 당시 등급 이름 (옵션 스냅샷의 GRADE 항목)
    private String findGradeName(Reservation r) {
        for (ReservationOption o : r.getOptions()) {
            if (o.getOptionType() == OptionType.GRADE) {
                return o.getOptionName();
            }
        }
        return null;
    }

    //예약 상세
    @Transactional(readOnly = true)
    public ReservationDetailResponse detailListReservation(Long userId,Long reservationId){
        Reservation reservation=findMyReservation(userId, reservationId);
        Product product=findProduct(reservation.getProductId());

        List<ReservationOption> option=reservation.getOptions();
        List<ReservationDetailResponse.OptionResponse> options=option.stream()
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
                findGradeName(reservation),
                reservation.getVehicle(),
                options,
                reservation.getBaseAmount(),
                reservation.getOptionAmount(),
                reservation.getDiscountAmount(),
                reservation.getFinalAmount(),
                reservation.getPaymentMethod()
        );
    }

    //예약 변경(호텔, 차량, 식사, 인원)
    @Transactional
    public ReservationCreateResponse change(Long userId, Long reservationId, ReservationChangeRequest request) {
        Reservation reservation = findMyReservation(userId, reservationId);

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BusinessException(HttpStatus.CONFLICT,
                    "CANNOT_CHANGE", "확정 대기 상태의 예약만 변경할 수 있습니다.");
        }

        Product product = findProduct(reservation.getProductId());
        validateBeforeDeadline(product, "RECRUITMENT_CLOSED", "모집 마감 후에는 변경할 수 없습니다.");

        int newPeople = request.people() == null ? reservation.getPeople() : request.people();
        int delta = newPeople - reservation.getPeople();
        validateSeats(product, delta);

        PriceResponse price = priceService.calculate(
                request.toPriceRequest(product.getId(), newPeople),userId);

        replaceOptions(reservation, price);
        reservation.changeSelection(findGradeId(price), newPeople, findVehicleName(price),
                price.baseAmount(), price.optionAmount(), price.discountAmount(), price.finalAmount());

        product.changePeople(delta);

        //TODO 기념품 재고: 인원 차이(delta)만큼 차감 또는 복구
        //TODO: 출발 상태 재평가: 인원이 늘어 확정 기준을 넘었거나, 줄어든 경우
//        if(product.getCurrentPeople()>product.getMaxPeople()){
//        }
//        if(product.getCurrentPeople()<product.getMinPeople()){
//        }

        return toResponse(reservation);
    }

    //예약 취소
    @Transactional
    public void cancel(Long userId, Long reservationId) {
        Reservation reservation = findMyReservation(userId, reservationId);

        Product product = findProduct(reservation.getProductId());
        validateBeforeDeadline(product, "CANNOT_CANCEL", "모집 마감일이 지나 취소할 수 없습니다.");

        reservation.cancel();
        product.changePeople(-reservation.getPeople());

        //TODO 기념품 재고 복구: 실제로 배정했던 수량만 (UC10)
        //TODO 출발 상태 재평가: 인원이 min_people 밑으로 내려가면 다시 모집 중 (UC11)
    }

}