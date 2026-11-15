import { useEffect, useMemo, useRef, useState } from "react"

const asset = (name: string) => `/assets/mypage-2001-114/${name}`

type ReservationStatus = "확정" | "대기" | "취소"
type ReservationFilter = "전체" | ReservationStatus

export type Reservation = {
  reservationNumber: string
  reservedAt: string
  title: string
  dates: string
  details: string
  category: string
  departure: string
  totalPrice: number
  status: ReservationStatus
  statusDetail: string
  image: string
  imageAlt: string
  deadlineAt?: string
  isDeadlinePassed?: boolean
  customer: {
    name: string
    birthDate: string
    phone: string
    email: string
  }
  companions: {
    name: string
    relationship: string
    birthDate: string
    passportName: string
  }[]
  options: {
    tourGrade: string
    hotel: string
    vehicle: string
    meal: string
    extras: string[]
  }
  payment: {
    method: string
    paidAt: string
    basePrice: number
    optionPrice: number
    discountPrice: number
  }
  refundStatus?: string
}

export const initialReservations: Reservation[] = [
  {
    reservationNumber: "20260928001",
    reservedAt: "2026.09.28",
    title: "[몰디브] 올인클루시브 4박 6일",
    dates: "2026.11.04 ~ 2026.11.09",
    deadlineAt: "2026.10.20",
    isDeadlinePassed: true,
    details: "성인 2명",
    category: "허니문",
    departure: "인천 출발",
    totalPrice: 6580000,
    status: "확정",
    statusDetail: "예약금 결제 완료",
    image: "8a4c7.png",
    imageAlt: "몰디브 해변과 리조트",
    customer: {
      name: "김민지",
      birthDate: "1994.05.18",
      phone: "010-1234-5678",
      email: "minji.kim@example.com",
    },
    companions: [
      {
        name: "이준호",
        relationship: "배우자",
        birthDate: "1992.11.03",
        passportName: "JUNHO LEE",
      },
    ],
    options: {
      tourGrade: "그랜드",
      hotel: "5성급 오션뷰 워터빌라",
      vehicle: "프리미엄 리무진",
      meal: "올인클루시브",
      extras: ["샴페인 1병", "고급 커피 세트", "선셋 크루즈"],
    },
    payment: {
      method: "신한카드 · 일시불",
      paidAt: "2026.09.28 14:32",
      basePrice: 6400000,
      optionPrice: 250000,
      discountPrice: 70000,
    },
  },
  {
    reservationNumber: "20260930002",
    reservedAt: "2026.09.30",
    title: "[그리스] 산토리니·아테네 6박 8일",
    dates: "2026.12.04 ~ 2026.12.11",
    deadlineAt: "2026.11.20",
    isDeadlinePassed: false,
    details: "성인 2명",
    category: "허니문",
    departure: "인천 출발",
    totalPrice: 7780000,
    status: "대기",
    statusDetail: "담당자 확인 중",
    image: "bbfe6.png",
    imageAlt: "그리스 산토리니의 해안 마을",
    customer: {
      name: "김민지",
      birthDate: "1994.05.18",
      phone: "010-1234-5678",
      email: "minji.kim@example.com",
    },
    companions: [
      {
        name: "이준호",
        relationship: "배우자",
        birthDate: "1992.11.03",
        passportName: "JUNHO LEE",
      },
    ],
    options: {
      tourGrade: "프리미엄",
      hotel: "5성급 부티크 호텔",
      vehicle: "전용 세단",
      meal: "현지 미식 코스",
      extras: ["산토리니 스냅 촬영", "와이너리 투어"],
    },
    payment: {
      method: "실시간 계좌이체",
      paidAt: "2026.09.30 10:18",
      basePrice: 7600000,
      optionPrice: 260000,
      discountPrice: 80000,
    },
  },
  {
    reservationNumber: "20260820003",
    reservedAt: "2026.08.20",
    title: "[인도네시아] 발리 풀빌라 4박 6일",
    dates: "2026.10.12 ~ 2026.10.17",
    details: "성인 2명",
    category: "허니문",
    departure: "인천 출발",
    totalPrice: 3780000,
    status: "취소",
    statusDetail: "2026.09.02 취소 완료",
    image: "8fbe1.png",
    imageAlt: "발리의 정원과 풀빌라",
    customer: {
      name: "김민지",
      birthDate: "1994.05.18",
      phone: "010-1234-5678",
      email: "minji.kim@example.com",
    },
    companions: [
      {
        name: "박서연",
        relationship: "친구",
        birthDate: "1994.08.22",
        passportName: "SEOYEON PARK",
      },
    ],
    options: {
      tourGrade: "클래식",
      hotel: "프라이빗 풀빌라",
      vehicle: "공항 픽업 전용차량",
      meal: "조식 포함",
      extras: ["플로팅 브렉퍼스트"],
    },
    payment: {
      method: "신한카드 · 일시불",
      paidAt: "2026.08.20 16:05",
      basePrice: 3700000,
      optionPrice: 120000,
      discountPrice: 40000,
    },
    refundStatus: "전액 환불 완료",
  },
]

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
  reservation,
  onClose,
  onCancel,
}: {
  reservation: Reservation
  onClose: () => void
  onCancel: () => void
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)
  const refundableAmount = reservation.totalPrice

  const isDeadlinePassed = useMemo(() => {
    if (typeof reservation.isDeadlinePassed === "boolean") {
      return reservation.isDeadlinePassed
    }
    if (reservation.deadlineAt) {
      const today = new Date()
      const deadline = new Date(reservation.deadlineAt.replace(/\./g, "-"))
      return today > deadline
    }
    return false
  }, [reservation])

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
              예약번호 {reservation.reservationNumber}
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

        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          <section className="flex flex-col gap-4 bg-[#f7f7f7] p-4 sm:flex-row sm:items-center">
            <img
              className="h-[104px] w-[126px] shrink-0 object-cover"
              src={asset(reservation.image)}
              alt={reservation.imageAlt}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#1596b4] px-2 py-1 font-dot-semibold text-xs text-white">
                  {reservation.status}
                </span>
                <span className="font-dot-regular text-xs text-[#707070]">
                  {reservation.statusDetail}
                </span>
              </div>
              <h3 className="mt-2 font-dot-semibold text-lg">
                {reservation.title}
              </h3>
              <p className="mt-1 font-dot-regular text-[13px] text-[#707070]">
                {reservation.dates} · {reservation.details} ·{" "}
                {reservation.departure}
              </p>
            </div>
            <p className="font-dot-bold text-xl text-[#1596b4]">
              {currency(reservation.totalPrice)}
            </p>
          </section>

          <div className="mt-6 space-y-5">
            <DetailGroup title="예약 고객 정보">
              <DetailItem label="예약자" value={reservation.customer.name} />
              <DetailItem
                label="생년월일"
                value={reservation.customer.birthDate}
              />
              <DetailItem label="휴대전화" value={reservation.customer.phone} />
              <DetailItem label="이메일" value={reservation.customer.email} />
            </DetailGroup>

            <DetailGroup
              title={`동행자 정보 · ${reservation.companions.length}명`}
            >
              {reservation.companions.map((companion) => (
                <div
                  className="contents"
                  key={`${reservation.reservationNumber}-${companion.name}`}
                >
                  <DetailItem
                    label="이름 / 관계"
                    value={`${companion.name} / ${companion.relationship}`}
                  />
                  <DetailItem label="생년월일" value={companion.birthDate} />
                  <DetailItem
                    label="여권 영문명"
                    value={companion.passportName}
                  />
                </div>
              ))}
            </DetailGroup>

            <DetailGroup title="여행 및 세부 옵션">
              <DetailItem label="여행 일정" value={reservation.dates} />
              <DetailItem label="테마" value={reservation.category} />
              <DetailItem
                label="투어 등급"
                value={reservation.options.tourGrade}
              />
              <DetailItem label="호텔" value={reservation.options.hotel} />
              <DetailItem label="차량" value={reservation.options.vehicle} />
              <DetailItem label="식사" value={reservation.options.meal} />
              <div className="sm:col-span-2">
                <DetailItem
                  label="추가 옵션"
                  value={
                    reservation.options.extras.join(" · ") || "추가 옵션 없음"
                  }
                />
              </div>
            </DetailGroup>

            <DetailGroup title="결제 및 환불 정보">
              <DetailItem
                label="결제 수단"
                value={reservation.payment.method}
              />
              <DetailItem
                label="결제 일시"
                value={reservation.payment.paidAt}
              />
              <DetailItem
                label="기본 상품금액"
                value={currency(reservation.payment.basePrice)}
              />
              <DetailItem
                label="옵션 추가금"
                value={`+${currency(reservation.payment.optionPrice)}`}
              />
              <DetailItem
                label="회원 할인"
                value={`-${currency(reservation.payment.discountPrice)}`}
              />
              <DetailItem
                label="총 결제금액"
                value={currency(reservation.totalPrice)}
              />
              {reservation.status === "취소" && (
                <>
                  <DetailItem
                    label="환불 상태"
                    value={reservation.refundStatus || "환불 접수 완료"}
                  />
                  <DetailItem
                    label="환불 예정액"
                    value={currency(refundableAmount)}
                  />
                </>
              )}
            </DetailGroup>
          </div>

          {confirmingCancel && (
            <div
              className="mt-1 border border-[#e4b8b8] bg-[#fff7f7] p-4"
              role="alert"
            >
              <p className="font-dot-semibold text-sm text-[#8b2c2c]">
                이 예약을 취소하고 환불을 접수하시겠습니까?
              </p>
              <p className="mt-2 font-dot-regular text-xs leading-[1.55] text-[#707070]">
                현재 기준 환불 예정 금액은 {currency(refundableAmount)}입니다.
                실제 환불 금액과 소요 기간은 취소 규정 및 결제사 확인 후
                확정됩니다.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="h-9 border border-[#d9d9d9] bg-white px-4 font-dot-regular text-sm cursor-pointer"
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                >
                  돌아가기
                </button>
                <button
                  className="h-9 bg-[#a43d3d] px-4 font-dot-semibold text-sm text-white cursor-pointer"
                  type="button"
                  onClick={() => {
                    onCancel()
                    setConfirmingCancel(false)
                  }}
                >
                  취소·환불 접수
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[#d9d9d9] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <button
            className="h-11 border border-[#d9d9d9] px-6 font-dot-regular text-sm cursor-pointer"
            type="button"
            onClick={onClose}
          >
            닫기
          </button>
          {reservation.status !== "취소" && (
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

function ReservationCard({
  reservation,
  onViewDetail,
}: {
  reservation: Reservation
  onViewDetail: () => void
}) {
  const statusStyle = {
    확정: "bg-[#f0f9fb] text-[#1596b4]",
    대기: "bg-[#fff7e8] text-[#966211]",
    취소: "bg-[#f1f1f1] text-[#707070]",
  }[reservation.status]

  return (
    <article className="grid gap-5 border-b border-[#d9d9d9] px-5 py-[22px] sm:grid-cols-[130px_1fr] lg:grid-cols-[130px_1fr_152px_148px] lg:items-center lg:gap-6">
      <img
        className="h-[108px] w-[130px] object-cover"
        src={asset(reservation.image)}
        alt={reservation.imageAlt}
      />
      <div className="min-w-0 font-dot-regular leading-[1.45]">
        <p className="text-xs text-[#707070]">
          예약번호 {reservation.reservationNumber} · 예약일{" "}
          {reservation.reservedAt}
        </p>
        <h2 className="mt-[7px] font-dot-medium text-lg text-[#151515]">
          {reservation.title}
        </h2>
        <p className="mt-[7px] text-[13px] text-[#151515]">
          {reservation.dates} · {reservation.details}
        </p>
        <p className="mt-[7px] text-xs text-[#707070]">
          {reservation.category} · {reservation.departure}
        </p>
      </div>
      <div className="font-dot-regular leading-[1.45] lg:text-right">
        <p className="font-dot-semibold text-lg text-[#151515]">
          {currency(reservation.totalPrice)}
        </p>
        <p className="mt-1.5 text-xs text-[#707070]">총 여행금액</p>
      </div>
      <div className="flex items-center gap-3 lg:flex-col lg:gap-[9px]">
        <span
          className={`flex h-7 w-16 items-center justify-center font-dot-semibold text-sm leading-[1.45] ${statusStyle}`}
        >
          {reservation.status}
        </span>
        <p className="font-dot-regular text-xs leading-[1.45] text-[#707070]">
          {reservation.statusDetail}
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
  reservations: propReservations,
  onCancelReservation,
  initialSelectedId,
}: {
  reservations?: Reservation[]
  onCancelReservation?: (reservationNumber: string) => void
  initialSelectedId?: string | null
}) {
  const reservations = propReservations || initialReservations
  const [activeFilter, setActiveFilter] = useState<ReservationFilter>("전체")
  const [selectedReservationNumber, setSelectedReservationNumber] =
    useState<string | null>(initialSelectedId || null)

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedReservationNumber(initialSelectedId)
    }
  }, [initialSelectedId])

  const selectedReservation = reservations.find(
    ({ reservationNumber }) => reservationNumber === selectedReservationNumber,
  )
  const filteredReservations = useMemo(
    () =>
      activeFilter === "전체"
        ? reservations
        : reservations.filter(({ status }) => status === activeFilter),
    [activeFilter, reservations],
  )
  const cancelReservation = (reservationNumber: string) => {
    if (onCancelReservation) {
      onCancelReservation(reservationNumber)
    }
  }

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
            const count = reservations.filter(
              (reservation) => reservation.status === status,
            ).length
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
                    : reservations.filter(({ status }) => status === filter)
                        .length
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
              최근 1년 · 2025.10.01 ~ 2026.10.01
            </p>
          </div>
          <div className="mt-5 border-x border-t border-[#d9d9d9]">
            <div className="hidden justify-between border-b border-[#d9d9d9] bg-[#f7f7f7] px-5 py-[11px] font-dot-regular text-[13px] lg:flex">
              <p>예약 상품 / 여행 일정</p>
              <p>예약금액 / 예약 상태</p>
            </div>
            {filteredReservations.map((reservation) => (
              <ReservationCard
                reservation={reservation}
                key={reservation.reservationNumber}
                onViewDetail={() =>
                  setSelectedReservationNumber(reservation.reservationNumber)
                }
              />
            ))}
          </div>
          <p className="mt-5 font-dot-regular text-xs leading-[1.45] text-[#707070]">
            대기 예약은 담당자 확인 후 확정됩니다. 예약 변경 및 취소는 예약 상세
            또는 고객센터에서 문의해 주세요.
          </p>
        </section>
      </div>
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservationNumber(null)}
          onCancel={() =>
            cancelReservation(selectedReservation.reservationNumber)
          }
        />
      )}
    </main>
  )
}