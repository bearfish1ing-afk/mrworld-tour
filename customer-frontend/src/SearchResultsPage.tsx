import { useEffect, useMemo, useState } from "react"
import type { SelectedProduct } from "./ThemeTravelPage"

const searchAsset = (name: string) => `/assets/search-4001-13/${name}`

const products = [
  {
    image: "8a4c7.png",
    alt: "수영장 옆 테이블 위의 와인잔",
    title: "[몰디브] 올인클루시브 4박 6일",
    duration: "4박 6일",
    summary: "수상빌라 · 전 일정 리조트 식사",
    price: 3290000,
    departure: "인천 출발 · 매주 월 / 수 / 토",
    region: "남태평양",
    theme: "honeymoon" as const,
    themeLabel: "허니문",
    badge: "프리미엄",
    days: 6,
  },
  {
    image: "bbfe6.png",
    alt: "그리스 산토리니 해안 마을",
    title: "[그리스] 산토리니·아테네 6박 8일",
    duration: "6박 8일",
    summary: "오션뷰 호텔 · 선셋 크루즈",
    price: 3890000,
    departure: "인천 출발 · 매주 화 / 금",
    region: "유럽",
    theme: "honeymoon" as const,
    themeLabel: "허니문",
    badge: "그랜드",
    days: 8,
  },
  {
    image: "8fbe1.png",
    alt: "발리 풀빌라와 열대 정원",
    title: "[인도네시아] 발리 풀빌라 4박 6일",
    duration: "4박 6일",
    summary: "독채 풀빌라 · 커플 스파 포함",
    price: 1890000,
    departure: "인천 출발 · 매일 출발",
    region: "동남아",
    theme: "honeymoon" as const,
    themeLabel: "허니문",
    badge: "클래식",
    days: 6,
  },
  {
    image: "31486.png",
    alt: "하와이 와이키키 해변",
    title: "[미국] 하와이 오아후 5박 7일",
    duration: "5박 7일",
    summary: "와이키키 호텔 · 자유일정",
    price: 2790000,
    departure: "인천 출발 · 매일 출발",
    region: "미주",
    theme: "honeymoon" as const,
    themeLabel: "허니문",
    badge: "그랜드",
    days: 7,
  },
  {
    image: "7a14f.png",
    alt: "푸켓의 바다와 보트",
    title: "[태국] 푸켓 힐링 효도 4박 6일",
    duration: "4박 6일",
    summary: "오션뷰 리조트 · 요트 투어",
    price: 1690000,
    departure: "인천 출발 · 매일 출발",
    region: "동남아",
    theme: "parents" as const,
    themeLabel: "효도",
    badge: "그랜드",
    days: 6,
  },
  {
    image: "8a4c7.png",
    alt: "일본 온천 마을",
    title: "[일본] 규슈 유후인·벳푸 온천 4일",
    duration: "3박 4일",
    summary: "전통 료칸 · 가이세키 식사 포함",
    price: 1690000,
    departure: "인천 출발 · 매일 출발",
    region: "일본",
    theme: "parents" as const,
    themeLabel: "효도",
    badge: "그랜드",
    days: 4,
  },
  {
    image: "bbfe6.png",
    alt: "일본 료칸 풍경",
    title: "[일본] 홋카이도 노보리베츠 료칸 5일",
    duration: "4박 5일",
    summary: "온천 리조트 · 삿포로 시내 관광",
    price: 2190000,
    departure: "인천 출발 · 매주 화 / 토",
    region: "일본",
    theme: "parents" as const,
    themeLabel: "효도",
    badge: "프리미엄",
    days: 5,
  },
  {
    image: "8a4c7.png",
    alt: "일본 골프장",
    title: "[일본] 미야자키 피닉스 54홀 4일",
    duration: "3박 4일",
    summary: "명문 코스 라운딩 · 전용 차량",
    price: 1890000,
    departure: "인천 출발 · 매주 목 / 일",
    region: "일본",
    theme: "golf" as const,
    themeLabel: "골프",
    badge: "그랜드",
    days: 4,
  },
  {
    image: "f09f9.png",
    alt: "파리 에펠탑과 거리",
    title: "[프랑스] 파리 로맨틱 여행 5박 7일",
    duration: "5박 7일",
    summary: "시내 호텔 · 센강 디너 크루즈",
    price: 3190000,
    departure: "인천 출발 · 매주 월 / 목 / 토",
    region: "유럽",
    theme: "honeymoon" as const,
    themeLabel: "허니문",
    badge: "프리미엄",
    days: 7,
  },
]

const regions = ["전체", "유럽", "동남아", "일본", "남태평양", "미주", "국내"]
const themes = ["전체", "허니문", "효도", "골프", "트레킹"]
const sortOptions = ["추천순", "낮은 가격순", "높은 가격순", "출발일순"]
const durationOptions = ["전체", "3~4일", "5~6일", "7일 이상"]
const priceRangeOptions = ["전체", "200만원 이하", "200~300만원", "300만원 이상"]

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-h-[51px] border-b border-[#d9d9d9] max-sm:flex-col">
      <div className="flex w-[130px] shrink-0 items-center bg-[#f7f7f7] pl-5 font-dot-medium text-sm max-sm:h-10 max-sm:w-full">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2">
        {options.map((option) => (
          <button
            className={`px-2.5 py-[7px] font-dot-regular text-sm cursor-pointer transition-colors ${
              value === option
                ? "bg-[#f0f9fb] font-dot-semibold text-[#1596b4]"
                : "text-[#707070] hover:text-black"
            }`}
            key={option}
            type="button"
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  onSelect,
}: {
  product: typeof products[number]
  onSelect?: (product: SelectedProduct) => void
}) {
  return (
    <button
      className="flex min-w-0 flex-col gap-2.5 text-left cursor-pointer group"
      type="button"
      onClick={() =>
        onSelect?.({
          badge: product.badge,
          country: product.title.split("]")[0]?.replace("[", "") || "해외",
          title: product.title,
          duration: product.duration,
          price: `${product.price.toLocaleString()}원~`,
          image: product.image,
          theme: product.theme,
          themeLabel: product.themeLabel,
        })
      }
    >
      <div className="overflow-hidden rounded-md">
        <img
          className="aspect-[225/200] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={searchAsset(product.image)}
          alt={product.alt}
        />
      </div>
      <p className="font-dot-regular text-base leading-[1.1] tracking-[-0.32px] text-[#1596b4] font-semibold">
        {product.themeLabel}
      </p>
      <div className="font-dot-regular text-xl leading-[1.3] tracking-[-0.4px] text-black">
        <p>{product.title}</p>
      </div>
      <p className="font-dot-regular text-[13px] text-[#707070]">
        {product.summary}
      </p>
      <p className="font-dot-semibold text-xl tracking-[-0.4px] text-black">
        {product.price.toLocaleString("ko-KR")}원~
      </p>
      <p className="font-dot-regular text-xs text-[#707070]">
        {product.departure}
      </p>
    </button>
  )
}

export default function SearchResultsPage({
  keyword,
  onProductSelect,
}: {
  keyword: string
  onProductSelect?: (product: SelectedProduct) => void
}) {
  const [region, setRegion] = useState("전체")
  const [theme, setTheme] = useState("전체")
  const [searchText, setSearchText] = useState("")

  const [sort, setSort] = useState("추천순")
  const [page, setPage] = useState(1)

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("전체")
  const [selectedPriceRange, setSelectedPriceRange] = useState("전체")

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDurationMenu, setShowDurationMenu] = useState(false)
  const [showPriceMenu, setShowPriceMenu] = useState(false)

  useEffect(() => {
    const trimmed = keyword.trim()
    if (regions.includes(trimmed)) {
      setRegion(trimmed)
      setTheme("전체")
      setSearchText("")
    } else if (themes.includes(trimmed)) {
      setTheme(trimmed)
      setRegion("전체")
      setSearchText("")
    } else {
      setSearchText(trimmed)
      setRegion("전체")
      setTheme("전체")
    }
  }, [keyword])

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    setSearchText("") 
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setSearchText("")
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (searchText) {
          const kw = searchText.toLowerCase()
          const matchesText =
            product.title.toLowerCase().includes(kw) ||
            product.themeLabel.toLowerCase().includes(kw) ||
            product.region.toLowerCase().includes(kw) ||
            product.summary.toLowerCase().includes(kw)
          if (!matchesText) return false
        }

        if (region !== "전체" && product.region !== region) {
          return false
        }
        if (theme !== "전체" && product.themeLabel !== theme) {
          return false
        }
        if (
          selectedDuration === "3~4일" &&
          (product.days < 3 || product.days > 4)
        ) {
          return false
        }
        if (
          selectedDuration === "5~6일" &&
          (product.days < 5 || product.days > 6)
        ) {
          return false
        }
        if (selectedDuration === "7일 이상" && product.days < 7) {
          return false
        }
        if (
          selectedPriceRange === "200만원 이하" &&
          product.price > 2000000
        ) {
          return false
        }
        if (
          selectedPriceRange === "200~300만원" &&
          (product.price < 2000000 || product.price > 3000000)
        ) {
          return false
        }
        if (
          selectedPriceRange === "300만원 이상" &&
          product.price < 3000000
        ) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sort === "낮은 가격순") return a.price - b.price
        if (sort === "높은 가격순") return b.price - a.price
        return 0
      })
  }, [searchText, region, theme, selectedDuration, selectedPriceRange, sort])

  const resetFilters = () => {
    setRegion("전체")
    setTheme("전체")
    setSearchText("")
    setSelectedDate("")
    setSelectedDuration("전체")
    setSelectedPriceRange("전체")
    setSort("추천순")
    setShowDatePicker(false)
    setShowDurationMenu(false)
    setShowPriceMenu(false)
  }

  const currentTitle = searchText
    ? `‘${searchText}’`
    : region !== "전체"
    ? `‘${region}’`
    : theme !== "전체"
    ? `‘${theme}’`
    : `‘${keyword || "전체"}’`

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-[26px] md:px-10 lg:px-[100px]">
        <p className="font-roboto-regular text-xs text-[#707070]">
          홈&nbsp;&nbsp;›&nbsp;&nbsp;여행 검색&nbsp;&nbsp;›&nbsp;&nbsp;검색결과
        </p>

        <div className="mt-6 border-y border-[#171717] bg-[#c7e8ef] px-[30px] py-5">
          <h1 className="font-dot-medium text-[28px] tracking-[-0.56px]">
            <strong className="font-dot-bold">{currentTitle}</strong> 검색결과
          </h1>
          <p className="mt-2.5 font-dot-regular text-[15px]">
            두 사람을 위한 특별한 여행, 총 {filteredProducts.length}개의 여행상품이 있습니다.
          </p>
        </div>

        <div className="mt-6 border border-[#d9d9d9]">
          <FilterRow
            label="여행 지역"
            options={regions}
            value={region}
            onChange={handleRegionChange}
          />
          <FilterRow
            label="여행 테마"
            options={themes}
            value={theme}
            onChange={handleThemeChange}
          />

          <div className="relative flex min-h-[60px] items-center gap-5 max-lg:flex-wrap max-lg:pb-4 max-sm:flex-col max-sm:items-stretch">
            <div className="flex h-[60px] w-[130px] shrink-0 items-center bg-[#f7f7f7] pl-5 font-dot-medium text-sm max-sm:h-10 max-sm:w-full">
              일정 / 예산
            </div>

            <div className="relative max-sm:mx-4">
              <button
                className={`flex h-[34px] w-[190px] items-center justify-between border border-[#d9d9d9] px-3 font-dot-regular text-[13px] cursor-pointer max-sm:w-full ${
                  selectedDate ? "border-[#1596b4] text-[#1596b4] font-semibold" : "text-[#151515]"
                }`}
                type="button"
                onClick={() => {
                  setShowDatePicker((prev) => !prev)
                  setShowDurationMenu(false)
                  setShowPriceMenu(false)
                }}
              >
                <span>{selectedDate ? `출발: ${selectedDate}` : "출발일 선택"}</span>
                <img className="size-3.5" src={searchAsset("bce3e.svg")} alt="" />
              </button>

              {showDatePicker && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[220px] rounded-md border border-[#d9d9d9] bg-white p-3 shadow-lg">
                  <p className="mb-2 font-dot-semibold text-xs text-[#1596b4]">
                    출발 예정일 선택
                  </p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setShowDatePicker(false)
                    }}
                    className="w-full rounded border border-[#d9d9d9] p-1.5 font-dot-regular text-xs outline-none focus:border-[#1596b4]"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate("")
                        setShowDatePicker(false)
                      }}
                      className="mt-2 w-full text-right font-dot-regular text-xs text-[#888] underline"
                    >
                      날짜 선택 해제
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative max-sm:mx-4">
              <button
                className={`flex h-[34px] w-[190px] items-center justify-between border border-[#d9d9d9] px-3 font-dot-regular text-[13px] cursor-pointer max-sm:w-full ${
                  selectedDuration !== "전체" ? "border-[#1596b4] text-[#1596b4] font-semibold" : "text-[#151515]"
                }`}
                type="button"
                onClick={() => {
                  setShowDurationMenu((prev) => !prev)
                  setShowDatePicker(false)
                  setShowPriceMenu(false)
                }}
              >
                <span>{selectedDuration !== "전체" ? `기간: ${selectedDuration}` : "여행 기간 전체"}</span>
                <img className="size-3.5" src={searchAsset("bce3e.svg")} alt="" />
              </button>

              {showDurationMenu && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[190px] rounded-md border border-[#d9d9d9] bg-white py-1 shadow-lg">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(opt)
                        setShowDurationMenu(false)
                      }}
                      className={`block w-full px-4 py-2 text-left font-dot-regular text-xs hover:bg-[#f0f9fb] hover:text-[#1596b4] ${
                        selectedDuration === opt ? "font-semibold text-[#1596b4] bg-[#f0f9fb]" : "text-[#374151]"
                      }`}
                    >
                      {opt === "전체" ? "여행 기간 전체" : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative max-sm:mx-4">
              <button
                className={`flex h-[34px] w-[190px] items-center justify-between border border-[#d9d9d9] px-3 font-dot-regular text-[13px] cursor-pointer max-sm:w-full ${
                  selectedPriceRange !== "전체" ? "border-[#1596b4] text-[#1596b4] font-semibold" : "text-[#151515]"
                }`}
                type="button"
                onClick={() => {
                  setShowPriceMenu((prev) => !prev)
                  setShowDatePicker(false)
                  setShowDurationMenu(false)
                }}
              >
                <span>{selectedPriceRange !== "전체" ? selectedPriceRange : "가격 전체"}</span>
                <img className="size-3.5" src={searchAsset("bce3e.svg")} alt="" />
              </button>

              {showPriceMenu && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[190px] rounded-md border border-[#d9d9d9] bg-white py-1 shadow-lg">
                  {priceRangeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedPriceRange(opt)
                        setShowPriceMenu(false)
                      }}
                      className={`block w-full px-4 py-2 text-left font-dot-regular text-xs hover:bg-[#f0f9fb] hover:text-[#1596b4] ${
                        selectedPriceRange === opt ? "font-semibold text-[#1596b4] bg-[#f0f9fb]" : "text-[#374151]"
                      }`}
                    >
                      {opt === "전체" ? "가격 전체" : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="flex h-[34px] items-center gap-2 bg-[#1596b4] px-5 font-dot-regular text-sm text-white max-sm:mx-4 max-sm:justify-center cursor-pointer hover:bg-[#117a93] transition-colors"
              type="button"
            >
              <img className="size-4" src={searchAsset("a8e7a.svg")} alt="" />
              검색
            </button>
            
            <button
              className="font-dot-regular text-[13px] text-[#707070] hover:text-black max-lg:mr-4 max-sm:mx-4 cursor-pointer"
              type="button"
              onClick={resetFilters}
            >
              초기화
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-[100px]">
        <div className="flex items-center justify-between border-b border-[#151515] pb-[18px] max-sm:items-end">
          <h2 className="font-dot-medium text-xl">
            여행상품{" "}
            <span className="font-dot-semibold text-[#1596b4]">
              {filteredProducts.length}
            </span>개
          </h2>
          <div className="flex flex-wrap justify-end gap-x-5 gap-y-2">
            {sortOptions.map((option) => (
              <button
                className={`font-dot-regular text-sm cursor-pointer ${
                  sort === option
                    ? "font-dot-semibold text-[#1596b4]"
                    : "text-[#707070] hover:text-black"
                }`}
                key={option}
                type="button"
                onClick={() => setSort(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-[38px] gap-y-11 px-0 pt-[30px] sm:grid-cols-2 md:px-[30px] lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={`${product.title}-${product.duration}`}
                product={product}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center font-dot-regular text-base text-[#707070]">
            선택한 조건에 해당하는 여행 상품이 없습니다. 필터를 변경해 보세요.
          </div>
        )}

        <p className="px-[30px] pt-[30px] font-dot-regular text-xs text-[#707070]">
          성인 1인 기준 최저가이며, 출발일과 객실 선택에 따라 요금이 달라질 수 있습니다.
        </p>

        <nav
          className="flex items-center justify-center gap-2 pb-3 pt-10"
          aria-label="검색결과 페이지"
        >
          {[
            ["13a96.svg", "첫 페이지", () => setPage(1)],
            ["0d1e7.svg", "이전 페이지", () => setPage(Math.max(1, page - 1))],
          ].map(([icon, label, action]) => (
            <button
              type="button"
              aria-label={label as string}
              onClick={action as () => void}
              key={label as string}
              className="cursor-pointer"
            >
              <img
                className="size-[18px]"
                src={searchAsset(icon as string)}
                alt=""
              />
            </button>
          ))}
          {[1, 2, 3].map((number) => (
            <button
              className={`size-9 border font-dot-regular text-sm cursor-pointer ${
                page === number
                  ? "border-[#1596b4] bg-[#1596b4] text-white"
                  : "border-[#d9d9d9] bg-white text-[#151515]"
              }`}
              key={number}
              type="button"
              onClick={() => setPage(number)}
              aria-current={page === number ? "page" : undefined}
            >
              {number}
            </button>
          ))}
          {[
            ["b23bc.svg", "다음 페이지", () => setPage(Math.min(3, page + 1))],
            ["38128.svg", "마지막 페이지", () => setPage(3)],
          ].map(([icon, label, action]) => (
            <button
              type="button"
              aria-label={label as string}
              onClick={action as () => void}
              key={label as string}
              className="cursor-pointer"
            >
              <img
                className="size-[18px]"
                src={searchAsset(icon as string)}
                alt=""
              />
            </button>
          ))}
        </nav>
      </section>
    </main>
  )
}