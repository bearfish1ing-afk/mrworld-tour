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
    // [추가] 요구사항: 신청 인원 3명 이상이면 출발 확정
    private static final int MIN_DEPARTURE_PEOPLE = 3;

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

    // [추가] 관리자 상품 목록 (DRAFT 등 비공개 상태 포함)
    public ProductDto.PageResponse getProductsForAdmin(int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw invalidSearch("페이지는 0 이상, 페이지 크기는 1~100이어야 합니다.");
        }
        Page<Product> result = productRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")));

        return new ProductDto.PageResponse(
                result.getContent().stream().map(ProductDto.SummaryResponse::from).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    // [추가] 관리자 판매 상태 변경 (판매 시작, 판매 중지 등. 출발 취소는 DepartureService)
    @Transactional
    public void changeStatus(Long productId, ProductStatus status) {
        try {
            requireProduct(productId).changeStatus(status);
        } catch (IllegalArgumentException exception) {
            throw invalidSearch(exception.getMessage());
        }
    }

    @Transactional
    public ProductDto.OptionResponse addOption(Long productId, ProductDto.OptionCreateRequest request) {
        Product product = requireProduct(productId);
        ProductOption option;
        if (request.optionType() == ProductOptionType.HOTEL) {
            // [수정] 호텔: 고정 등급 + 가격만
            if (request.hotelLevel() == null) {
                throw invalidSearch("호텔 등급(STAR_3, STAR_4, STAR_5)을 선택해 주세요.");
            }
            option = ProductOption.hotel(product, request.hotelLevel(), request.extraPrice());
        } else if (request.optionType() == ProductOptionType.VEHICLE) {
            // [수정] 차량: 고정 종류 + 가격만
            if (request.vehicleType() == null) {
                throw invalidSearch("차량 종류를 선택해 주세요.");
            }
            option = ProductOption.vehicle(product, request.vehicleType(), request.extraPrice());
        } else if (request.optionType() == ProductOptionType.MEAL
                || request.optionType() == ProductOptionType.DRINK) {
            if (request.serviceLevel() == null || request.serviceLevel() < 1 || request.serviceLevel() > 3) {
                throw invalidSearch("식사와 음료 등급은 1~3이어야 합니다.");
            }
            if (request.optionName() == null || request.optionName().isBlank() || request.applyRule() == null) {
                throw invalidSearch("식사와 음료는 이름과 요금 적용 규칙이 필요합니다.");
            }
            option = ProductOption.foodOrDrink(product, request.optionType(), request.optionName().strip(),
                    request.extraPrice(), request.applyRule(), request.serviceLevel());
        } else {
            throw invalidSearch("옵션 종류를 선택해 주세요.");
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
        // [추가] 요구사항: 신청 인원 3명 이상이면 출발 확정
        if (request.minPeople() != MIN_DEPARTURE_PEOPLE) {
            throw invalidSearch("최소 출발 인원은 " + MIN_DEPARTURE_PEOPLE + "명입니다.");
        }
        Theme theme = themeRepository.findById(request.themeId())
                .orElseThrow(() -> invalidSearch("존재하지 않는 테마입니다."));
        if (theme.getDefaultVehicle() == null) {
            throw invalidSearch("테마의 기본 차량이 설정되어 있지 않습니다.");
        }
        // [수정] 기본 차량: 요청에 테마 기본 차량이 있으면 그 가격, 없으면 0원으로 자동 생성
        Integer vehicleIndex = findVehicleIndex(request, theme.getDefaultVehicle());
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
            resolveHotelIndex(request, selected); // [수정] 등급에 맞는 호텔(3/4/5등급)이 있는지
            resolveFoodIndex(request, selected, ProductOptionType.MEAL);
            resolveFoodIndex(request, selected, ProductOptionType.DRINK);
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
        ProductOption defaultVehicle = vehicleIndex != null ? options.get(vehicleIndex)
                : productOptionRepository.save(ProductOption.vehicle(product, theme.getDefaultVehicle(), 0L));
        product.changeDefaultVehicleOption(defaultVehicle);

        // [추가] 테마 기념품을 상품에 복사 (예약 시 이 물품이 인원 수만큼 배정)
        product.assignSouvenirItem(theme.getSouvenirItem());

        for (var input : request.grades()) {
            ProductGrade grade = new ProductGrade(product, input.grade(), input.extraPrice(), input.defaultGrade());
            TravelGrade travelGrade = TravelGrade.valueOf(input.grade());
            grade.initializeDefaultOptions(options.get(resolveHotelIndex(request, travelGrade)),
                    options.get(resolveFoodIndex(request, travelGrade, ProductOptionType.MEAL)),
                    options.get(resolveFoodIndex(request, travelGrade, ProductOptionType.DRINK)));
            productGradeRepository.save(grade);
        }
        productRepository.flush();
        return product.getId();
    } //여행 상품 생성

    private int resolveFoodIndex(ProductDto.CreateRequest request, TravelGrade grade, ProductOptionType type) {
        int level = switch (grade) {
            case CLASSIC -> 1;
            case GRAND -> 2;
            case PREMIUM -> 3;
        };
        Integer matched = null;
        for (int i = 0; i < request.options().size(); i++) {
            var option = request.options().get(i);
            if (option.optionType() == type && Integer.valueOf(level).equals(option.serviceLevel())) {
                if (matched != null) {
                    throw invalidSearch(type + "의 " + level + "단계 옵션은 하나만 등록해 주세요.");
                }
                matched = i;
            }
        }
        if (matched == null) {
            throw invalidSearch(grade + "의 기본 " + type + " 옵션(" + level + "단계)이 필요합니다.");
        }
        return matched;
    }

    // [추가] 등급에 맞는 기본 호텔 옵션 위치 (클래식 3등급, 그랜드 4등급, 프리미엄 5등급)
    private int resolveHotelIndex(ProductDto.CreateRequest request, TravelGrade grade) {
        HotelLevel level = HotelLevel.forGrade(grade);
        Integer matched = null;
        for (int i = 0; i < request.options().size(); i++) {
            var option = request.options().get(i);
            if (option.optionType() == ProductOptionType.HOTEL && option.hotelLevel() == level) {
                if (matched != null) {
                    throw invalidSearch(level.getLabel() + " 옵션은 하나만 등록해 주세요.");
                }
                matched = i;
            }
        }
        if (matched == null) {
            throw invalidSearch(grade + " 등급에는 " + level.getLabel() + " 옵션이 필요합니다.");
        }
        return matched;
    }

    // [추가] 테마 기본 차량 옵션 위치 (없으면 null → 0원으로 자동 생성)
    private Integer findVehicleIndex(ProductDto.CreateRequest request, VehicleType type) {
        Integer matched = null;
        for (int i = 0; i < request.options().size(); i++) {
            var option = request.options().get(i);
            if (option.optionType() == ProductOptionType.VEHICLE && option.vehicleType() == type) {
                if (matched != null) {
                    throw invalidSearch(type.getLabel() + " 옵션은 하나만 등록해 주세요.");
                }
                matched = i;
            }
        }
        return matched;
    }

    private Product requireProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,
                        "PRODUCT_NOT_FOUND", "여행 상품을 찾을 수 없습니다."));
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