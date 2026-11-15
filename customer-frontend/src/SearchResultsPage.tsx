import { useEffect, useMemo, useState } from "react"
import { errorMessage, isAbort } from "./api/client"
import { searchProducts, voiceSearch } from "./api/customer"
import type { ProductSummary } from "./api/types"
import {
  themeBackendIds,
  themeIdFromLabel,
  themeLabels,
  toSelectedProduct,
  tripDays,
  type SelectedProduct,
  type ThemeId,
} from "./api/view"

// 헤더 검색창 / 음성 검색에서 넘어오는 검색 요청
export type SearchRequest = {
  text: string
  voice?: boolean
  nonce: number // 같은 검색어로 다시 검색해도 새로 불러오도록
}

const searchAsset = (name: string) => `/assets/search-4001-13/${name}`

const regions = ["전체", "유럽", "동남아", "일본", "남태평양", "미주", "국내"]
const themes = ["전체", "허니문", "효도", "골프", "트레킹"]
const sortOptions = ["추천순", "낮은 가격순", "높은 가격순", "출발일순"]
const durationOptions = ["전체", "3~4일", "5~6일", "7일 이상"]
const priceRangeOptions = ["전체", "200만원 이하", "200~300만원", "300만원 이상"]
const PAGE_SIZE = 12

// 가격 구간 → 백엔드 minPrice / maxPrice
const priceRanges: Record<string, { min?: number; max?: number }> = {
  전체: {},
  "200만원 이하": { max: 2_000_000 },
  "200~300만원": { min: 2_000_000, max: 3_000_000 },
  "300만원 이상": { min: 3_000_000 },
}

function priceRangeFrom(min: number | null, max: number | null): string {
  const found = Object.entries(priceRanges).find(
    ([, r]) => (r.min ?? null) === min && (r.max ?? null) === max,
  )
  return found ? found[0] : "전체"
}

// 백엔드에는 지역 정보가 없어서 국가명으로 지역을 나눔
const regionCountries: Record<string, string[]> = {
  유럽: ["그리스", "프랑스", "이탈리아", "스위스", "스페인", "영국", "독일", "오스트리아", "체코", "포르투갈", "크로아티아", "네덜란드", "노르웨이", "아이슬란드", "튀르키예", "터키", "헝가리"],
  동남아: ["태국", "베트남", "인도네시아", "발리", "필리핀", "말레이시아", "싱가포르", "라오스", "캄보디아"],
  일본: ["일본"],
  남태평양: ["몰디브", "괌", "사이판", "피지", "호주", "뉴질랜드", "팔라우", "타히티", "모리셔스"],
  미주: ["미국", "하와이", "캐나다", "멕시코", "페루", "칠레"],
  국내: ["한국", "대한민국", "국내", "제주"],
}

function matchesRegion(product: ProductSummary, region: string) {
  if (region === "전체") return true
  const names = regionCountries[region] ?? []
  return names.some((name) => product.country.includes(name) || product.title.includes(name))
}

function matchesDuration(product: ProductSummary, duration: string) {
  if (duration === "전체") return true
  const days = tripDays(product.departureDate, product.returnDate)
  if (duration === "3~4일") return days >= 3 && days <= 4
  if (duration === "5~6일") return days >= 5 && days <= 6
  if (duration === "7일 이상") return days >= 7
  return true
}

function themeLabelById(themeId: number | null): string {
  if (themeId == null) return "전체"
  const found = (Object.keys(themeBackendIds) as ThemeId[]).find(
    (id) => themeBackendIds[id] === themeId,
  )
  return found ? themeLabels[found] : "전체"
}

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
  product: ProductSummary
  onSelect?: (product: SelectedProduct) => void
}) {
  const item = toSelectedProduct(product)
  const seatsLeft = Math.max(0, product.maxPeople - product.currentPeople)
  return (
    <button
      className="flex min-w-0 flex-col gap-2.5 text-left cursor-pointer group"
      type="button"
      onClick={() => onSelect?.(item)}
    >
      <div className="overflow-hidden rounded-md">
        <img
          className="aspect-[225/200] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={item.image}
          alt={item.title}
        />
      </div>
      <p className="font-dot-regular text-base leading-[1.1] tracking-[-0.32px] text-[#1596b4] font-semibold">
        {item.themeLabel}
      </p>
      <div className="font-dot-regular text-xl leading-[1.3] tracking-[-0.4px] text-black">
        <p>{product.title}</p>
      </div>
      <p className="font-dot-regular text-[13px] text-[#707070]">
        {product.country} · {item.duration}
        {product.status === "CONFIRMED" ? " · 출발 확정" : ""}
      </p>
      <p className="font-dot-semibold text-xl tracking-[-0.4px] text-black">
        {product.basePrice.toLocaleString("ko-KR")}원~
      </p>
      <p className="font-dot-regular text-xs text-[#707070]">
        {product.departureDate.replace(/-/g, ".")} 출발 · 잔여 {seatsLeft}석
      </p>
    </button>
  )
}

export default function SearchResultsPage({
  request,
  onProductSelect,
}: {
  request: SearchRequest
  onProductSelect?: (product: SelectedProduct) => void
}) {
  const keyword = request.text
  const [region, setRegion] = useState("전체")
  const [theme, setTheme] = useState("전체")
  const [searchText, setSearchText] = useState("")

  const [sort, setSort] = useState("추천순")
  const [page, setPage] = useState(1)

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedDateTo, setSelectedDateTo] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("전체")
  const [selectedPriceRange, setSelectedPriceRange] = useState("전체")

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDurationMenu, setShowDurationMenu] = useState(false)
  const [showPriceMenu, setShowPriceMenu] = useState(false)

  const [results, setResults] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [voiceNote, setVoiceNote] = useState("")
  const [ready, setReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 헤더 검색어(또는 음성 문장)를 필터로 풀어서 적용
  useEffect(() => {
    const trimmed = keyword.trim()
    const controller = new AbortController()
    setVoiceNote("")
    setSelectedDate("")
    setSelectedDateTo("")
    setSelectedDuration("전체")
    setSelectedPriceRange("전체")
    setPage(1)

    if (request.voice) {
      // 음성 문장 → 백엔드가 조건(테마/날짜/가격/키워드)으로 해석
      setReady(false)
      setLoading(true)
      setLoadError("")
      voiceSearch(trimmed, controller.signal)
        .then(({ filters }) => {
          setTheme(themeLabelById(filters.themeId))
          setRegion("전체")
          setSearchText(filters.keyword ?? "")
          setSelectedDate(filters.departureFrom ?? "")
          setSelectedDateTo(filters.departureTo ?? "")
          setSelectedPriceRange(priceRangeFrom(filters.minPrice, filters.maxPrice))
          setVoiceNote(`음성 검색: “${trimmed}”`)
        })
        .catch((error) => {
          if (isAbort(error)) return
          setVoiceNote(`음성 검색을 해석하지 못해 “${trimmed}”(으)로 검색했습니다.`)
          setTheme("전체")
          setRegion("전체")
          setSearchText(trimmed)
        })
        .finally(() => {
          if (!controller.signal.aborted) setReady(true)
        })
      return () => controller.abort()
    }

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
    setReady(true)
    setRefreshKey((k) => k + 1)
    return () => controller.abort()
  }, [keyword, request.voice, request.nonce])

  // 서버 조건(테마/키워드/출발일/가격)이 바뀌면 백엔드에서 다시 조회
  useEffect(() => {
    if (!ready) return
    const controller = new AbortController()
    const themeId = themeIdFromLabel(theme)
    const range = priceRanges[selectedPriceRange] ?? {}
    setLoading(true)
    setLoadError("")
    searchProducts(
      {
        themeId: themeId ? themeBackendIds[themeId] : undefined,
        keyword: searchText || undefined,
        departureFrom: selectedDate || undefined,
        departureTo: selectedDateTo || undefined,
        minPrice: range.min,
        maxPrice: range.max,
        page: 0,
        size: 100,
      },
      controller.signal,
    )
      .then((res) => setResults(res.content))
      .catch((error) => {
        if (isAbort(error)) return
        setResults([])
        setLoadError(errorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [ready, theme, searchText, selectedDate, selectedDateTo, selectedPriceRange, refreshKey])

  useEffect(() => {
    setPage(1)
  }, [region, theme, searchText, selectedDate, selectedDuration, selectedPriceRange, sort])

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    setSearchText("")
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setSearchText("")
  }

  // 지역/기간/정렬은 화면에서 처리
  const filteredProducts = useMemo(() => {
    const list = results.filter(
      (product) => matchesRegion(product, region) && matchesDuration(product, selectedDuration),
    )
    return [...list].sort((a, b) => {
      if (sort === "낮은 가격순") return a.basePrice - b.basePrice
      if (sort === "높은 가격순") return b.basePrice - a.basePrice
      if (sort === "출발일순") return a.departureDate.localeCompare(b.departureDate)
      return 0
    })
  }, [results, region, selectedDuration, sort])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  const resetFilters = () => {
    setRegion("전체")
    setTheme("전체")
    setSearchText("")
    setSelectedDate("")
    setSelectedDateTo("")
    setSelectedDuration("전체")
    setSelectedPriceRange("전체")
    setSort("추천순")
    setVoiceNote("")
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
            {loading
              ? "여행상품을 불러오는 중입니다..."
              : `총 ${filteredProducts.length}개의 여행상품이 있습니다.`}
          </p>
          {voiceNote && (
            <p className="mt-1.5 font-dot-regular text-xs text-[#1596b4]">{voiceNote}</p>
          )}
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
                        setSelectedDateTo("")
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
              onClick={() => setRefreshKey((k) => k + 1)}
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

        {loading ? (
          <div className="py-20 text-center font-dot-regular text-base text-[#707070]">
            여행상품을 불러오는 중입니다...
          </div>
        ) : loadError ? (
          <div className="py-20 text-center font-dot-regular text-base text-[#a43d3d]">
            {loadError}
          </div>
        ) : pagedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-[38px] gap-y-11 px-0 pt-[30px] sm:grid-cols-2 md:px-[30px] lg:grid-cols-4">
            {pagedProducts.map((product) => (
              <ProductCard
                key={product.id}
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
            ["0d1e7.svg", "이전 페이지", () => setPage(Math.max(1, currentPage - 1))],
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
          {pageNumbers.map((number) => (
            <button
              className={`size-9 border font-dot-regular text-sm cursor-pointer ${
                currentPage === number
                  ? "border-[#1596b4] bg-[#1596b4] text-white"
                  : "border-[#d9d9d9] bg-white text-[#151515]"
              }`}
              key={number}
              type="button"
              onClick={() => setPage(number)}
              aria-current={currentPage === number ? "page" : undefined}
            >
              {number}
            </button>
          ))}
          {[
            ["b23bc.svg", "다음 페이지", () => setPage(Math.min(totalPages, currentPage + 1))],
            ["38128.svg", "마지막 페이지", () => setPage(totalPages)],
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