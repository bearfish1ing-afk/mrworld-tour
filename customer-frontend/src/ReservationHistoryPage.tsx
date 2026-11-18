import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { errorMessage } from "./api/client"
import {
  cancelReservation as cancelReservationApi,
  getMyReservation,
  getMyReservations,
  getProduct,
} from "./api/customer"
import type {
  ReservationDetail,
  ReservationListItem,
  UserResponse,
} from "./api/types"
import {
  formatDate,
  formatDateTime,
  gradeLabel,
  productImage,
  statusLabels,
  toThemeId,
  type StatusLabel,
} from "./api/view"

type ReservationStatus = StatusLabel
type ReservationFilter = "전체" | ReservationStatus

const optionTypeLabels: Record<string, string> = {
  GRADE: "투어 등급",
  HOTEL: "호텔",
  MEAL: "식사",
  VEHICLE: "차량",
  DRINK: "음료",
  ETC: "기타",
}

const formatPhone = (phone: string) =>
  phone.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3")

// 목록 카드에 쓰는 이미지 (예약 응답에는 테마가 없어 상품 ID로 고름)
const reservationImage = (productId: number) => productImage(productId, null)

const filters: ReservationFilter[] = ["전체", "대기", "확정", "취소"]
const currency = (price: number) => `${price.toLocaleString("ko-KR")}원`

function DetailGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="border-b border-[#151515] pb-2 font-dot-semibold text-base">
        {title}
      </h3>
      <div className="grid gap-x-8 gap-y-3 py-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 font-dot-regular text-[13px] leading-[1.55]">
      <span className="text-[#707070]">{label}</span>
      <span className="break-words text-[#151515]">{value}</span>
    </div>
  )
}

function ReservationDetailModal({
  reservationId,
  user,
  onClose,
  onCanceled,
}: {
  reservationId: number
  user: UserResponse
  onClose: () => void
  onCanceled: () => void
}) {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null)
  const [loadError, setLoadError] = useState("")
  const [deadline, setDeadline] = useState<string | null>(null)
  const [image, setImage] = useState(reservationImage(reservationId))
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")
  const closeButton = useRef<HTMLButtonElement>(null)

  const load = useCallback(() => {
    setLoadError("")
    getMyReservation(reservationId)
      .then((detail) => {
        setReservation(detail)
        setImage(reservationImage(detail.productId))
        // 모집 마감일은 상품 정보에 있음 (모집 중/출발 확정 상품만 조회 가능)
        getProduct(detail.productId)
          .then((p) => {
            setDeadline(p.product.deadline)
            setImage(productImage(p.product.id, toThemeId(p.product.theme)))
          })
          .catch(() => setDeadline(null))
      })
      .catch((error) => setLoadError(errorMessage(error)))
  }, [reservationId])

  useEffect(() => {
    load()
  }, [load])

  const isDeadlinePassed = useMemo(
    () => (deadline ? new Date(deadline).getTime() < Date.now() : false),
    [deadline],
  )

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButton.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [onClose])

  const cancel = async () => {
    setCanceling(true)
    setCancelError("")
    try {
      await cancelReservationApi(reservationId)
      setConfirmingCancel(false)
      onCanceled()
      load()
    } catch (error) {
      setCancelError(errorMessage(error))
    } finally {
      setCanceling(false)
    }
  }

  const status = reservation ? statusLabels[reservation.status] : null
  const refundableAmount = reservation?.finalAmount ?? 0
  const optionValue = (type: string) =>
    reservation?.options
      .filter((o) => o.type === type)
      .map((o) => o.name)
      .join(", ") || "-"
  const extras = reservation?.options.filter((o) => o.type === "DRINK" || o.type === "ETC") ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby="reservation-detail-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[760px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-[#d9d9d9] bg-[#c7e8ef] px-5 py-4 sm:px-7">
          <div>
            <p className="font-dot-regular text-xs text-[#597078]">
              예약번호 {reservation?.reservationCode ?? "-"}
            </p>
            <h2
              className="mt-1 font-dot-semibold text-xl text-[#151515]"
              id="reservation-detail-title"
            >
              예약 상세 내역
            </h2>
          </div>
          <button
            aria-label="예약 상세 닫기"
            className="flex size-9 items-center justify-center rounded-full text-2xl text-[#151515] hover:bg-white/60 cursor-pointer"
            type="button"
            onClick={onClose}
            ref={closeButton}
          >
            ×
          </button>
        </header>

        {!reservation ? (
          <div className="px-5 py-16 text-center font-dot-regular text-sm text-[#707070] sm:px-7">
            {loadError || "예약 정보를 불러오는 중입니다..."}
          </div>
        ) : (
          <div className="overflow-y-auto px-5 py-5 sm:px-7">
            <section className="flex flex-col gap-4 bg-[#f7f7f7] p-4 sm:flex-row sm:items-center">
              <img
                className="h-[104px] w-[126px] shrink-0 object-cover"
                src={image}
                alt={reservation.productTitle}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#1596b4] px-2 py-1 font-dot-semibold text-xs text-white">
                    {status}
                  </span>
                  <span className="font-dot-regular text-xs text-[#707070]">
                    {statusDetail(reservation.status)}
                  </span>
                </div>
                <h3 className="mt-2 font-dot-semibold text-lg">{reservation.productTitle}</h3>
                <p className="mt-1 font-dot-regular text-[13px] text-[#707070]">
                  {formatDate(reservation.departureDate)} ~ {formatDate(reservation.returnDate)} ·
                  성인 {reservation.people}명
                </p>
              </div>
              <p className="font-dot-bold text-xl text-[#1596b4]">
                {currency(reservation.finalAmount)}
              </p>
            </section>

            <div className="mt-6 space-y-5">
              <DetailGroup title="예약 고객 정보">
                <DetailItem label="예약자" value={user.name} />
                <DetailItem label="휴대전화" value={formatPhone(user.phoneNum)} />
                <DetailItem label="이메일" value={user.email} />
                <DetailItem label="예약 일시" value={formatDateTime(reservation.reservedAt)} />
              </DetailGroup>

              <DetailGroup title="여행 및 세부 옵션">
                <DetailItem
                  label="여행 일정"
                  value={`${formatDate(reservation.departureDate)} ~ ${formatDate(reservation.returnDate)}`}
                />
                <DetailItem label="인원" value={`성인 ${reservation.people}명`} />
                <DetailItem label="투어 등급" value={gradeLabel(reservation.grade)} />
                <DetailItem label="호텔" value={optionValue("HOTEL")} />
                <DetailItem label="차량" value={reservation.vehicle || optionValue("VEHICLE")} />
                <DetailItem label="식사" value={optionValue("MEAL")} />
                <div className="sm:col-span-2">
                  <DetailItem
                    label="추가 옵션"
                    value={
                      extras
                        .map(
                          (o) =>
                            `${optionTypeLabels[o.type] ?? o.type} ${o.name}${o.isDefault ? " (기본)" : ""}`,
                        )
                        .join(" · ") || "추가 옵션 없음"
                    }
                  />
                </div>
              </DetailGroup>

              <DetailGroup title="결제 및 환불 정보">
                <DetailItem label="결제 수단" value={reservation.paymentMethod || "-"} />
                <DetailItem label="결제 일시" value={formatDateTime(reservation.reservedAt)} />
                <DetailItem label="기본 상품금액" value={currency(reservation.baseAmount)} />
                <DetailItem
                  label="옵션 추가금"
                  value={`${reservation.optionAmount < 0 ? "-" : "+"}${currency(Math.abs(reservation.optionAmount))}`}
                />
                <DetailItem label="회원 할인" value={`-${currency(reservation.discountAmount)}`} />
                <DetailItem label="총 결제금액" value={currency(reservation.finalAmount)} />
                {status === "취소" && (
                  <>
                    <DetailItem label="환불 상태" value="환불 접수 완료" />
                    <DetailItem label="환불 예정액" value={currency(refundableAmount)} />
                  </>
                )}
              </DetailGroup>
            </div>

            {confirmingCancel && (
              <div className="mt-1 border border-[#e4b8b8] bg-[#fff7f7] p-4" role="alert">
                <p className="font-dot-semibold text-sm text-[#8b2c2c]">
                  이 예약을 취소하고 환불을 접수하시겠습니까?
                </p>
                <p className="mt-2 font-dot-regular text-xs leading-[1.55] text-[#707070]">
                  현재 기준 환불 예정 금액은 {currency(refundableAmount)}입니다.
                  실제 환불 금액과 소요 기간은 취소 규정 및 결제사 확인 후
                  확정됩니다.
                </p>
                {cancelError && (
                  <p className="mt-2 font-dot-semibold text-xs text-[#a43d3d]">{cancelError}</p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="h-9 border border-[#d9d9d9] bg-white px-4 font-dot-regular text-sm cursor-pointer"
                    type="button"
                    onClick={() => setConfirmingCancel(false)}
                  >
                    돌아가기
                  </button>
                  <button
                    className="h-9 bg-[#a43d3d] px-4 font-dot-semibold text-sm text-white cursor-pointer disabled:cursor-wait disabled:opacity-60"
                    type="button"
                    disabled={canceling}
                    onClick={cancel}
                  >
                    {canceling ? "처리 중..." : "취소·환불 접수"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="flex flex-col-reverse gap-3 border-t border-[#d9d9d9] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <button
            className="h-11 border border-[#d9d9d9] px-6 font-dot-regular text-sm cursor-pointer"
            type="button"
            onClick={onClose}
          >
            닫기
          </button>
          {reservation && status !== "취소" && (
            <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
              {isDeadlinePassed && (
                <span className="font-dot-regular text-xs text-[#a43d3d]">
                  ※ 모집 마감일이 지나 시스템 취소가 불가능합니다.
                </span>
              )}
              <button
                className="h-11 border border-[#a43d3d] px-6 font-dot-semibold text-sm text-[#a43d3d] transition-colors cursor-pointer disabled:border-[#d9d9d9] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed"
                type="button"
                disabled={isDeadlinePassed}
                onClick={() => setConfirmingCancel(true)}
              >
                여행 예약 취소(환불)
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}

function statusDetail(status: ReservationListItem["status"]) {
  if (status === "CONFIRMED") return "출발 확정"
  if (status === "PENDING") return "출발 인원 모집 중"
  return "취소·환불 접수 완료"
}

function ReservationCard({
  reservation,
  onViewDetail,
}: {
  reservation: ReservationListItem
  onViewDetail: () => void
}) {
  const status = statusLabels[reservation.status]
  const statusStyle = {
    확정: "bg-[#f0f9fb] text-[#1596b4]",
    대기: "bg-[#fff7e8] text-[#966211]",
    취소: "bg-[#f1f1f1] text-[#707070]",
  }[status]

  return (
    <article className="grid gap-5 border-b border-[#d9d9d9] px-5 py-[22px] sm:grid-cols-[130px_1fr] lg:grid-cols-[130px_1fr_152px_148px] lg:items-center lg:gap-6">
      <img
        className="h-[108px] w-[130px] object-cover"
        src={reservationImage(reservation.productId)}
        alt={reservation.productTitle}
      />
      <div className="min-w-0 font-dot-regular leading-[1.45]">
        <p className="text-xs text-[#707070]">
          예약번호 {reservation.reservationCode} · 예약일 {formatDate(reservation.reservedAt)}
        </p>
        <h2 className="mt-[7px] font-dot-medium text-lg text-[#151515]">
          {reservation.productTitle}
        </h2>
        <p className="mt-[7px] text-[13px] text-[#151515]">
          {formatDate(reservation.departureDate)} ~ {formatDate(reservation.returnDate)} · 성인{" "}
          {reservation.people}명
        </p>
        <p className="mt-[7px] text-xs text-[#707070]">
          {gradeLabel(reservation.grade)} 등급
        </p>
      </div>
      <div className="font-dot-regular leading-[1.45] lg:text-right">
        <p className="font-dot-semibold text-lg text-[#151515]">
          {currency(reservation.finalAmount)}
        </p>
        <p className="mt-1.5 text-xs text-[#707070]">총 여행금액</p>
      </div>
      <div className="flex items-center gap-3 lg:flex-col lg:gap-[9px]">
        <span
          className={`flex h-7 w-16 items-center justify-center font-dot-semibold text-sm leading-[1.45] ${statusStyle}`}
        >
          {status}
        </span>
        <p className="font-dot-regular text-xs leading-[1.45] text-[#707070]">
          {statusDetail(reservation.status)}
        </p>
        <button
          className="ml-auto flex h-9 w-[100px] items-center justify-center border border-[#d9d9d9] bg-white font-dot-regular text-sm text-[#151515] lg:ml-0 cursor-pointer"
          type="button"
          onClick={onViewDetail}
        >
          예약 상세
        </button>
      </div>
    </article>
  )
}

export default function ReservationHistoryPage({
  user,
  initialSelectedId,
}: {
  user: UserResponse
  initialSelectedId?: number | null
}) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [activeFilter, setActiveFilter] = useState<ReservationFilter>("전체")
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(
    initialSelectedId ?? null,
  )

  const load = useCallback(() => {
    setLoadError("")
    getMyReservations()
      .then((list) =>
        setReservations([...list].sort((a, b) => b.reservedAt.localeCompare(a.reservedAt))),
      )
      .catch((error) => setLoadError(errorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedReservationId(initialSelectedId)
    }
  }, [initialSelectedId])

  const countOf = (status: ReservationStatus) =>
    reservations.filter((r) => statusLabels[r.status] === status).length

  const filteredReservations = useMemo(
    () =>
      activeFilter === "전체"
        ? reservations
        : reservations.filter(({ status }) => statusLabels[status] === activeFilter),
    [activeFilter, reservations],
  )

  const closeDetail = useCallback(() => setSelectedReservationId(null), [])

  return (
    <main className="bg-white text-[#151515]">
      <div className="mx-auto max-w-[1280px] px-5 pb-[72px] pt-[26px] md:px-10 lg:px-[100px]">
        <p className="font-roboto-regular text-xs text-[#707070]">
          홈&nbsp;&nbsp;›&nbsp;&nbsp;예약 내역
        </p>
        <section className="mt-6 border-y border-[#171717] bg-[#c7e8ef] px-[30px] py-5">
          <h1 className="font-dot-medium text-[28px] leading-[1.45]">
            예약 내역
          </h1>
          <p className="mt-2.5 font-dot-regular text-[15px] leading-[1.45]">
            예약한 여행 상품과 진행 상태를 확인하세요.
          </p>
        </section>

        <section
          className="mt-6 grid border border-[#d9d9d9] sm:grid-cols-3"
          aria-label="예약 상태 요약"
        >
          {(["대기", "확정", "취소"] as ReservationStatus[]).map((status) => {
            const count = countOf(status)
            return (
              <button
                className={`flex min-h-[88px] flex-col items-center justify-center gap-1 font-dot-regular ${
                  activeFilter === status ? "bg-[#f0f9fb]" : "bg-white"
                } border-b border-[#d9d9d9] last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 cursor-pointer`}
                type="button"
                key={status}
                onClick={() => setActiveFilter(status)}
              >
                <span className="text-[13px] leading-[1.45] text-[#707070]">
                  {status}
                </span>
                <span className="font-dot-semibold text-[23px] text-[#1596b4]">
                  {count}{" "}
                  <small className="font-dot-regular text-[13px] text-[#151515]">
                    건
                  </small>
                </span>
              </button>
            )
          })}
        </section>

        <section className="mt-11">
          <div className="flex items-end justify-between gap-4 border-b border-[#151515] pb-4">
            <h2 className="font-dot-medium text-[22px] leading-[1.45]">
              예약 내역 · 상태
            </h2>
            <p className="font-dot-regular text-[13px] text-[#707070]">
              전체 {reservations.length}건
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const count =
                  filter === "전체"
                    ? reservations.length
                    : countOf(filter)
                const active = activeFilter === filter
                return (
                  <button
                    className={`border px-4 py-[7px] font-dot-regular text-sm leading-[1.45] cursor-pointer ${
                      active
                        ? "border-[#1596b4] bg-[#f0f9fb] font-dot-semibold text-[#1596b4]"
                        : "border-[#d9d9d9] bg-white text-[#707070]"
                    }`}
                    type="button"
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter} {count}
                  </button>
                )
              })}
            </div>
            <p className="font-dot-regular text-[13px] text-[#707070]">
              {user.name}님의 전체 예약
            </p>
          </div>
          <div className="mt-5 border-x border-t border-[#d9d9d9]">
            <div className="hidden justify-between border-b border-[#d9d9d9] bg-[#f7f7f7] px-5 py-[11px] font-dot-regular text-[13px] lg:flex">
              <p>예약 상품 / 여행 일정</p>
              <p>예약금액 / 예약 상태</p>
            </div>
            {loading ? (
              <p className="border-b border-[#d9d9d9] px-5 py-12 text-center font-dot-regular text-sm text-[#707070]">
                예약 내역을 불러오는 중입니다...
              </p>
            ) : loadError ? (
              <p className="border-b border-[#d9d9d9] px-5 py-12 text-center font-dot-regular text-sm text-[#a43d3d]">
                {loadError}
              </p>
            ) : filteredReservations.length === 0 ? (
              <p className="border-b border-[#d9d9d9] px-5 py-12 text-center font-dot-regular text-sm text-[#707070]">
                예약 내역이 없습니다.
              </p>
            ) : (
              filteredReservations.map((reservation) => (
                <ReservationCard
                  reservation={reservation}
                  key={reservation.reservationId}
                  onViewDetail={() => setSelectedReservationId(reservation.reservationId)}
                />
              ))
            )}
          </div>
          <p className="mt-5 font-dot-regular text-xs leading-[1.45] text-[#707070]">
            대기 예약은 담당자 확인 후 확정됩니다. 예약 취소는 예약 상세에서 할 수
            있으며 예약 변경은 고객센터로 문의해 주세요.
          </p>
        </section>
      </div>
      {selectedReservationId !== null && (
        <ReservationDetailModal
          key={selectedReservationId}
          reservationId={selectedReservationId}
          user={user}
          onClose={closeDetail}
          onCanceled={load}
        />
      )}
    </main>
  )
}