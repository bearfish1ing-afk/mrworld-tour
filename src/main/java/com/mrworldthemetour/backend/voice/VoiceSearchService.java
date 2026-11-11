package com.mrworldthemetour.backend.voice;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.product.ProductDto;
import com.mrworldthemetour.backend.product.ProductService;
import com.mrworldthemetour.backend.product.ThemeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class VoiceSearchService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final int MAX_TRANSCRIPT_LENGTH = 300;
    private static final int FIRST_PAGE_SIZE = 20;

    private static final Map<Long, List<String>> THEME_ALIASES = Map.of(
            1L, List.of("허니문", "허니문 패키지", "신혼", "신혼여행", "신혼부부 여행",
                    "결혼하고 떠나는 여행", "웨딩 후 여행", "honeymoon"),
            2L, List.of("효도", "효도 여행", "효도 관광", "부모님 여행 선물", "부모님 모시고",
                    "부모님께 보내드리는 여행", "엄마 아빠 모시고 가는 여행", "어머니 아버지",
                    "부모님 모시고 쉬러 가는 여행", "환갑 기념", "칠순 기념"),
            3L, List.of("골프", "골프 여행", "골프 투어", "골프 패키지", "해외 골프", "라운딩 여행",
                    "라운드 돌러 가는 여행", "필드 나가는 여행", "골프 치러 가는 여행",
                    "골프 리조트에서 라운딩", "라운딩"),
            4L, List.of("트레킹", "트레킹 여행", "트레킹 투어", "하이킹", "하이킹 여행",
                    "등산 여행", "산행", "산악 트레킹", "산에 오르는 여행", "산길을 걷는 여행",
                    "둘레길 트레킹")
    );

    private final ThemeRepository themeRepository;
    private final ProductService productService;
    private final OpenAiVoiceSearchClient openAiClient;

    public VoiceSearchService(
            ThemeRepository themeRepository,
            ProductService productService,
            OpenAiVoiceSearchClient openAiClient
    ) {
        this.themeRepository = themeRepository;
        this.productService = productService;
        this.openAiClient = openAiClient;
    }

    public VoiceSearchDto.Response search(String transcript) {
        String normalizedTranscript = transcript == null ? "" : transcript.strip();
        if (normalizedTranscript.isEmpty() || normalizedTranscript.length() > MAX_TRANSCRIPT_LENGTH) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_VOICE_TRANSCRIPT",
                    "음성 검색 문장은 앞뒤 공백을 제외하고 1~300자여야 합니다.");
        }

        List<ThemeChoice> themes = themeRepository.findAll().stream()
                .filter(theme -> THEME_ALIASES.containsKey(theme.getId()))
                .map(theme -> new ThemeChoice(theme.getId(), theme.getThemeName(), THEME_ALIASES.get(theme.getId())))
                .sorted(Comparator.comparing(ThemeChoice::id))
                .toList();

        VoiceSearchDto.Filters filters = openAiClient.extractFilters(
                new ModelInput(LocalDate.now(SEOUL).toString(), normalizedTranscript, themes));
        validateFilters(filters, themes);

        ProductDto.PageResponse results = productService.getProducts(
                filters.themeId(), filters.departureFrom(), filters.departureTo(),
                filters.minPrice(), filters.maxPrice(), filters.keyword(), 0, FIRST_PAGE_SIZE);
        return new VoiceSearchDto.Response(filters, results);
    }

    private void validateFilters(VoiceSearchDto.Filters filters, List<ThemeChoice> themes) {
        Long themeId = filters.themeId();
        LocalDate from = filters.departureFrom();
        LocalDate to = filters.departureTo();
        Long minPrice = filters.minPrice();
        Long maxPrice = filters.maxPrice();
        String keyword = filters.keyword();

        if ((themeId != null && themes.stream().noneMatch(theme -> theme.id().equals(themeId)))
                || (from != null && to != null && from.isAfter(to))
                || (minPrice != null && minPrice < 0)
                || (maxPrice != null && maxPrice < 0)
                || (minPrice != null && maxPrice != null && minPrice > maxPrice)
                || (keyword != null && keyword.length() > 100)) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "INVALID_VOICE_SEARCH_FILTERS",
                    "음성 검색에서 유효한 조건을 해석하지 못했습니다. 다시 시도해 주세요.");
        }

        if (themeId == null && from == null && to == null
                && minPrice == null && maxPrice == null && keyword == null) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "VOICE_SEARCH_FILTERS_EMPTY",
                    "여행지, 테마, 출발일 또는 가격을 포함해 다시 입력해 주세요.");
        }
    }

    record ThemeChoice(Long id, String name, List<String> aliases) {
    }

    record ModelInput(String referenceDate, String transcript, List<ThemeChoice> themes) {
    }
}
