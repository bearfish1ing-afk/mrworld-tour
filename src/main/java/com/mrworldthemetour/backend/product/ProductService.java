package com.mrworldthemetour.backend.product;

import com.mrworldthemetour.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    //기본값 : 모집 중인 상태
    private static final List<ProductStatus> PUBLIC_STATUSES = List.of(
            ProductStatus.RECRUITING, ProductStatus.CONFIRMED);

    private final ThemeRepository themeRepository;
    private final ProductRepository productRepository;
    private final ProductGradeRepository productGradeRepository;
    private final ProductOptionRepository productOptionRepository;

    public ProductDto.PageResponse getProducts(
            Long themeId,
            LocalDate departureFrom,
            LocalDate departureTo,
            Long minPrice,
            Long maxPrice,
            String keyword,
            int page,
            int size
    ) {
        validateSearch(
                themeId,
                departureFrom,
                departureTo,
                minPrice,
                maxPrice,
                page,
                size
        );

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.asc("departureDate"),
                        Sort.Order.asc("id")
                )
        );

        Page<Product> result = productRepository.search(
                PUBLIC_STATUSES,
                LocalDateTime.now(),
                themeId,
                departureFrom,
                departureTo,
                minPrice,
                maxPrice,
                normalizeKeyword(keyword),
                pageable
        );

        List<ProductDto.SummaryResponse> content = result.getContent()
                .stream()
                .map(ProductDto.SummaryResponse::from)
                .toList();

        return new ProductDto.PageResponse(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    } //텍스트 기반 검색

    public ProductDto.DetailResponse getProduct(Long productId) {
        if (productId == null || productId <= 0) {
            throw invalidSearch("상품 ID는 양수여야 합니다.");
        }

        Product product = productRepository.findByIdAndStatusIn(productId, PUBLIC_STATUSES)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND",
                        "여행 상품을 찾을 수 없습니다."
                ));

        List<ProductDto.GradeResponse> grades =
                productGradeRepository
                        .findByProduct_IdOrderByExtraPriceAscIdAsc(productId)
                        .stream()
                        .map(ProductDto.GradeResponse::from)
                        .toList();

        List<ProductDto.OptionResponse> options =
                productOptionRepository
                        .findByProduct_IdOrderByOptionTypeAscIdAsc(productId)
                        .stream()
                        .map(ProductDto.OptionResponse::from)
                        .toList();

        return new ProductDto.DetailResponse(
                ProductDto.SummaryResponse.from(product),
                product.getDescription(),
                product.getMinPeople(),
                grades,
                options,
                options.stream().filter(o -> o.optionType() == ProductOptionType.HOTEL).toList(),
                options.stream().filter(o -> o.optionType() == ProductOptionType.VEHICLE).toList(),
                product.getDefaultVehicleOption() == null ? null
                        : product.getDefaultVehicleOption().getId()
        );
    } //단일 여행 상품 조회

    @Transactional
    public ProductDto.OptionResponse addOption(Long productId, ProductDto.OptionCreateRequest request) {
        Product product = requireProduct(productId);
        ProductOption option;
        if (request.optionType() == ProductOptionType.HOTEL) {
            if (request.hotelAddress() == null || request.hotelAddress().isBlank()
                    || request.hotelRating() == null || request.hotelRating() < 3
                    || request.hotelRating() > 5) {
                throw invalidSearch("호텔 주소와 3~5성급 정보를 입력해 주세요.");
            }
            option = ProductOption.hotel(product, request.optionName().strip(),
                    request.extraPrice(), request.applyRule(),
                    request.hotelAddress().strip(), request.hotelRating());
        } else {
            if (request.optionType() == null) {
                throw invalidSearch("옵션 종류를 선택해 주세요.");
            }
            option = new ProductOption(product, request.optionType(), request.optionName().strip(),
                    request.extraPrice(), request.applyRule());
        }
        return ProductDto.OptionResponse.from(productOptionRepository.save(option));
    } //여행 옵션 생성(식사, 음료, 차량, 호텔)

    @Transactional
    public Long createProduct(ProductDto.CreateRequest request) {
        if (request.minPeople() > request.maxPeople()
                || request.returnDate().isBefore(request.departureDate())
                || !request.deadline().isBefore(request.departureDate().atStartOfDay())) {
            throw invalidSearch("상품 일정 또는 정원 설정을 확인해 주세요.");
        }
        Theme theme = themeRepository.findById(request.themeId())
                .orElseThrow(() -> invalidSearch("존재하지 않는 테마입니다."));
        int vehicleIndex = resolveDefaultVehicle(request, theme);
        requireOption(request, vehicleIndex, ProductOptionType.VEHICLE);
        if (theme.getFixedPeople() != null && theme.getFixedPeople() > request.maxPeople()) {
            throw invalidSearch("상품 정원은 테마의 고정 예약 인원 이상이어야 합니다.");
        }
        if (request.grades().stream().filter(ProductDto.GradeCreateRequest::defaultGrade).count() != 1) {
            throw invalidSearch("기본 여행 등급은 정확히 하나여야 합니다.");
        }
        for (var grade : request.grades()) {
            TravelGrade selected;
            try {
                selected = TravelGrade.valueOf(grade.grade());
            } catch (IllegalArgumentException exception) {
                throw invalidSearch("여행 등급은 CLASSIC, GRAND, PREMIUM 중 하나여야 합니다.");
            }
            if (!selected.satisfies(theme.getMinGrade())) {
                throw invalidSearch("테마의 최소 여행 등급보다 낮은 등급은 등록할 수 없습니다.");
            }
            requireOption(request, grade.hotelOptionIndex(), ProductOptionType.HOTEL);
            requireOption(request, grade.mealOptionIndex(), ProductOptionType.MEAL);
        }
        Product product = productRepository.save(new Product(theme, request.productCode(),
                request.title(), request.country(), request.duration(), request.description(),
                request.basePrice(), request.status(), request.departureDate(), request.returnDate(),
                request.deadline(), request.maxPeople(), request.minPeople()));
        java.util.ArrayList<ProductOption> options = new java.util.ArrayList<>();
        for (var option : request.options()) {
            Long id = addOption(product.getId(), option).id();
            options.add(productOptionRepository.findById(id).orElseThrow());
        }
        product.changeDefaultVehicleOption(options.get(vehicleIndex));
        for (var input : request.grades()) {
            ProductGrade grade = new ProductGrade(product, input.grade(), input.extraPrice(), input.defaultGrade());
            grade.changeDefaultOptions(options.get(input.hotelOptionIndex()), options.get(input.mealOptionIndex()));
            productGradeRepository.save(grade);
        }
        productRepository.flush();
        return product.getId();
    } //여행 상품 생성

    private int resolveDefaultVehicle(ProductDto.CreateRequest request, Theme theme) {
        Integer matched = null;
        for (int i = 0; i < request.options().size(); i++) {
            var option = request.options().get(i);
            if (option.optionType() == ProductOptionType.VEHICLE
                    && theme.getDefaultVehicle() != null
                    && theme.getDefaultVehicle().equals(option.optionName().strip())) {
                if (matched != null) {
                    throw invalidSearch("테마 기본 차량명과 일치하는 차량 옵션은 하나만 등록해 주세요.");
                }
                matched = i;
            }
        }
        if (matched == null) {
            throw invalidSearch("테마 기본 차량명이 설정되어 있고, 일치하는 차량 옵션이 등록되어 있어야 합니다.");
        }
        return matched;
    } //option에서 테마 기본 차량명과 일치하는 것 찾아 인덱스 반환 (차량 옵션 변경 시 추가 비용 발생하는 것 구현하기 위해 필요)

    @Transactional
    public void changeGradeDefaults(Long productId, Long gradeId, ProductDto.DefaultGradeOptionsRequest request) {
        ProductGrade grade = productGradeRepository.findByIdAndProduct_Id(gradeId, productId)
                .orElseThrow(() -> invalidSearch("해당 상품의 여행 등급이 아닙니다."));
        ProductOption hotel = productOptionRepository.findByIdAndProduct_Id(request.hotelOptionId(), productId)
                .orElseThrow(() -> invalidSearch("해당 상품의 호텔 옵션이 아닙니다."));
        ProductOption meal = productOptionRepository.findByIdAndProduct_Id(request.mealOptionId(), productId)
                .orElseThrow(() -> invalidSearch("해당 상품의 식사 옵션이 아닙니다."));
        if (hotel.getOptionType() != ProductOptionType.HOTEL || meal.getOptionType() != ProductOptionType.MEAL) {
            throw invalidSearch("호텔 및 식사 옵션 유형을 확인해 주세요.");
        }
        grade.changeDefaultOptions(hotel, meal);
    } //개별 여행상품의 등급별 기본 옵션 지정

    private Product requireProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "여행 상품을 찾을 수 없습니다."));
    }

    private void requireOption(ProductDto.CreateRequest request, Integer index, ProductOptionType type) {
        if (index == null || index < 0 || index >= request.options().size()
                || request.options().get(index).optionType() != type) {
            throw invalidSearch("기본 " + type + " 옵션을 올바르게 지정해 주세요.");
        }
    }

    private void validateSearch(
            Long themeId,
            LocalDate departureFrom,
            LocalDate departureTo,
            Long minPrice,
            Long maxPrice,
            int page,
            int size
    ) {
        if (themeId != null && themeId <= 0) {
            throw invalidSearch("테마 ID는 양수여야 합니다.");
        }

        if (departureFrom != null
                && departureTo != null
                && departureFrom.isAfter(departureTo)) {
            throw invalidSearch(
                    "출발일 검색 시작일은 종료일보다 늦을 수 없습니다."
            );
        }

        if ((minPrice != null && minPrice < 0)
                || (maxPrice != null && maxPrice < 0)) {
            throw invalidSearch("검색 가격은 0 이상이어야 합니다.");
        }

        if (minPrice != null
                && maxPrice != null
                && minPrice > maxPrice) {
            throw invalidSearch(
                    "최소 가격은 최대 가격보다 클 수 없습니다."
            );
        }

        if (page < 0) {
            throw invalidSearch("페이지는 0 이상이어야 합니다.");
        }

        if (size < 1 || size > 100) {
            throw invalidSearch(
                    "페이지 크기는 1~100 사이여야 합니다."
            );
        }
    } //검색 조건 검증

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        String normalized = keyword.strip();

        if (normalized.length() > 100) {
            throw invalidSearch("검색어는 100자 이하여야 합니다.");
        }

        return normalized
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
    } // repository의 query에서 사용되는 wildcard와 충돌하지 않게 처리

    private BusinessException invalidSearch(String message) {
        return new BusinessException(
                HttpStatus.BAD_REQUEST,
                "INVALID_PRODUCT_REQUEST",
                message
        );
    }
}