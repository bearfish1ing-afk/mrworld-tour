import { useState, type ReactNode } from "react"
import type { ReservationSelection } from "./ProductDetailPage"
import type { SelectedProduct } from "./ThemeTravelPage"

const paymentAsset = (name: string) => `/assets/payment-6001-1589/${name}`

const inputClass =
  "h-9 w-full border border-[#d9d9d9] bg-white px-3 font-dot-regular text-[13px] text-[#151515] outline-none focus:border-[#1596b4]"

function SectionTitle({
  children,
  aside,
}: {
  children: ReactNode
  aside?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#151515] pb-4">
      <h2 className="font-dot-medium text-[22px] leading-[1.45] text-[#151515]">
        {children}
      </h2>
      {aside && (
        <span className="font-dot-regular text-xs text-[#707070]">{aside}</span>
      )}
    </div>
  )
}

function InfoRow({
  label,
  required = true,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex min-h-[60px] flex-col border-b border-[#d9d9d9] sm:flex-row">
      <div className="flex items-center bg-[#f7f7f7] px-5 py-3 sm:w-40 sm:shrink-0">
        <span className="font-dot-medium text-sm text-[#151515]">
          {label}
          {required && <span className="text-[#1596b4]"> *</span>}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 px-5 py-2.5">
        {children}
      </div>
    </div>
  )
}

function CheckBox({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`flex size-4 shrink-0 items-center justify-center border ${
        checked ? "border-[#1596b4] bg-[#1596b4]" : "border-[#bcbcbc] bg-white"
      }`}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
    >
      {checked && <img src={paymentAsset("f6f5a.svg")} alt="" />}
    </button>
  )
}

export default function PaymentPage({
  product,
  reservation,
  username,
  onBack,
  onPaymentSuccess,
}: {
  product: SelectedProduct
  reservation: ReservationSelection
  username: string
  onBack: () => void
  onPaymentSuccess?: (paymentInfo: { paymentMethod: string; finalPrice: number }) => void
}) {
  const [paymentMethod, setPaymentMethod] =
    useState<"card" | "transfer" | "virtual">("card")
  const [agreements, setAgreements] = useState([true, true, true, true])
  const [complete, setComplete] = useState(false)
  const [sameAsBooker, setSameAsBooker] = useState(true);

  const [bookerName, setBookerName] = useState(username || "김민지");
  const [bookerPhone, setBookerPhone] = useState("010-1234-5678");

  const [travelerName, setTravelerName] = useState(username || "김민지");
  const [travelerPhone, setTravelerPhone] = useState("010-1234-5678");
  const [travelerBirth, setTravelerBirth] = useState("1994.05.18");
  const [passportLastName, setPassportLastName] = useState("");
  const [passportFirstName, setPassportFirstName] = useState("");

  const handleSameAsBookerToggle = () => {
    const nextState = !sameAsBooker;
    setSameAsBooker(nextState);
    if (nextState) {
      setTravelerName(bookerName);
      setTravelerPhone(bookerPhone);
    }
  };

  const handleBookerNameChange = (name: string) => {
    setBookerName(name);
    if (sameAsBooker) setTravelerName(name);
  };

  const handleBookerPhoneChange = (phone: string) => {
    setBookerPhone(phone);
    if (sameAsBooker) setTravelerPhone(phone);
  };
  const currency = (price: number) => `${price.toLocaleString("ko-KR")}원`
  const signedCurrency = (price: number, sign: "+" | "-") =>
    `${sign}${currency(price)}`
  const allAgreed = agreements.every(Boolean)
  const membershipDiscount = Math.floor(reservation.totalPrice * 0.01)
  const finalPrice = reservation.totalPrice - membershipDiscount
  const extras = reservation.additionalOptions.map(
    ({ label, price }) => `${label} ${signedCurrency(price, "+")}`,
  )

  const handlePaymentSubmit = () => {
    setComplete(true)
    setTimeout(() => {
      onPaymentSuccess?.({
        paymentMethod:
          paymentMethod === "card"
            ? "신용·체크카드 · 일시불"
            : paymentMethod === "transfer"
            ? "실시간 계좌이체"
            : "가상계좌",
        finalPrice,
      })
    }, 800)
  }

  return (
    <main className="bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-11 px-5 pb-[72px] pt-[26px] md:px-10 lg:px-[100px]">
        <header className="border-y border-[#171717] bg-[#c7e8ef] px-[30px] py-5 text-[#151515]">
          <h1 className="font-dot-medium text-[28px] leading-[1.45]">
            주문·결제
          </h1>
          <p className="mt-2.5 font-dot-regular text-[15px] leading-[1.45]">
            선택한 여행 상품과 예약 정보를 확인한 후 결제를 진행해 주세요.
          </p>
        </header>

        <section className="space-y-5">
          <SectionTitle>주문 상품 확인</SectionTitle>
          <div className="flex flex-col gap-6 border border-[#d9d9d9] p-5 md:flex-row md:items-center">
            <img
              className="h-[130px] w-[154px] object-cover"
              src={paymentAsset("8a4c7.png")}
              alt=""
            />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-dot-regular text-[13px] text-[#1596b4]">
                {product.themeLabel}
              </p>
              <h2 className="font-dot-medium text-[22px] leading-[1.45] text-[#151515]">
                {product.title}
              </h2>
              <p className="font-dot-regular text-[13px] leading-[1.45]">
                여행 시작일 2026.10.24 (토) · 예약 인원 {reservation.people}명
              </p>
              <p className="font-dot-regular text-xs leading-[1.45] text-[#707070]">
                투어 등급: {product.badge}
              </p>
            </div>
            <div className="md:w-[190px] md:text-right">
              <p className="font-dot-semibold text-xl">
                {currency(finalPrice)}
              </p>
              <p className="mt-2 font-dot-regular text-xs text-[#707070]">
                옵션 추가금 및 회원 할인 적용
              </p>
            </div>
          </div>
          <div className="border-x border-t border-[#d9d9d9]">
            <InfoRow label="서비스 옵션" required={false}>
              <p className="font-dot-regular text-[13px]">
                {reservation.tourGrade} · {reservation.hotel} ·{" "}
                {reservation.vehicle} · {reservation.meal}
              </p>
            </InfoRow>
            <InfoRow label="추가 옵션" required={false}>
              <p className="font-dot-regular text-[13px]">
                {extras.length ? extras.join(" · ") : "추가 옵션 미선택"}
              </p>
            </InfoRow>
          </div>
          <div className="bg-[#f0f9fb] px-5 py-3 font-dot-regular text-xs leading-[1.6] text-[#707070]">
            <strong className="font-dot-semibold text-[#151515]">
              각 테마는 3명 이상 신청 시 예약 확정됩니다.
            </strong>
            <br />
            현재 선택 인원은 {reservation.people}명입니다. 결제 후에도 예약은
            대기 상태이며, 확정 시 안내 문자를 발송드립니다.
          </div>
        </section>

        <section className="space-y-5">
          <SectionTitle aside="* 필수 입력 항목">예약자 정보</SectionTitle>
          <div className="border-x border-t border-[#d9d9d9]">
            <InfoRow label="이름">
              <input
                className={`${inputClass} max-w-80`}
                value={bookerName}
                onChange={(e) => handleBookerNameChange(e.target.value)}
              />
            </InfoRow>
            <InfoRow label="휴대전화">
              <input
                className={`${inputClass} max-w-80`}
                value={bookerPhone}
                onChange={(e) => handleBookerPhoneChange(e.target.value)}
                inputMode="tel"
              />
            </InfoRow>
          </div>
        </section>

        <section className="space-y-5">
          <SectionTitle aside={`총 ${reservation.people}명`}>
            여행자 정보
          </SectionTitle>
          <div className="border border-[#d9d9d9]">
            <div className="flex items-center justify-between border-b border-[#d9d9d9] px-5 py-3.5">
              <p className="font-dot-medium text-sm">
                여행자 정보 · 성인 {reservation.people}명
              </p>
              <div 
                className="flex items-center gap-2 font-dot-regular text-xs cursor-pointer select-none"
                onClick={handleSameAsBookerToggle}
              >
                <CheckBox checked={sameAsBooker} onClick={handleSameAsBookerToggle} />
                <span>예약자와 동일</span>
              </div>
            </div>

            <InfoRow label="이름">
              <input
                className={`${inputClass} max-w-80 ${sameAsBooker ? "bg-[#f3f4f6] text-[#6b7280]" : ""}`}
                value={sameAsBooker ? bookerName : travelerName}
                readOnly={sameAsBooker}
                onChange={(e) => setTravelerName(e.target.value)}
              />
            </InfoRow>

            <InfoRow label="생년월일">
              <input
                className={`${inputClass} max-w-80`}
                value={travelerBirth}
                onChange={(e) => setTravelerBirth(e.target.value)}
              />
            </InfoRow>

            <InfoRow label="여권 영문명">
              <input
                className={`${inputClass} max-w-[200px]`}
                placeholder="성 (LAST NAME)"
                value={passportLastName}
                onChange={(e) => setPassportLastName(e.target.value)}
              />
              <input
                className={`${inputClass} max-w-[200px]`}
                placeholder="이름 (FIRST NAME)"
                value={passportFirstName}
                onChange={(e) => setPassportFirstName(e.target.value)}
              />
            </InfoRow>

            <InfoRow label="휴대전화">
              <input
                className={`${inputClass} max-w-80 ${sameAsBooker ? "bg-[#f3f4f6] text-[#6b7280]" : ""}`}
                value={sameAsBooker ? bookerPhone : travelerPhone}
                readOnly={sameAsBooker}
                onChange={(e) => setTravelerPhone(e.target.value)}
                inputMode="tel"
              />
            </InfoRow>
          </div>
        </section>

        <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-9">
            <section className="space-y-5">
              <SectionTitle>결제 수단</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3">
                {[
                  ["card", "신용·체크카드"],
                  ["transfer", "실시간 계좌이체"],
                  ["virtual", "가상계좌"],
                ].map(([value, label]) => (
                  <button
                    className={`flex h-14 items-center justify-center gap-2 border font-dot-medium text-sm ${
                      paymentMethod === value
                        ? "border-[#1596b4] bg-[#f0f9fb] text-[#1596b4]"
                        : "border-[#d9d9d9] bg-white text-[#151515]"
                    }`}
                    type="button"
                    onClick={() =>
                      setPaymentMethod(value as "card" | "transfer" | "virtual")
                    }
                    key={value}
                  >
                    <img
                      src={paymentAsset(
                        paymentMethod === value ? "6b478.svg" : "cd364.svg",
                      )}
                      alt=""
                    />
                    {label}
                  </button>
                ))}
              </div>
              {paymentMethod === "card" && (
                <div className="space-y-3 border border-[#d9d9d9] p-5">
                  {[
                    ["카드사", "신한카드"],
                    ["할부 기간", "일시불"],
                  ].map(([label, value]) => (
                    <label className="flex items-center gap-5" key={label}>
                      <span className="w-20 font-dot-medium text-sm">
                        {label}
                      </span>
                      <span className="relative block max-w-[430px] flex-1">
                        <select className={`${inputClass} appearance-none`}>
                          <option>{value}</option>
                        </select>
                        <img
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                          src={paymentAsset("d8b7d.svg")}
                          alt=""
                        />
                      </span>
                    </label>
                  ))}
                  <p className="font-dot-regular text-[11px] text-[#707070]">
                    결제하기를 누르면 카드사 결제창에서 안전하게 결제가
                    진행됩니다.
                  </p>
                </div>
              )}
            </section>

            <section className="space-y-5">
              <SectionTitle aside="필수 항목을 확인해 주세요.">
                약관 및 동의
              </SectionTitle>
              <div className="flex items-center gap-2 bg-[#f0f9fb] px-4 py-3">
                <CheckBox
                  checked={allAgreed}
                  onClick={() =>
                    setAgreements(agreements.map(() => !allAgreed))
                  }
                />
                <span className="font-dot-semibold text-sm">
                  필수 약관에 모두 동의합니다.
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "[필수] 여행 약관 및 취소·환불 규정 동의",
                  "[필수] 개인정보 수집·이용 동의",
                  "[필수] 개인정보 제3자 제공 동의",
                  "[필수] 주문 내용 확인 및 결제 진행 동의",
                ].map((label, index) => (
                  <div className="flex items-center gap-2" key={label}>
                    <CheckBox
                      checked={agreements[index]}
                      onClick={() =>
                        setAgreements((current) =>
                          current.map((value, itemIndex) =>
                            itemIndex === index ? !value : value,
                          ),
                        )
                      }
                    />
                    <span className="font-dot-regular text-[13px]">
                      {label}
                    </span>
                    <button
                      className="ml-auto font-dot-regular text-[11px] text-[#707070] underline"
                      type="button"
                    >
                      내용 보기
                    </button>
                  </div>
                ))}
              </div>
              <p className="font-dot-regular text-[11px] leading-[1.55] text-[#707070]">
                취소 시점과 상품별 규정에 따라 취소 수수료가 발생할 수 있습니다.
                결제 전 취소·환불 규정을 반드시 확인해 주세요.
              </p>
            </section>
          </div>

          <aside className="self-start border border-[#d9d9d9] p-6 lg:sticky lg:top-6 lg:w-[350px] lg:shrink-0">
            <h2 className="border-b border-[#151515] pb-4 font-dot-medium text-[22px]">
              결제 금액
            </h2>
            <div className="space-y-3 border-b border-[#d9d9d9] py-5 font-dot-regular text-sm">
              <div className="flex justify-between">
                <span>기본 가격 · {reservation.people}명</span>
                <span>{currency(reservation.baseTotal)}</span>
              </div>
              {[
                ...reservation.detailOptions,
                ...reservation.additionalOptions,
              ].map(({ label, price }) => (
                <div className="flex justify-between" key={label}>
                  <span>{label}</span>
                  <span className="text-[#1596b4]">
                    {signedCurrency(price, "+")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-[#1596b4]">
                <span>실버 회원 등급 할인 (1%)</span>
                <span>{signedCurrency(membershipDiscount, "-")}</span>
              </div>
            </div>
            <div className="py-5 text-right">
              <p className="text-left font-dot-bold text-sm">총 결제 금액</p>
              <p className="mt-2 font-dot-bold text-[28px] text-[#1596b4]">
                {currency(finalPrice)}
              </p>
              <p className="mt-1 font-dot-regular text-xs text-[#707070]">
                옵션 추가금 및 회원 등급 할인 포함
              </p>
            </div>
            <div className="border-y border-[#d9d9d9] py-4">
              <p className="font-dot-medium text-sm">결제 수단</p>
              <p className="mt-2 font-dot-regular text-xs text-[#707070]">
                {paymentMethod === "card"
                  ? "신한카드 · 일시불"
                  : paymentMethod === "transfer"
                    ? "실시간 계좌이체"
                    : "가상계좌"}
              </p>
            </div>
            <p className="py-4 font-dot-regular text-xs leading-[1.55] text-[#707070]">
              주문 정보 및 필수 약관 동의를 확인하였습니다. 아래 금액으로 결제를
              진행합니다.
            </p>
            <button
              className="h-14 w-full rounded-md bg-[#1596b4] font-dot-bold text-base text-white disabled:cursor-not-allowed disabled:bg-[#9fcbd5] cursor-pointer"
              type="button"
              disabled={!allAgreed}
              onClick={handlePaymentSubmit}
            >
              {currency(finalPrice)} 결제하기
            </button>
            <button
              className="mt-3 h-9 w-full border border-[#d9d9d9] font-dot-regular text-sm cursor-pointer"
              type="button"
              onClick={onBack}
            >
              상품 상세로 돌아가기
            </button>
            {complete && (
              <p
                className="mt-4 bg-[#f0f9fb] p-3 text-center font-dot-semibold text-sm text-[#1596b4]"
                role="status"
              >
                결제가 완료되었습니다.
              </p>
            )}
            <div className="mt-6 bg-[#f0f9fb] p-5">
              <p className="font-dot-semibold text-sm text-[#151515]">
                결제 후 예약 안내
              </p>
              <p className="mt-2 font-dot-regular text-xs leading-[1.45] text-[#707070]">
                결제 완료 후 예약 내역에서 확인할 수 있습니다. 최소 신청 인원
                충족 및 담당자 확인 후 예약이 확정됩니다.
              </p>
            </div>
          </aside>
        </div>

        <section className="flex flex-col gap-7 bg-[#f7f7f7] p-[30px] md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-dot-semibold text-[22px]">
              결제에 도움이 필요하신가요?
            </h2>
            <p className="mt-2.5 font-dot-regular text-[13px] text-[#707070]">
              여행 준비부터 귀국까지, 미스터 월드가 함께합니다.
            </p>
          </div>
          <div>
            <p className="font-dot-bold text-sm">해외여행 문의</p>
            <p className="mt-1.5 font-eb-semibold text-2xl">1588-2200</p>
            <p className="mt-1.5 font-dot-regular text-xs text-[#707070]">
              연중무휴 09:00 ~ 20:00
            </p>
          </div>
          <div className="border-[#d9d9d9] md:border-l md:pl-[30px]">
            <p className="font-dot-bold text-sm">예약상담 및 조회</p>
            <p className="mt-2 font-dot-regular text-[13px] text-[#707070]">
              전화 연결 후 1번을 선택해 주세요.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}