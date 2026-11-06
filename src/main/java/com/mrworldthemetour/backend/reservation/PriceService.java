package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.product.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.mrworldthemetour.backend.reservation.PriceResponse.PriceItem;
import java.util.*;
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriceService {
    private final ProductRepository productRepository;
    private final ProductGradeRepository productGradeRepository;
    private final ProductOptionRepository productOptionRepository;

    //reservation 계산
    public PriceResponse calculate(PriceRequest request){
        if(request.productId()==null || request.productGradeId()==null){
            throw badRequest("REQUIRED_VALUE_MISSING", "상품과 등급을 선택해 주세요.");
        }

        Product product=productRepository.findById(request.productId())
                .orElseThrow(()->new BusinessException(HttpStatus.NOT_FOUND,"PRODUCT_NOT_FOUND", "존재하지 않는 상품입니다."));

        Optional<ThemeRule> themeRule = ThemeRule.fromThemeName(
                product.getTheme() == null ? null : product.getTheme().getThemeName());

        //허니문 2인 전용
        int people=validatePeople(request.people(),themeRule);

        //테마 최소 등급인지
        ProductGrade grade=productGradeRepository
                .findByIdAndProduct_Id(request.productGradeId(), product.getId())
                .orElseThrow(() -> badRequest("INVALID_GRADE", "해당 상품의 등급이 아닙니다."));
        TourGrade tourGrade=TourGrade.from(grade.getGrade());

        if(themeRule.isPresent() && tourGrade.compareTo(themeRule.get().getMinGrade())<0){
            throw badRequest("GRADE_NOT_ALLOWED",
                    "이 테마는 " + themeRule.get().getMinGrade().getLabel() + " 이상만 선택할 수 있습니다.");
        }

        List<PriceItem> items = new ArrayList<>();
        items.add(item(OptionType.GRADE, grade.getId(), tourGrade.getLabel(),
                people, nz(grade.getExtraPrice())));

        //옵션
        List<ProductOption> options=productOptionRepository.findByProduct_IdOrderByOptionTypeAscIdAsc(product.getId());
        Map<Long,ProductOption> optionMap=options.stream()
                .collect(Collectors.toMap(ProductOption::getId, Function.identity()));

        //호텔, 식당, 차량
        addSingle(items, options, optionMap,request.hotelOptionId(),OptionType.HOTEL,defaultHotelName(tourGrade),people);
        addSingle(items, options, optionMap, request.mealOptionId(), OptionType.MEAL, defaultMealName(tourGrade), people);
        addSingle(items, options, optionMap, request.vehicleOptionId(), OptionType.VEHICLE, themeRule.map(ThemeRule::getDefaultVehicleName).orElse(null), people);

        //음료
        addDrinks(items, optionMap,request.drinks());

        //합계
        long baseAmount=nz(product.getBasePrice())*people;
        long optionAmount=items.stream().mapToLong(PriceItem::amount).sum();
        long discountAmount=0L;//TODO: 단골 할인 추가해야함
        long finalAmount=baseAmount+optionAmount-discountAmount;

        return new PriceResponse(baseAmount, items, optionAmount, discountAmount, finalAmount);
    }

    private int validatePeople(Integer people, Optional<ThemeRule> themeRule){
        if(people==null || people<1){
            throw badRequest("INVALID_PEOPLE", "인원은 1명 이상이어야 합니다.");
        }
        Integer fixed=themeRule.map(ThemeRule::getFixedPeople).orElse(null);
        if (fixed != null && people != fixed) {
            throw badRequest("INVALID_PEOPLE", "이 테마는 " + fixed + "인 전용 상품입니다.");
        }
        return people;
    }

    //호텔, 식사, 차량
    private void addSingle(List<PriceItem> items, List<ProductOption> options,Map<Long,ProductOption> optionMap,Long optionId, OptionType type,String defaultName,int people){
        ProductOption defaultOption=findDefault(options,type,defaultName);
        ProductOption option;

        if(optionId==null){
            option=defaultOption;
            if(option==null){
                return;
            }
        }else{
            option = optionMap.get(optionId);
            if (option == null || !isType(option, type)) {
                throw badRequest("INVALID_OPTION", "해당 상품의 " + type + " 옵션이 아닙니다.");
            }
        }

        long defaultPrice=defaultOption==null? 0L: nz(defaultOption.getExtraPrice());
        long diff=nz(option.getExtraPrice())-defaultPrice;

        items.add(item(type, option.getId(), option.getOptionName(), people, diff));
    }

    private ProductOption findDefault(List<ProductOption> options, OptionType type, String defaultName) {
        if (defaultName == null) {
            return null;
        }
        for (ProductOption o : options) {
            if (isType(o, type) && defaultName.equals(o.getOptionName())) {
                return o;
            }
        }
        return null;
    }

    //음료
    private void addDrinks(List<PriceItem> items, Map<Long, ProductOption> optionMap,
                           List<PriceRequest.DrinkRequest> drinks) {
        if(drinks==null)return;
        Set<Long> seen=new HashSet<>();
        for(PriceRequest.DrinkRequest drink:drinks){
            if(drink==null || drink.optionId()==null){
                throw badRequest("INVALID_OPTION", "음료 옵션을 확인해 주세요.");
            }
            if(!seen.add(drink.optionId())){
                throw badRequest("DUPLICATE_DRINK", "같은 음료가 중복으로 선택되었습니다.");
            }
            if (drink.quantity() == null || drink.quantity() < 1) {
                throw badRequest("INVALID_QUANTITY", "음료 수량은 1개 이상이어야 합니다.");
            }
            ProductOption option = optionMap.get(drink.optionId());
            if (option == null || !isType(option, OptionType.DRINK)) {
                throw badRequest("INVALID_OPTION", "해당 상품의 음료 옵션이 아닙니다.");
            }
            items.add(item(OptionType.DRINK, option.getId(), option.getOptionName(),
                    drink.quantity(), nz(option.getExtraPrice())));
        }
    }

    private boolean isType(ProductOption option, OptionType type){
        return option.getOptionType()!=null && type.name().equalsIgnoreCase(option.getOptionType().trim());
    }

    private String defaultHotelName(TourGrade grade){
        return switch (grade){
            case CLASSIC -> "3등급 호텔";
            case GRAND -> "4등급 호텔";
            case PREMIUM -> "5등급 호텔";
        };
    }

    private String defaultMealName(TourGrade grade){
        return switch (grade){
            case CLASSIC -> "도시락";
            case GRAND -> "현지식 레스토랑";
            case PREMIUM -> "고급 레스토랑";
        };
    }

    private PriceItem item(OptionType type, Long sourceId, String name, int quantity, long unitPrice) {
        return new PriceItem(type, sourceId, name, quantity, unitPrice, unitPrice * quantity);
    }

    private long nz(Long value) {
        return value == null ? 0L : value;
    }

    private BusinessException badRequest(String code, String message) {
        return new BusinessException(HttpStatus.BAD_REQUEST, code, message);
    }
}
