package com.mrworldthemetour.backend.config;

import com.mrworldthemetour.backend.inventory.Item;
import com.mrworldthemetour.backend.inventory.ItemRepository;
import com.mrworldthemetour.backend.product.Theme;
import com.mrworldthemetour.backend.product.ThemeRepository;
import com.mrworldthemetour.backend.product.TravelGrade;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// 프론트는 테마 ID를 1~4로 고정해서 사용
@Component
@RequiredArgsConstructor
public class ThemeDataInitializer implements ApplicationRunner {

    private record ThemeSeed(long id, String name, String description, String vehicle,
                             TravelGrade minGrade, Integer fixedPeople, String souvenir) {}

    private static final List<ThemeSeed> SEEDS = List.of(
            new ThemeSeed(1, "허니문 낭만 투어",
                    "2인 전용 로맨틱 스페셜 룸 데코레이션, 커플 기념티 제공",
                    "2인 전용 고급차량", TravelGrade.GRAND, 2, "커플 기념티"),
            new ThemeSeed(2, "효도 힐링 투어",
                    "고품격 안마·지압 서비스, 건강 인삼 기념품 제공",
                    "10인 승합 고급차량", TravelGrade.GRAND, null, "건강 인삼"),
            new ThemeSeed(3, "골프 챌린지 투어",
                    "유명 골프 리조트 테마 연출, 골프 액세서리(골프공) 제공",
                    "10인 승합 고급차량", TravelGrade.CLASSIC, null, "골프공"),
            new ThemeSeed(4, "아웃도어 트레킹 투어",
                    "트레킹·산악 테마 어드벤처 연출, 아웃도어 기념품(스카프) 제공",
                    "10인 승합 고급차량", TravelGrade.CLASSIC, null, "스카프")
    );

    private final ThemeRepository themeRepository;
    private final ItemRepository itemRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Item> items = itemRepository.findAll();

        for (ThemeSeed seed : SEEDS) {
            Theme theme = themeRepository.findById(seed.id()).orElse(null);

            if (theme == null) {
                jdbcTemplate.update(
                        "INSERT INTO theme (theme_id, theme_name, description, default_vehicle, min_grade, fixed_people) "
                                + "VALUES (?, ?, ?, ?, ?, ?)",
                        seed.id(), seed.name(), seed.description(), seed.vehicle(),
                        seed.minGrade().name(), seed.fixedPeople());
                theme = themeRepository.findById(seed.id()).orElseThrow();
            } else if (!seed.name().equals(theme.getThemeName())) {
                throw new IllegalStateException("theme_id " + seed.id() + "에 다른 테마('"
                        + theme.getThemeName() + "')가 있습니다. theme 테이블을 정리한 뒤 다시 실행해 주세요.");
            }

            if (theme.getSouvenirItem() == null) {
                Item souvenir = items.stream()
                        .filter(i -> seed.souvenir().equals(i.getItemName()))
                        .findFirst()
                        .orElseGet(() -> itemRepository.save(new Item(seed.souvenir(), 0))); // 재고는 관리자가 입고
                theme.changeSouvenirItem(souvenir);
            }
        }
    }
}