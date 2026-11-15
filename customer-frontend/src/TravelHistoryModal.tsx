import { useEffect, useRef } from "react"
import type { ReservationListItem } from "./api/types"
import { gradeLabel, statusLabels } from "./api/view"

// "3일 전", "2주 전" 같은 상대 날짜
function relativeDate(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (Number.isNaN(days) || days < 1) return "최근"
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  if (days < 365) return `${Math.floor(days / 30)}개월 전`
  return `${Math.floor(days / 365)}년 전`
}

const shortDate = (value: string) => value.slice(2, 10).replace(/-/g, "/")

export default function TravelHistoryModal({
  items,
  onClose,
  onViewAll,
  onSelectHistory,
}: {
  items: ReservationListItem[]
  onClose: () => void
  onViewAll: () => void
  onSelectHistory?: (reservationId: number) => void
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
          {items.map((history) => (
            <article
              className="flex flex-col gap-3 border-b border-[#e5e7eb] py-4 cursor-pointer hover:bg-[#f9fafb] transition-colors rounded-lg px-2"
              key={history.reservationId}
              onClick={() => onSelectHistory?.(history.reservationId)}
            >
              <div className="flex items-start justify-between">
                <p className="font-dot-semibold text-sm leading-[1.1] tracking-[-0.28px] text-[#374151]">
                  {shortDate(history.departureDate)}~{shortDate(history.returnDate)}
                </p>
                <p className="font-dot-medium text-xs leading-normal text-[#6b7280]">
                  {relativeDate(history.reservedAt)}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="size-[68px] shrink-0 rounded bg-[#f3f4f6]"
                />
                <div className="min-w-0">
                  <h3 className="font-dot-bold text-base leading-[1.3] tracking-[-0.32px] text-[#111827]">
                    {history.productTitle}
                  </h3>
                  <p className="mt-1 font-dot-medium text-xs leading-[1.3] tracking-[-0.24px] text-[#6b7280]">
                    투어 등급: {gradeLabel(history.grade)}
                  </p>
                  <p className="mt-1 font-dot-regular text-xs leading-[1.3] tracking-[-0.24px] text-[#6b7280]">
                    성인 {history.people}명 · {statusLabels[history.status]}
                  </p>
                  <p className="mt-1 font-dot-bold text-sm leading-[1.3] tracking-[-0.28px] text-[#111827]">
                    ₩ {history.finalAmount.toLocaleString("ko-KR")}
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