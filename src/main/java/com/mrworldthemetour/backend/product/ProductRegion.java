package com.mrworldthemetour.backend.product;

import java.util.List;
import java.util.Map;

// 여행 지역(대륙) - 관리자가 상품 등록 시 선택
public enum ProductRegion {
    DOMESTIC("국내"),
    ASIA("아시아"),
    EUROPE("유럽"),
    AMERICA("아메리카"),
    OCEANIA("오세아니아"),
    AFRICA("아프리카");

    private final String label;

    ProductRegion(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    // 기존 상품(대륙 미지정)을 채우거나, 등록 시 대륙을 안 보낸 경우 국가명으로 추정
    private static final Map<ProductRegion, List<String>> COUNTRY_HINTS = Map.of(
            DOMESTIC, List.of("한국", "대한민국", "국내", "제주", "부산", "강원", "경주", "여수", "전주"),
            ASIA, List.of("일본", "중국", "홍콩", "마카오", "대만", "몽골",
                    "태국", "베트남", "라오스", "캄보디아", "미얀마", "말레이시아", "싱가포르",
                    "인도네시아", "발리", "필리핀", "세부", "보라카이", "브루나이",
                    "인도", "네팔", "부탄", "스리랑카", "몰디브",
                    "우즈베키스탄", "카자흐스탄", "키르기스스탄",
                    "아랍에미리트", "두바이", "카타르", "오만", "요르단", "이스라엘", "사우디"),
            EUROPE, List.of("영국", "프랑스", "독일", "이탈리아", "스페인", "포르투갈", "스위스", "오스트리아",
                    "체코", "헝가리", "폴란드", "크로아티아", "슬로베니아", "그리스", "튀르키예", "터키",
                    "네덜란드", "벨기에", "덴마크", "노르웨이", "스웨덴", "핀란드", "아이슬란드",
                    "아일랜드", "몰타", "루마니아", "불가리아", "러시아", "조지아"),
            AMERICA, List.of("미국", "하와이", "캐나다", "멕시코", "쿠바", "페루", "칠레", "아르헨티나",
                    "브라질", "볼리비아", "콜롬비아", "에콰도르", "코스타리카"),
            OCEANIA, List.of("호주", "뉴질랜드", "괌", "사이판", "팔라우", "피지", "타히티", "뉴칼레도니아", "바누아투"),
            AFRICA, List.of("이집트", "모로코", "남아프리카공화국", "남아공", "케냐", "탄자니아",
                    "모리셔스", "세이셸", "마다가스카르", "튀니지", "나미비아")
    );

    // 국가명으로 대륙 추정 (모르면 null)
    public static ProductRegion guessFromCountry(String country) {
        if (country == null || country.isBlank()) {
            return null;
        }
        String text = country.strip();
        for (ProductRegion region : values()) {
            for (String hint : COUNTRY_HINTS.get(region)) {
                if (text.contains(hint)) {
                    return region;
                }
            }
        }
        return null;
    }
}
