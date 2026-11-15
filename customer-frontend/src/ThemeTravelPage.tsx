import { useEffect, useState } from "react"
import { errorMessage, isAbort } from "./api/client"
import { searchProducts } from "./api/customer"
import type { ProductSummary } from "./api/types"
import {
  themeBackendIds,
  toSelectedProduct,
  type SelectedProduct,
  type ThemeId,
} from "./api/view"

export type { SelectedProduct, ThemeId }

type ThemeData = {
  label: string
  eyebrow: string
  title: string
  description: string
  tags: string[]
  hero: string
  icons: string[]
  benefits: [string, string][]
}

const themeAsset = (theme: ThemeId, name: string) =>
  `/assets/theme-${theme}/${name}`

const themes: Record<ThemeId, ThemeData> = {
  honeymoon: {
    label: "허니문",
    eyebrow: "HONEYMOON COLLECTION",
    title: "두 사람만을 위한, 오래 남을 첫 여행",
    description:
      "프라이빗한 이동과 로맨틱한 순간까지 세심하게 준비한 허니문 컬렉션",
    tags: ["몰디브", "발리", "하와이", "로맨틱 리조트"],
    hero: "e7d21.png",
    icons: ["f1205.svg", "0504c.svg", "2066e.svg"],
    benefits: [
      ["로맨틱 스페셜 룸 데코레이션", "체크인 첫날 객실 연출 서비스"],
      ["커플 기념티", "여행을 기억할 맞춤 기념품"],
      ["전용 고급차량", "공항부터 리조트까지 프라이빗 이동"],
    ],
  },
  parents: {
    label: "효도",
    eyebrow: "PREMIUM FAMILY JOURNEY",
    title: "부모님께 드리는, 편안하고 품격 있는 여행",
    description:
      "무리 없는 동선과 세심한 건강 케어로 온 가족이 안심할 수 있는 효도 여행",
    tags: ["일본 온천", "대만", "베트남", "가족과 함께하는 힐링"],
    hero: "b4a78.png",
    icons: ["04caf.svg", "16a2b.svg", "6b7eb.svg"],
    benefits: [
      ["고품격 안마·지압", "여정 중 전문 케어 프로그램 제공"],
      ["건강 인삼 기념품", "부모님을 위한 정성 어린 선물"],
      ["10인 승합 고급차량", "넓은 좌석과 여유로운 단체 이동"],
    ],
  },
  golf: {
    label: "골프",
    eyebrow: "SIGNATURE GOLF RESORTS",
    title: "세계적인 코스에서 완성하는 한 번의 라운드",
    description:
      "검증된 명문 골프 리조트와 여유로운 이동을 한 번에 담은 골프 테마 여행",
    tags: ["명문 코스", "골프 리조트", "전용 차량", "티타임 보장"],
    hero: "68fac.png",
    icons: ["de393.svg", "96908.svg", "6b7eb.svg"],
    benefits: [
      ["유명 골프 리조트", "지역을 대표하는 명문 코스 엄선"],
      ["골프 액세서리·골프공", "라운드를 위한 웰컴 기프트"],
      ["10인 승합 고급차량", "골프백까지 여유로운 전용 이동"],
    ],
  },
  trekking: {
    label: "트레킹",
    eyebrow: "MOUNTAIN ADVENTURE",
    title: "걷는 만큼 깊어지는, 산악 어드벤처",
    description:
      "전문 인솔과 안전 장비, 자연의 결을 따라 걷는 트레킹·산악 어드벤처 컬렉션",
    tags: ["히말라야", "알프스", "돌로미티", "전문 인솔"],
    hero: "419d7.png",
    icons: ["c3e48.svg", "9506a.svg", "6b7eb.svg"],
    benefits: [
      ["트레킹·산악 어드벤처", "난이도별 전문 코스와 인솔자"],
      ["아웃도어 스카프", "바람과 햇빛을 막아줄 웰컴 기프트"],
      ["10인 승합 고급차량", "장비까지 넉넉한 베이스 이동"],
    ],
  },
}

const themeOrder: ThemeId[] = ["honeymoon", "parents", "golf", "trekking"]

function SearchPanel({
  theme,
  onSearch,
}: {
  theme: ThemeData
  onSearch?: (query: string) => void
}) {
  return (
    <form
      className="w-full bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.14)] lg:w-[300px]"
      onSubmit={(event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        onSearch?.(form.get("destination")?.toString() || theme.label)
      }}
    >
      <h2 className="font-dot-bold text-lg text-[#111]">
        {theme.label} 여행 찾기
      </h2>
      <p className="mt-1 font-dot-regular text-xs text-[#686868]">
        원하는 조건으로 상품을 확인하세요.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block font-dot-semibold text-[11px] text-[#111]">
          여행지
          <select
            className="mt-2 h-[38px] w-full border border-[#d9d9d9] bg-[#f7f7f7] px-3 font-dot-regular text-xs text-[#686868]"
            name="destination"
            defaultValue=""
          >
            <option value="">어디로 떠나시나요?</option>
            {theme.tags.map((tag) => (
              <option value={tag} key={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-dot-semibold text-[11px] text-[#111]">
          출발지
          <select className="mt-2 h-[38px] w-full border border-[#d9d9d9] bg-[#f7f7f7] px-3 font-dot-regular text-xs text-[#686868]">
            <option>인천 / 김포</option>
          </select>
        </label>
        <label className="block font-dot-semibold text-[11px] text-[#111]">
          여행 시작일
          <input
            className="mt-2 h-[38px] w-full border border-[#d9d9d9] bg-[#f7f7f7] px-3 font-dot-regular text-xs text-[#686868]"
            type="date"
          />
        </label>
      </div>
      <button
        className="mt-5 h-[42px] w-full rounded bg-[#1596b4] font-dot-bold text-sm text-white transition-colors hover:bg-[#117f99]"
        type="submit"
      >
        검색하기
      </button>
    </form>
  )
}

export default function ThemeTravelPage({
  activeTheme,
  onThemeChange,
  onSearch,
  onProductSelect,
}: {
  activeTheme: ThemeId
  onThemeChange: (theme: ThemeId) => void
  onSearch?: (query: string) => void
  onProductSelect?: (product: SelectedProduct) => void
}) {
  const theme = themes[activeTheme]
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError("")
    searchProducts({ themeId: themeBackendIds[activeTheme], size: 8 }, controller.signal)
      .then((page) => setProducts(page.content))
      .catch((error) => {
        if (!isAbort(error)) setLoadError(errorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [activeTheme])

  return (
    <main className="bg-white text-[#111]">
      <nav
        className="mx-auto flex h-[54px] max-w-[1280px] items-stretch gap-2 overflow-x-auto px-5 md:px-10 lg:px-[100px]"
        aria-label="테마 여행"
      >
        <span className="mr-3 flex items-center font-roboto-regular text-[10px] text-[#686868]">
          THEME
        </span>
        {themeOrder.map((id) => (
          <button
            className={`border-b-[3px] px-2.5 font-roboto-regular text-sm ${
              id === activeTheme
                ? "border-[#1596b4] font-roboto-bold text-[#1596b4]"
                : "border-transparent text-[#111]"
            }`}
            type="button"
            onClick={() => onThemeChange(id)}
            key={id}
          >
            {themes[id].label}
          </button>
        ))}
      </nav>

      <section className="relative min-h-[520px] overflow-hidden">
        <img
          className="absolute inset-0 size-full object-cover"
          src={themeAsset(activeTheme, theme.hero)}
          alt=""
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1280px] flex-col gap-10 px-5 py-12 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-[100px]">
          <div className="max-w-[590px] text-white">
            <p
              className="font-roboto-bold text-xs tracking-[1.44px] text-[#20afcf]"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              {theme.eyebrow}
            </p>
            <h1 className="mt-5 font-dot-bold text-[34px] leading-[1.16] tracking-[-1.38px] md:text-[46px]">
              {theme.title}
            </h1>
            <p className="mt-5 max-w-[520px] font-dot-regular text-base leading-[1.6]">
              {theme.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-3.5 gap-y-2 font-dot-regular text-xs">
              {theme.tags.map((tag) => (
                <span key={tag}># {tag}</span>
              ))}
            </div>
          </div>
          <SearchPanel theme={theme} onSearch={onSearch} />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] grid-cols-1 px-5 py-[30px] sm:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-[100px]">
        {theme.benefits.map(([title, description], index) => (
          <div
            className={`flex min-h-[64px] items-center gap-[13px] px-[22px] ${
              index > 0 ? "border-[#d9d9d9] lg:border-l" : ""
            }`}
            key={title + index}
          >
            <img
              className="size-[25px] shrink-0"
              src={themeAsset(
                activeTheme,
                theme.icons[index % theme.icons.length],
              )}
              alt=""
            />
            <div>
              <h2 className="font-dot-bold text-sm">{title}</h2>
              <p className="mt-1 font-dot-regular text-[11px] leading-[1.35] text-[#686868]">
                {description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-[72px] px-5 pb-0 pt-5 md:px-10 lg:px-[100px]">
        <section>
          <div className="flex items-center justify-between border-y border-[#171717] bg-[#c7e8ef] px-6 py-[18px]">
            <div>
              <h2 className="font-eb-semibold text-2xl">{theme.label} 여행 상품</h2>
              <p className="mt-1 font-dot-regular text-xs text-[#686868]">
                지금 예약할 수 있는 {theme.label} 테마 상품입니다.
              </p>
            </div>

            <button
              className="font-dot-semibold text-xs cursor-pointer hover:text-[#1596b4] transition-colors"
              type="button"
              onClick={() => {
                onSearch?.(theme.label)
                window.scrollTo({ top: 0 })
              }}
            >
              전체 보기 →
            </button>
          </div>
          {loading ? (
            <p className="py-16 text-center font-dot-regular text-sm text-[#707070]">
              상품을 불러오는 중입니다...
            </p>
          ) : loadError ? (
            <p className="py-16 text-center font-dot-regular text-sm text-[#a43d3d]">
              {loadError}
            </p>
          ) : products.length === 0 ? (
            <p className="py-16 text-center font-dot-regular text-sm text-[#707070]">
              현재 예약 가능한 {theme.label} 상품이 없습니다.
            </p>
          ) : (
            <div className="mt-[30px] grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[22px]">
              {products.map((summary) => {
                const item = toSelectedProduct(summary)
                return (
                  <button
                    className="min-w-0 text-left cursor-pointer"
                    type="button"
                    key={item.id}
                    onClick={() => onProductSelect?.(item)}
                  >
                    <div className="relative h-[172px] overflow-hidden">
                      <img
                        className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        src={item.image}
                        alt=""
                      />
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <p className="font-dot-bold text-[11px] text-[#1596b4]">
                        {item.country}
                      </p>
                      <h3 className="min-h-[42px] font-dot-semibold text-[15px] leading-[1.35]">
                        {item.title}
                      </h3>
                      <p className="font-dot-regular text-[11px] text-[#686868]">
                        {item.duration}
                      </p>
                      <p className="font-dot-bold text-[17px]">
                        {item.price.toLocaleString("ko-KR")}원~
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
