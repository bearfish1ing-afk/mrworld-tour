package com.mrworldthemetour.backend.product;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ProductDto {

    private ProductDto() {
    }

    public record ThemeResponse(
            Long id,
            String name,
            String description,
            String defaultVehicle,
            TravelGrade minGrade,
            Integer fixedPeople
    ) {
        public static ThemeResponse from(Theme theme) {
            if (theme == null) {
                return null;
            }

            return new ThemeResponse(
                    theme.getId(),
                    theme.getThemeName(),
                    theme.getDescription(),
                    theme.getDefaultVehicle(),
                    theme.getMinGrade(),
                    theme.getFixedPeople()
            );
        }
    }

    public record SummaryResponse(
            Long id,
            String productCode,
            String title,
            String country,
            String duration,
            Long basePrice,
            Product.ProductStatus status,
            LocalDate departureDate,
            LocalDate returnDate,
            LocalDateTime deadline,
            Integer maxPeople,
            Integer currentPeople,
            ThemeResponse theme
    ) {
        public static SummaryResponse from(Product product) {
            return new SummaryResponse(
                    product.getId(),
                    product.getProductCode(),
                    product.getTitle(),
                    product.getCountry(),
                    product.getDuration(),
                    product.getBasePrice(),
                    product.getStatus(),
                    product.getDepartureDate(),
                    product.getReturnDate(),
                    product.getDeadline(),
                    product.getMaxPeople(),
                    product.getCurrentPeople(),
                    ThemeResponse.from(product.getTheme())
            );
        }
    }

    public record GradeResponse(
            Long id,
            String grade,
            Long extraPrice,
            Boolean defaultGrade,
            Long defaultHotelOptionId,
            Long defaultMealOptionId
    ) {
        public static GradeResponse from(ProductGrade grade) {
            return new GradeResponse(
                    grade.getId(),
                    grade.getGrade(),
                    grade.getExtraPrice(),
                    grade.getDefaultGrade(),
                    grade.getDefaultHotelOption() == null ? null : grade.getDefaultHotelOption().getId(),
                    grade.getDefaultMealOption() == null ? null : grade.getDefaultMealOption().getId()
            );
        }
    }

    public record OptionResponse(
            Long id,
            ProductOptionType optionType,
            String optionName,
            Long extraPrice,
            String applyRule,
            String hotelAddress,
            Integer hotelRating
    ) {
        public static OptionResponse from(ProductOption option) {
            return new OptionResponse(
                    option.getId(),
                    option.getOptionType(),
                    option.getOptionName(),
                    option.getExtraPrice(),
                    option.getApplyRule(),
                    option.getHotelAddress(),
                    option.getHotelRating()
            );
        }
    }

    public record DetailResponse(
            SummaryResponse product,
            String description,
            Integer minPeople,
            List<GradeResponse> grades,
            List<OptionResponse> options,
            List<OptionResponse> hotels,
            List<OptionResponse> vehicles,
            Long defaultVehicleOptionId
    ) {
    }

    public record OptionCreateRequest(
            @jakarta.validation.constraints.NotNull
            ProductOptionType optionType,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 100)
            String optionName,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.PositiveOrZero
            Long extraPrice,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 20)
            @jakarta.validation.constraints.Pattern(regexp = "PER_PERSON|PER_RESERVATION",
                    message = "요금 적용 규칙은 PER_PERSON 또는 PER_RESERVATION이어야 합니다.")
            String applyRule,
            @jakarta.validation.constraints.Size(max = 255)
            String hotelAddress,
            Integer hotelRating
    ) {}

    public record GradeCreateRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 20) String grade,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.PositiveOrZero Long extraPrice,
            boolean defaultGrade,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.PositiveOrZero Integer hotelOptionIndex,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.PositiveOrZero Integer mealOptionIndex
    ) {}

    // 옵션 인덱스는 이 요청의 options 배열에서 0부터 시작하는 위치
    public record CreateRequest(
            @jakarta.validation.constraints.NotNull Long themeId,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 30) String productCode,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 255) String title,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 50) String country,
            @jakarta.validation.constraints.Size(max = 20) String duration,
            @jakarta.validation.constraints.Size(max = 1000) String description,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.PositiveOrZero Long basePrice,
            @jakarta.validation.constraints.NotNull Product.ProductStatus status,
            @jakarta.validation.constraints.NotNull LocalDate departureDate,
            @jakarta.validation.constraints.NotNull LocalDate returnDate,
            @jakarta.validation.constraints.NotNull LocalDateTime deadline,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.Positive Integer maxPeople,
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.Positive Integer minPeople,
            @jakarta.validation.constraints.NotEmpty
            List<@jakarta.validation.constraints.NotNull @jakarta.validation.Valid OptionCreateRequest> options,
            @jakarta.validation.constraints.NotEmpty
            List<@jakarta.validation.constraints.NotNull @jakarta.validation.Valid GradeCreateRequest> grades
    ) {}

    public record DefaultGradeOptionsRequest(
            @jakarta.validation.constraints.NotNull Long hotelOptionId,
            @jakarta.validation.constraints.NotNull Long mealOptionId
    ) {}

    public record PageResponse(
            List<SummaryResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {
    }
}