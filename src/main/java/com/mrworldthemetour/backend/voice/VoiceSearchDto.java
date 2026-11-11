package com.mrworldthemetour.backend.voice;

import com.mrworldthemetour.backend.product.ProductDto;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public final class VoiceSearchDto {

    private VoiceSearchDto() {
    }

    public record Request(@NotBlank(message = "음성 검색 문장을 입력해 주세요.") String transcript) {
    }

    public record Filters(
            Long themeId,
            LocalDate departureFrom,
            LocalDate departureTo,
            Long minPrice,
            Long maxPrice,
            String keyword
    ) {
    }

    public record Response(Filters filters, ProductDto.PageResponse results) {
    }
}
