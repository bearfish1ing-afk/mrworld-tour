export type ThemeId = "honeymoon" | "parents" | "golf" | "trekking"

export type Product = {
  badge: string
  country: string
  title: string
  duration: string
  price: string
  image: string
}

export type SelectedProduct = Product & {
  theme: ThemeId
  themeLabel: string
}

type ProductSection = {
  title: string
  description: string
  products: Product[]
}

type ThemeData = {
  label: string
  eyebrow: string
  title: string
  description: string
  tags: string[]
  hero: string
  icons: string[]
  benefits: [string, string][]
  sections: ProductSection[]
}

const themeAsset = (theme: ThemeId, name: string) =>
  `/assets/theme-${theme}/${name}`

const product = (
  badge: string,
  country: string,
  title: string,
  duration: string,
  price: string,
  image: string,
): Product => ({ badge, country, title, duration, price, image })

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
    sections: [
      {
        title: "둘만의 휴양",
        description: "조용한 섬과 프라이빗 풀빌라에서 보내는 온전한 시간",
        products: [
          product(
            "프리미엄",
            "몰디브",
            "아리 아톨 오버워터 풀빌라 6일",
            "4박 6일 · 항공 포함",
            "3,890,000원~",
            "cfca1.png",
          ),
          product(
            "그랜드",
            "발리",
            "우붓 정글 풀빌라 & 스미냑 7일",
            "5박 7일 · 항공 포함",
            "2,790,000원~",
            "0a27c.png",
          ),
          product(
            "그랜드",
            "하와이",
            "마우이 오션프런트 리조트 7일",
            "5박 7일 · 항공 포함",
            "3,590,000원~",
            "5e8e9.png",
          ),
          product(
            "프리미엄",
            "모리셔스",
            "르몽 프라이빗 비치 리트리트 8일",
            "6박 8일 · 항공 포함",
            "4,290,000원~",
            "90657.png",
          ),
        ],
      },
      {
        title: "로맨틱 시티",
        description: "도시의 밤과 미식, 두 사람의 취향으로 완성하는 허니문",
        products: [
          product(
            "그랜드",
            "이탈리아",
            "로마·피렌체·베네치아 9일",
            "7박 9일 · 항공 포함",
            "4,190,000원~",
            "d51a3.png",
          ),
          product(
            "프리미엄",
            "프랑스",
            "파리 부티크 호텔 & 샹파뉴 8일",
            "6박 8일 · 항공 포함",
            "4,490,000원~",
            "af995.png",
          ),
          product(
            "그랜드",
            "스위스",
            "루체른·인터라켄 파노라마 8일",
            "6박 8일 · 항공 포함",
            "4,390,000원~",
            "95997.png",
          ),
          product(
            "그랜드",
            "스페인",
            "바르셀로나·마요르카 9일",
            "7박 9일 · 항공 포함",
            "3,990,000원~",
            "cab04.png",
          ),
        ],
      },
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
    sections: [
      {
        title: "일본",
        description: "좋은 물과 편안한 숙소, 천천히 머무는 일정",
        products: [
          product(
            "그랜드",
            "일본",
            "규슈 유후인·벳푸 온천 4일",
            "3박 4일 · 항공 포함",
            "1,690,000원~",
            "e4d44.png",
          ),
          product(
            "프리미엄",
            "일본",
            "홋카이도 노보리베츠 료칸 5일",
            "4박 5일 · 항공 포함",
            "2,190,000원~",
            "c89c1.png",
          ),
          product(
            "그랜드",
            "일본",
            "규슈 유후인·벳푸 온천 4일",
            "3박 4일 · 항공 포함",
            "1,690,000원~",
            "e4d44.png",
          ),
          product(
            "프리미엄",
            "일본",
            "홋카이도 노보리베츠 료칸 5일",
            "4박 5일 · 항공 포함",
            "2,190,000원~",
            "c89c1.png",
          ),
        ],
      },
      {
        title: "대만",
        description: "좋은 물과 편안한 숙소, 천천히 머무는 일정",
        products: Array.from({ length: 4 }, () =>
          product(
            "그랜드",
            "대만",
            "베이터우 온천 & 타이베이 4일",
            "3박 4일 · 항공 포함",
            "1,390,000원~",
            "8c196.png",
          ),
        ),
      },
      {
        title: "베트남",
        description: "좋은 물과 편안한 숙소, 천천히 머무는 일정",
        products: [
          product(
            "그랜드",
            "베트남",
            "다낭 웰니스 리조트 5일",
            "3박 5일 · 항공 포함",
            "1,590,000원~",
            "5b6af.png",
          ),
          product(
            "그랜드",
            "베트남",
            "하노이·하롱베이 크루즈 5일",
            "3박 5일 · 항공 포함",
            "1,690,000원~",
            "76903.png",
          ),
          product(
            "그랜드",
            "베트남",
            "다낭 웰니스 리조트 5일",
            "3박 5일 · 항공 포함",
            "1,590,000원~",
            "5b6af.png",
          ),
          product(
            "그랜드",
            "베트남",
            "하노이·하롱베이 크루즈 5일",
            "3박 5일 · 항공 포함",
            "1,690,000원~",
            "76903.png",
          ),
        ],
      },
      {
        title: "중국",
        description: "깊이 있는 해설과 검증된 식사로 채운 품격 있는 하루",
        products: Array.from({ length: 4 }, () =>
          product(
            "그랜드",
            "중국",
            "장가계 VIP 케이블카 5일",
            "4박 5일 · 항공 포함",
            "1,790,000원~",
            "19e4f.png",
          ),
        ),
      },
      {
        title: "태국",
        description: "깊이 있는 해설과 검증된 식사로 채운 품격 있는 하루",
        products: Array.from({ length: 4 }, () =>
          product(
            "프리미엄",
            "태국",
            "치앙마이 슬로우 트래블 6일",
            "4박 6일 · 항공 포함",
            "1,890,000원~",
            "359db.png",
          ),
        ),
      },
      {
        title: "싱가포르",
        description: "깊이 있는 해설과 검증된 식사로 채운 품격 있는 하루",
        products: Array.from({ length: 4 }, () =>
          product(
            "프리미엄",
            "싱가포르",
            "가든 시티 미식 여행 5일",
            "3박 5일 · 항공 포함",
            "2,090,000원~",
            "4fb58.png",
          ),
        ),
      },
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
    sections: [
      {
        title: "아시아 명문 코스",
        description: "짧은 비행, 완성도 높은 코스 컨디션과 리조트",
        products: [
          product(
            "그랜드",
            "일본",
            "미야자키 피닉스 54홀 4일",
            "3박 4일 · 항공 포함",
            "1,890,000원~",
            "7a7dd.png",
          ),
          product(
            "그랜드",
            "베트남",
            "다낭 호이아나 쇼어스 72홀 5일",
            "3박 5일 · 항공 포함",
            "1,790,000원~",
            "57774.png",
          ),
          product(
            "클래식",
            "태국",
            "후아힌 블랙마운틴 72홀 5일",
            "3박 5일 · 항공 포함",
            "1,590,000원~",
            "99b77.png",
          ),
          product(
            "그랜드",
            "말레이시아",
            "코타키나발루 수트라하버 5일",
            "3박 5일 · 항공 포함",
            "1,690,000원~",
            "0eccd.png",
          ),
        ],
      },
      {
        title: "버킷리스트 골프",
        description: "한 번쯤 플레이해야 할 풍경과 전통의 코스",
        products: [
          product(
            "프리미엄",
            "미국",
            "페블비치 시그니처 8일",
            "6박 8일 · 항공 포함",
            "8,900,000원~",
            "a2741.png",
          ),
          product(
            "프리미엄",
            "스코틀랜드",
            "세인트앤드루스 링크스 9일",
            "7박 9일 · 항공 포함",
            "9,800,000원~",
            "f9712.png",
          ),
          product(
            "그랜드",
            "호주",
            "멜버른 샌드벨트 7일",
            "5박 7일 · 항공 포함",
            "5,490,000원~",
            "254fd.png",
          ),
          product(
            "프리미엄",
            "뉴질랜드",
            "케이프키드내퍼스 8일",
            "6박 8일 · 항공 포함",
            "6,290,000원~",
            "1e5d1.png",
          ),
        ],
      },
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
    sections: [
      [
        "이탈리아",
        "돌로미티의 고산 풍경을 따라 걷는 대표 코스",
        "81fed.png",
        [
          [
            "그랜드",
            "돌로미티 트레치메 트레킹 9일",
            "7박 9일 · 항공 포함",
            "4,890,000원~",
          ],
          [
            "프리미엄",
            "코르티나·돌로미티 하이웨이 10일",
            "8박 10일 · 항공 포함",
            "5,490,000원~",
          ],
          [
            "클래식",
            "돌로미티 입문 트레일 7일",
            "5박 7일 · 항공 포함",
            "3,990,000원~",
          ],
          [
            "그랜드",
            "돌로미티 가족 트레일 8일",
            "6박 8일 · 항공 포함",
            "4,690,000원~",
          ],
        ],
      ],
      [
        "스위스",
        "융프라우의 파노라마 풍경을 따라 걷는 중급 코스",
        "cd6bf.png",
        [
          [
            "그랜드",
            "융프라우 파노라마 트레일 8일",
            "6박 8일 · 항공 포함",
            "5,190,000원~",
          ],
          [
            "프리미엄",
            "융프라우 하이 트레일 9일",
            "7박 9일 · 항공 포함",
            "5,990,000원~",
          ],
          [
            "클래식",
            "융프라우 입문 트레일 7일",
            "5박 7일 · 항공 포함",
            "4,490,000원~",
          ],
          [
            "그랜드",
            "융프라우 가족 트레일 8일",
            "6박 8일 · 항공 포함",
            "4,990,000원~",
          ],
        ],
      ],
      [
        "프랑스",
        "몽블랑의 하이라이트 코스를 소수 정예로 걷는 프리미엄 여행",
        "78415.png",
        [
          [
            "프리미엄",
            "뚜르 드 몽블랑 하이라이트 10일",
            "8박 10일 · 항공 포함",
            "5,690,000원~",
          ],
          ["그랜드", "몽블랑 서킷 8일", "6박 8일 · 항공 포함", "4,990,000원~"],
          [
            "클래식",
            "몽블랑 입문 트레일 7일",
            "5박 7일 · 항공 포함",
            "4,290,000원~",
          ],
          [
            "프리미엄",
            "몽블랑 가족 트레일 9일",
            "7박 9일 · 항공 포함",
            "5,790,000원~",
          ],
        ],
      ],
      [
        "네팔",
        "안나푸르나 베이스캠프를 향한 대자연 원정",
        "e3f88.png",
        [
          [
            "그랜드",
            "안나푸르나 베이스캠프 12일",
            "10박 12일 · 항공 포함",
            "3,690,000원~",
          ],
          [
            "프리미엄",
            "에베레스트 베이스캠프 13일",
            "11박 13일 · 항공 포함",
            "4,290,000원~",
          ],
          [
            "클래식",
            "안나푸르나 입문 트레일 10일",
            "8박 10일 · 항공 포함",
            "3,290,000원~",
          ],
          [
            "그랜드",
            "안나푸르나 가족 트레일 11일",
            "9박 11일 · 항공 포함",
            "3,990,000원~",
          ],
        ],
      ],
      [
        "페루",
        "잉카 트레일과 마추픽추를 함께 걷는 원정 코스",
        "7837e.png",
        [
          [
            "프리미엄",
            "잉카 트레일 & 마추픽추 10일",
            "8박 10일 · 항공 포함",
            "5,290,000원~",
          ],
          [
            "그랜드",
            "잉카 트레일 & 마추픽추 11일",
            "9박 11일 · 항공 포함",
            "5,890,000원~",
          ],
          [
            "클래식",
            "마추픽추 입문 트레일 8일",
            "6박 8일 · 항공 포함",
            "4,490,000원~",
          ],
          [
            "프리미엄",
            "마추픽추 가족 트레일 9일",
            "7박 9일 · 항공 포함",
            "5,490,000원~",
          ],
        ],
      ],
      [
        "뉴질랜드",
        "밀포드 트랙을 완주하는 대자연 원정 코스",
        "c8132.png",
        [
          [
            "프리미엄",
            "밀포드 트랙 완주 11일",
            "9박 11일 · 항공 포함",
            "5,890,000원~",
          ],
          [
            "그랜드",
            "루터 트랙 완주 10일",
            "8박 10일 · 항공 포함",
            "5,490,000원~",
          ],
          [
            "클래식",
            "밀포드 입문 트레일 9일",
            "7박 9일 · 항공 포함",
            "4,890,000원~",
          ],
          [
            "프리미엄",
            "밀포드 가족 트레일 10일",
            "8박 10일 · 항공 포함",
            "5,990,000원~",
          ],
        ],
      ],
    ].map(([title, description, image, items]) => ({
      title: title as string,
      description: description as string,
      products: (items as string[][]).map(([badge, name, duration, price]) =>
        product(badge, title as string, name, duration, price, image as string),
      ),
    })),
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
        {theme.sections.map((section) => (
          <section key={section.title}>
            <div className="flex items-center justify-between border-y border-[#171717] bg-[#c7e8ef] px-6 py-[18px]">
              <div>
                <h2 className="font-eb-semibold text-2xl">{section.title}</h2>
                <p className="mt-1 font-dot-regular text-xs text-[#686868]">
                  {section.description}
                </p>
              </div>

              <button
                className="font-dot-semibold text-xs cursor-pointer hover:text-[#1596b4] transition-colors"
                type="button"
                onClick={() => {
                  const marketingTitles = ["둘만의 휴양", "로맨틱 시티", "아시아 명문 코스", "버킷리스트 골프"]
                  const searchQuery = marketingTitles.includes(section.title)
                    ? theme.label
                    : section.title

                  onSearch?.(searchQuery)
                  window.scrollTo({ top: 0 });
                }}
              >
                전체 보기 →
              </button>
            </div>
            <div className="mt-[30px] grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[22px]">
              {section.products.map((item, index) => (
                <button
                  className="min-w-0 text-left"
                  type="button"
                  key={`${section.title}-${item.title}-${index}`}
                  onClick={() =>
                    onProductSelect?.({
                      ...item,
                      theme: activeTheme,
                      themeLabel: theme.label,
                    })
                  }
                >
                  <div className="relative h-[172px] overflow-hidden">
                    <img
                      className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                      src={themeAsset(activeTheme, item.image)}
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
                    <p className="font-dot-bold text-[17px]">{item.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
