package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.product.*;
import com.mrworldthemetour.backend.reservation.PriceResponse.PriceItem;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriceService {
    private static final String PER_RESERVATION = "PER_RESERVATION";

    private final ProductRepository productRepository;
    private final ProductGradeRepository productGradeRepository;
    private final ProductOptionRepository productOptionRepository;
    private final CustomerLevelService customerLevelService;

    public PriceResponse calculate(PriceRequest request, Long userId) {
        if (request.productId() == null || request.productGradeId() == null) {
            throw badRequest("REQUIRED_VALUE_MISSING", "상품과 등급을 선택해 주세요.");
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다."));
        Theme theme = product.getTheme();

        //테마 인원 규칙
        int people = validatePeople(request.people(), theme);

        //테마 최소 등급
        ProductGrade grade = productGradeRepository
                .findByIdAndProduct_Id(request.productGradeId(), product.getId())
                .orElseThrow(() -> badRequest("INVALID_GRADE", "해당 상품의 등급이 아닙니다."));
        TravelGrade travelGrade = TravelGrade.from(grade.getGrade());
        if (theme != null && !travelGrade.satisfies(theme.getMinGrade())) {
            throw badRequest("GRADE_NOT_ALLOWED",
                    "이 테마는 " + theme.getMinGrade().getLabel() + " 이상만 선택할 수 있습니다.");
        }

        Map<Long, ProductOption> optionMap = productOptionRepository
                .findByProduct_IdOrderByOptionTypeAscIdAsc(product.getId()).stream()
                .collect(Collectors.toMap(ProductOption::getId, Function.identity()));

        List<PriceItem> items = new ArrayList<>();
        items.add(PriceItem.of(OptionType.GRADE, grade.getId(), travelGrade.getLabel(),
                people, nz(grade.getExtraPrice()), Boolean.TRUE.equals(grade.getDefaultGrade())));


        addSingle(items, optionMap, request.hotelOptionId(), ProductOptionType.HOTEL,
                idOf(grade.getDefaultHotelOption()), people);
        addSingle(items, optionMap, request.mealOptionId(), ProductOptionType.MEAL,
                idOf(grade.getDefaultMealOption()), people);
        addSingle(items, optionMap, request.vehicleOptionId(), ProductOptionType.VEHICLE,
                idOf(product.getDefaultVehicleOption()), people);

        //음료 가격
        addDefaultDrink(items, optionMap, idOf(grade.getDefaultDrinkOption()), people);
        addDrinks(items, optionMap, request.drinks());

        //합계
        long baseAmount = nz(product.getBasePrice()) * people;
        long optionAmount = items.stream().mapToLong(PriceItem::amount).sum();
        long subtotal = Math.max(baseAmount + optionAmount, 0L);
        CustomerLevel level = customerLevelService.levelCalculate(userId);
        long discountAmount = level.discount(subtotal);
        long finalAmount = subtotal - discountAmount;

        return new PriceResponse(baseAmount, items, optionAmount, discountAmount, finalAmount);
    }

    private int validatePeople(Integer people, Theme theme) {
        if (people == null || people < 1) {
            throw badRequest("INVALID_PEOPLE", "인원은 1명 이상이어야 합니다.");
        }
        if (theme != null && theme.getFixedPeople() != null && !theme.getFixedPeople().equals(people)) {
            throw badRequest("INVALID_PEOPLE", "이 테마는 " + theme.getFixedPeople() + "인 전용 상품입니다.");
        }
        return people;
    }

    //호텔, 식사, 차량 옵션 변경 시 차액 부과
    private void addSingle(List<PriceItem> items, Map<Long, ProductOption> optionMap, Long selectedId,
                           ProductOptionType type, Long defaultId, int people) {
        ProductOption defaultOption = defaultId == null ? null : optionMap.get(defaultId);
        if (defaultOption == null) {
            throw new BusinessException(HttpStatus.CONFLICT, "DEFAULT_OPTION_MISSING",
                    "상품의 기본 " + label(type) + " 옵션이 설정되지 않았습니다. 관리자에게 문의해 주세요.");
        }

        ProductOption chosen = selectedId == null ? defaultOption : optionMap.get(selectedId);
        if (chosen == null || chosen.getOptionType() != type) {
            throw badRequest("INVALID_OPTION", "해당 상품의 " + label(type) + " 옵션이 아닙니다.");
        }

        long diff = nz(chosen.getExtraPrice()) - nz(defaultOption.getExtraPrice());
        int quantity = PER_RESERVATION.equals(chosen.getApplyRule()) ? 1 : people; //요금 규칙 반영
        items.add(PriceItem.of(OptionType.valueOf(type.name()), chosen.getId(), chosen.getOptionName(),
                quantity, diff, chosen.getId().equals(defaultId)));
    }

    //기본 음료
    private void addDefaultDrink(List<PriceItem> items, Map<Long, ProductOption> optionMap,
                                 Long defaultDrinkId, int people) {
        if (defaultDrinkId == null) {
            return;
        }
        ProductOption drink = optionMap.get(defaultDrinkId);
        if (drink != null) {
            items.add(PriceItem.of(OptionType.DRINK, drink.getId(), drink.getOptionName(), people, 0L, true));
        }
    }

    //추가 음료
    private void addDrinks(List<PriceItem> items, Map<Long, ProductOption> optionMap,
                           List<PriceRequest.DrinkRequest> drinks) {
        if (drinks == null) {
            return;
        }
        Set<Long> seen = new HashSet<>();
        for (PriceRequest.DrinkRequest drink : drinks) {
            if (drink == null || drink.optionId() == null) {
                throw badRequest("INVALID_OPTION", "음료 옵션을 확인해 주세요.");
            }
            if (!seen.add(drink.optionId())) {
                throw badRequest("DUPLICATE_DRINK", "같은 음료가 중복으로 선택되었습니다.");
            }
            if (drink.quantity() == null || drink.quantity() < 1) {
                throw badRequest("INVALID_QUANTITY", "음료 수량은 1개 이상이어야 합니다.");
            }
            ProductOption option = optionMap.get(drink.optionId());
            if (option == null || option.getOptionType() != ProductOptionType.DRINK) {
                throw badRequest("INVALID_OPTION", "해당 상품의 음료 옵션이 아닙니다.");
            }
            items.add(PriceItem.of(OptionType.DRINK, option.getId(), option.getOptionName(),
                    drink.quantity(), nz(option.getExtraPrice()), false));
        }
    }

    private Long idOf(ProductOption option) {
        return option == null ? null : option.getId(); //지연 로딩 프록시 초기화 없이 id만 사용
    }

    private String label(ProductOptionType type) {
        return switch (type) {
            case HOTEL -> "숙소";
            case MEAL -> "식사";
            case VEHICLE -> "차량";
            case DRINK -> "음료";
        };
    }

    private long nz(Long value) {
        return value == null ? 0L : value;
    }

    private BusinessException badRequest(String code, String message) {
        return new BusinessException(HttpStatus.BAD_REQUEST, code, message);
    }
}
