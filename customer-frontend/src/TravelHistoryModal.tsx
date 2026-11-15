import { useEffect, useRef } from "react"

const travelHistory = [
  {
    dates: "26/09/29~26/10/3",
    relativeDate: "최근",
    title: "[테마] 나라 도시 투어",
    grade: "그랜드",
    options: "5성급 호텔 / 2인 고급 차량 / 고급 레스토랑",
    price: "₩ 2,000,000",
  },
  {
    dates: "26/08/12~26/08/15",
    relativeDate: "1주 전",
    title: "[테마] 자연 휴양지 투어",
    grade: "클래식",
    options: "4성급 호텔 / 공항 픽업 / 중식 포함",
    price: "₩ 1,250,000",
  },
  {
    dates: "26/07/05~26/07/08",
    relativeDate: "1개월 전",
    title: "[테마] 문화 체험 투어",
    grade: "프리미엄",
    options: "3성급 게스트하우스 / 공유 차량 / 전일정 가이드",
    price: "₩ 850,000",
  },
]

export default function TravelHistoryModal({
  onClose,
  onViewAll,
  onSelectHistory,
}: {
  onClose: () => void
  onViewAll: () => void
  onSelectHistory?: (index: number) => void
}) {
  const viewAllButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    viewAllButton.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby="travel-history-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[400px] flex-col gap-2.5 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white px-[30px] py-5 shadow-[0_12px_16px_rgba(0,0,0,0.08)]"
        role="dialog"
      >
        <div className="flex min-h-10 items-center justify-between border-y border-[#171717] bg-[#c7e8ef] px-2.5">
          <h2
            className="font-eb-semibold text-[15px] leading-normal text-[#111]"
            id="travel-history-title"
          >
            지난 여행 이력
          </h2>
        </div>

        <div>
          {travelHistory.map((history, index) => (
            <article
              className="flex flex-col gap-3 border-b border-[#e5e7eb] py-4 cursor-pointer hover:bg-[#f9fafb] transition-colors rounded-lg px-2"
              key={history.dates}
              onClick={() => onSelectHistory?.(index)}
            >
              <div className="flex items-start justify-between">
                <p className="font-dot-semibold text-sm leading-[1.1] tracking-[-0.28px] text-[#374151]">
                  {history.dates}
                </p>
                <p className="font-dot-medium text-xs leading-normal text-[#6b7280]">
                  {history.relativeDate}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="size-[68px] shrink-0 rounded bg-[#f3f4f6]"
                />
                <div className="min-w-0">
                  <h3 className="font-dot-bold text-base leading-[1.3] tracking-[-0.32px] text-[#111827]">
                    {history.title}
                  </h3>
                  <p className="mt-1 font-dot-medium text-xs leading-[1.3] tracking-[-0.24px] text-[#6b7280]">
                    투어 등급: {history.grade}
                  </p>
                  <p className="mt-1 font-dot-regular text-xs leading-[1.3] tracking-[-0.24px] text-[#6b7280]">
                    세부 옵션: {history.options}
                  </p>
                  <p className="mt-1 font-dot-bold text-sm leading-[1.3] tracking-[-0.28px] text-[#111827]">
                    {history.price}
                  </p>
                </div>
              </div>
            </article>
          ))}
          <div className="flex justify-center pt-2">
            <div className="h-1 w-10 rounded-sm bg-[#d1d5db]" />
          </div>
        </div>

        <div className="pt-3">
          <button
            className="flex w-full items-center justify-center rounded-lg bg-[#1596b4] px-4 py-3 font-dot-semibold text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-[#1596b4] focus-visible:ring-offset-2 cursor-pointer"
            type="button"
            onClick={onViewAll}
            ref={viewAllButton}
          >
            전체 이력 보기
          </button>
        </div>
      </div>
    </div>
  )
}