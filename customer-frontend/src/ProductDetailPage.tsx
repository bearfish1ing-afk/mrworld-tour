import { useEffect, useMemo, useState } from "react";
import { errorMessage, isAbort } from "./api/client";
import { calculatePrice, getProduct } from "./api/customer";
import type {
  DrinkRequest,
  OptionResponse,
  PriceRequest,
  PriceResponse,
  ProductDetail,
} from "./api/types";
import {
  formatDate,
  formatDateTime,
  gradeLabel,
  gradeSatisfies,
  minGradeLabel,
  optionLabel,
  type SelectedProduct,
  type ThemeId,
} from "./api/view";

const detailAsset = (name: string) => `/assets/product-detail-6001-1366/${name}`;

// 상세 → 결제 페이지로 넘기는 선택 내용 (백엔드 예약 요청 + 계산된 금액)
export type ReservationSelection = {
  request: PriceRequest;
  price: PriceResponse;
  people: number;
  departureDate: string;
  returnDate: string;
  gradeLabel: string;
  hotelLabel: string;
  vehicleLabel: string;
  mealLabel: string;
  drinkLabels: string[];
};

const themeBenefits: Record<ThemeId, string[]> = {
  honeymoon: [
    "개인 맞춤 코스 구성 및 룸 데코레이션",
    "2인 전용 고급 차량 및 가이드 서비스",
    "호텔 및 식사 옵션 자유 커스텀",
    "샴페인, 커피 세트 추가 선택 가능",
  ],
  parents: [
    "부모님 맞춤 여유로운 일정 & 안마·지압 서비스",
    "10인 승합 고급 차량 및 가이드 서비스",
    "건강 인삼 기념품 제공",
    "호텔 및 식사 옵션 자유 커스텀",
  ],
  golf: [
    "유명 골프 리조트 18홀/36홀 티타임 보장",
    "골프백 전용 차량 서비스 & 골프공 기프트",
    "호텔 및 라운드 옵션 변경 가능",
    "골프 액세서리 추가 선택",
  ],
  trekking: [
    "난이도별 전문 코스 구성 & 산악 인솔자",
    "아웃도어 기념품 스카프 및 안전 장비",
    "장비 수송 전용 차량 서비스",
    "숙소 및 이동 옵션 변경 가능",
  ],
};

const fieldClass =
  "h-[42px] w-full appearance-none rounded-md border border-[#d1d5db] bg-[#f9fafb] px-3.5 pr-10 font-dot-regular text-sm text-[#111827] outline-none focus:border-[#1596b4] disabled:bg-[#e5e7eb] disabled:text-[#9ca3af] disabled:cursor-not-allowed";

function SelectField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-dot-semibold text-[13px] text-[#374151]">
        {label}
      </span>
      <span className="relative mt-2 block">
        {children}
        <img
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
          src={detailAsset("d3681.svg")}
          alt=""
        />
      </span>
    </label>
  );
}

const won = (price: number) => `₩ ${price.toLocaleString("ko-KR")}`;

// 기본 옵션 대비 차액 표시 (PER_RESERVATION이면 예약당)
function diffLabel(option: OptionResponse, base: OptionResponse | undefined) {
  const diff = option.extraPrice - (base?.extraPrice ?? 0);
  const name = optionLabel(option);
  if (base && option.id === base.id) return `${name} (기본)`;
  if (diff === 0) return name;
  const unit = option.applyRule === "PER_RESERVATION" ? "/예약" : "/1인";
  return `${name} (${diff > 0 ? "+" : "-"}${won(Math.abs(diff))}${unit})`;
}

function ReservationPanel({
  detail,
  onReserve,
}: {
  detail: ProductDetail;
  onReserve: (reservation: ReservationSelection) => void;
}) {
  const product = detail.product;
  const theme = product.theme;
  const fixedPeople = theme?.fixedPeople ?? null;
  const seatsLeft = Math.max(0, product.maxPeople - product.currentPeople);
  const deadlinePassed = new Date(product.deadline).getTime() < Date.now();

  const allowedGrades = detail.grades.filter((g) => gradeSatisfies(g.grade, theme?.minGrade));
  const initialGrade =
    allowedGrades.find((g) => g.defaultGrade) ?? allowedGrades[0] ?? detail.grades[0];

  const [gradeId, setGradeId] = useState<number | undefined>(initialGrade?.id);
  const grade = detail.grades.find((g) => g.id === gradeId);

  const hotels = detail.hotels;
  const vehicles = detail.vehicles;
  const meals = detail.options.filter((o) => o.optionType === "MEAL");
  const drinkOptions = detail.options.filter(
    (o) => o.optionType === "DRINK" && o.id !== grade?.defaultDrinkOptionId,
  );
  const defaultDrink = detail.options.find((o) => o.id === grade?.defaultDrinkOptionId);

  const [hotelId, setHotelId] = useState<number | null>(initialGrade?.defaultHotelOptionId ?? null);
  const [mealId, setMealId] = useState<number | null>(initialGrade?.defaultMealOptionId ?? null);
  const [vehicleId, setVehicleId] = useState<number | null>(detail.defaultVehicleOptionId);
  const [drinkIds, setDrinkIds] = useState<number[]>([]);
  const [people, setPeople] = useState(fixedPeople ?? 1);

  const [price, setPrice] = useState<PriceResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

  // 등급을 바꾸면 그 등급의 기본 호텔/식사로 맞추고, 기본 포함 음료는 추가 선택에서 뺌
  const changeGrade = (id: number) => {
    const next = detail.grades.find((g) => g.id === id);
    setGradeId(id);
    if (next) {
      setHotelId(next.defaultHotelOptionId);
      setMealId(next.defaultMealOptionId);
      setDrinkIds((ids) => ids.filter((d) => d !== next.defaultDrinkOptionId));
    }
  };

  const request = useMemo<PriceRequest | null>(() => {
    if (!gradeId) return null;
    const drinks: DrinkRequest[] = drinkIds.map((optionId) => ({ optionId, quantity: 1 }));
    return {
      productId: product.id,
      productGradeId: gradeId,
      people,
      hotelOptionId: hotelId,
      mealOptionId: mealId,
      vehicleOptionId: vehicleId,
      drinks,
    };
  }, [product.id, gradeId, people, hotelId, mealId, vehicleId, drinkIds]);

  // 선택이 바뀔 때마다 백엔드에서 금액 계산 (회원 할인 포함)
  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    setPriceLoading(true);
    setPriceError("");
    const timer = setTimeout(() => {
      calculatePrice(request, controller.signal)
        .then(setPrice)
        .catch((error) => {
          if (isAbort(error)) return;
          setPrice(null);
          setPriceError(errorMessage(error));
        })
        .finally(() => {
          if (!controller.signal.aborted) setPriceLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [request]);

  const defaultHotel = hotels.find((o) => o.id === grade?.defaultHotelOptionId);
  const defaultMeal = meals.find((o) => o.id === grade?.defaultMealOptionId);
  const defaultVehicle = vehicles.find((o) => o.id === detail.defaultVehicleOptionId);
  const baseGradePrice = Math.min(...allowedGrades.map((g) => g.extraPrice), 0);

  const canDecrease = fixedPeople == null && people > 1;
  const canIncrease = fixedPeople == null && people < seatsLeft;
  const soldOut = seatsLeft < (fixedPeople ?? 1);
  const disabledReason = deadlinePassed
    ? "모집이 마감된 상품입니다."
    : soldOut
    ? "잔여 좌석이 없습니다."
    : priceError || null;

  const submit = () => {
    if (!request || !price || disabledReason) return;
    const name = (list: OptionResponse[], id: number | null) => {
      const o = list.find((item) => item.id === id);
      return o ? optionLabel(o) : "-";
    };
    onReserve({
      request,
      price,
      people,
      departureDate: product.departureDate,
      returnDate: product.returnDate,
      gradeLabel: gradeLabel(grade?.grade),
      hotelLabel: name(hotels, hotelId),
      vehicleLabel: name(vehicles, vehicleId),
      mealLabel: name(meals, mealId),
      drinkLabels: [
        ...(defaultDrink ? [`${optionLabel(defaultDrink)} (기본 포함)`] : []),
        ...drinkIds.map((id) => name(drinkOptions, id)),
      ],
    });
  };

  return (
    <aside className="self-start lg:sticky lg:top-6 lg:w-[360px] lg:shrink-0">
      <div className="flex flex-col gap-6 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <h2 className="font-dot-bold text-xl text-[#111827]">예약 옵션 설정</h2>
        </div>

        <section className="space-y-4">
          <h3 className="font-dot-bold text-sm text-[#374151]">기본 정보</h3>
          <label className="block">
            <span className="font-dot-semibold text-[13px] text-[#374151]">여행 일정</span>
            <span className="relative mt-2 block">
              <input
                className={`${fieldClass} pr-10`}
                type="text"
                readOnly
                value={`${formatDate(product.departureDate)} ~ ${formatDate(product.returnDate)}`}
              />
              <img
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#f9fafb]"
                src={detailAsset("da41a.svg")}
                alt=""
              />
            </span>
            <span className="mt-1.5 block font-dot-regular text-xs text-[#6b7280]">
              모집 마감 {formatDateTime(product.deadline)}
            </span>
          </label>

          <SelectField label="투어 등급 스타일">
            <select
              className={fieldClass}
              value={gradeId ?? ""}
              onChange={(event) => changeGrade(Number(event.target.value))}
            >
              {detail.grades.map((g) => {
                const allowed = gradeSatisfies(g.grade, theme?.minGrade);
                const extra = g.extraPrice - baseGradePrice;
                return (
                  <option value={g.id} key={g.id} disabled={!allowed}>
                    {gradeLabel(g.grade)}
                    {!allowed
                      ? " (선택 불가)"
                      : extra > 0
                      ? ` (+${won(extra)}/1인)`
                      : g.defaultGrade
                      ? " (기본)"
                      : ""}
                  </option>
                );
              })}
            </select>
          </SelectField>
          {theme?.minGrade && theme.minGrade !== "CLASSIC" && (
            <p className="-mt-2 font-dot-regular text-xs text-[#1596b4]">
              ※ 이 테마는 '{minGradeLabel(theme.minGrade)}' 스타일 이상만 선택할 수 있습니다.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="font-dot-bold text-sm text-[#374151]">서비스 옵션 변경</h3>
          {hotels.length > 0 && (
            <SelectField label="호텔 등급">
              <select
                className={fieldClass}
                value={hotelId ?? ""}
                onChange={(event) => setHotelId(Number(event.target.value))}
              >
                {hotels.map((option) => (
                  <option value={option.id} key={option.id}>
                    {diffLabel(option, defaultHotel)}
                  </option>
                ))}
              </select>
            </SelectField>
          )}
          {vehicles.length > 0 && (
            <SelectField label="차량 서비스">
              <select
                className={fieldClass}
                value={vehicleId ?? ""}
                onChange={(event) => setVehicleId(Number(event.target.value))}
              >
                {vehicles.map((option) => (
                  <option value={option.id} key={option.id}>
                    {diffLabel(option, defaultVehicle)}
                  </option>
                ))}
              </select>
            </SelectField>
          )}
          {meals.length > 0 && (
            <SelectField label="식사 구성">
              <select
                className={fieldClass}
                value={mealId ?? ""}
                onChange={(event) => setMealId(Number(event.target.value))}
              >
                {meals.map((option) => (
                  <option value={option.id} key={option.id}>
                    {diffLabel(option, defaultMeal)}
                  </option>
                ))}
              </select>
            </SelectField>
          )}

          {(drinkOptions.length > 0 || defaultDrink) && (
            <fieldset>
              <legend className="font-dot-semibold text-[13px] text-[#374151]">
                식사 추가 음료 옵션
              </legend>
              {defaultDrink && (
                <p className="mt-2 font-dot-regular text-xs text-[#1596b4]">
                  {optionLabel(defaultDrink)} 기본 포함
                </p>
              )}
              {drinkOptions.map((drink) => {
                const checked = drinkIds.includes(drink.id);
                return (
                  <label
                    className="mt-2 flex cursor-pointer items-center gap-2 font-dot-regular text-sm text-[#111827]"
                    key={drink.id}
                  >
                    <button
                      className={`flex size-4 items-center justify-center rounded-[3px] border transition-colors ${
                        checked ? "border-[#1596b4] bg-[#1596b4]" : "border-[#d1d5db] bg-white"
                      }`}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() =>
                        setDrinkIds((ids) =>
                          checked ? ids.filter((id) => id !== drink.id) : [...ids, drink.id],
                        )
                      }
                    >
                      {checked && <img src={detailAsset("a0519.svg")} alt="" />}
                    </button>
                    <span>{optionLabel(drink)}</span>
                    <span className="ml-auto text-xs text-[#1596b4]">
                      + {won(drink.extraPrice)}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="font-dot-bold text-sm text-[#374151]">예약 인원 설정</h3>
          <div>
            <div className="flex items-center justify-between rounded-md border border-[#d1d5db] bg-[#f9fafb] px-3.5 py-2">
              <button
                className="flex size-7 items-center justify-center rounded border border-[#d1d5db] font-dot-bold text-[#6b7280] hover:bg-[#e5e7eb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                type="button"
                disabled={!canDecrease}
                onClick={() => setPeople((prev) => Math.max(1, prev - 1))}
                aria-label="예약 인원 줄이기"
              >
                −
              </button>
              <span className="font-dot-bold text-base text-[#111827]">성인 {people}명</span>
              <button
                className="flex size-7 items-center justify-center rounded border border-[#d1d5db] font-dot-bold text-[#6b7280] hover:bg-[#e5e7eb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                type="button"
                disabled={!canIncrease}
                onClick={() => setPeople((prev) => prev + 1)}
                aria-label="예약 인원 늘리기"
              >
                +
              </button>
            </div>
            <p className="mt-2 font-dot-regular text-xs text-[#6b7280]">
              {fixedPeople != null
                ? `※ ${fixedPeople}인 전용 상품입니다.`
                : `※ 전체 신청 인원이 ${detail.minPeople}명 이상이면 출발이 확정됩니다. (현재 ${product.currentPeople}명 · 잔여 ${seatsLeft}석)`}
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafb] p-4">
          {price ? (
            <>
              <div className="flex justify-between font-dot-regular text-sm">
                <span className="text-[#6b7280]">
                  기본 금액 (1인당 ₩{product.basePrice.toLocaleString("ko-KR")})
                </span>
                <span className="font-dot-semibold text-[#111827]">{won(price.baseAmount)}</span>
              </div>
              <div className="flex justify-between font-dot-regular text-sm">
                <span className="text-[#6b7280]">옵션 추가금</span>
                <span className="font-dot-semibold text-[#1596b4]">
                  {price.optionAmount < 0 ? "-" : "+"} {won(Math.abs(price.optionAmount))}
                </span>
              </div>
              <div className="flex justify-between font-dot-regular text-sm">
                <span className="text-[#6b7280]">회원 등급 할인</span>
                <span className="font-dot-semibold text-[#1596b4]">
                  - {won(price.discountAmount)}
                </span>
              </div>
              <div className="h-px bg-[#e5e7eb]" />
              <div className="flex items-center justify-between">
                <span className="font-dot-bold text-base text-[#111827]">총 예상 결제 금액</span>
                <span className="font-dot-extrabold text-xl text-[#1596b4]">
                  {won(price.finalAmount)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-center font-dot-regular text-sm text-[#6b7280]">
              {priceLoading ? "금액을 계산하는 중입니다..." : priceError || "옵션을 선택해 주세요."}
            </p>
          )}
          {price && priceLoading && (
            <p className="text-right font-dot-regular text-[11px] text-[#9ca3af]">다시 계산 중...</p>
          )}
        </section>

        {disabledReason && (
          <p role="alert" className="-mt-2 font-dot-regular text-xs text-[#a43d3d]">
            {disabledReason}
          </p>
        )}
        <button
          className="w-full rounded-md bg-[#1596b4] p-4 font-dot-bold text-base text-white transition-colors hover:bg-[#117f99] cursor-pointer disabled:cursor-not-allowed disabled:bg-[#9fcbd5]"
          type="button"
          disabled={!price || priceLoading || Boolean(disabledReason)}
          onClick={submit}
        >
          {price ? `${won(price.finalAmount)} 예약 신청하기` : "예약 신청하기"}
        </button>
        <p className="text-center font-dot-regular text-[11px] text-[#9ca3af]">
          예약 신청 후 결제 페이지에서 주문 내역을 확인하실 수 있습니다.
        </p>
      </div>
    </aside>
  );
}

export default function ProductDetailPage({
  product,
  onReserve,
}: {
  product: SelectedProduct;
  onReserve: (reservation: ReservationSelection) => void;
}) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setDetail(null);
    setLoadError("");
    getProduct(product.id, controller.signal)
      .then(setDetail)
      .catch((error) => {
        if (!isAbort(error)) setLoadError(errorMessage(error));
      });
    return () => controller.abort();
  }, [product.id]);

  const title = detail?.product.title ?? product.title;
  const basePrice = detail?.product.basePrice ?? product.price;

  return (
    <main className="bg-white">
      <header className="border-b border-black bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-[30px] px-5 py-[60px] md:flex-row md:items-start md:px-10 lg:px-[100px]">
          <img className="size-[279px] object-cover rounded-md" src={product.image} alt="" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 self-stretch leading-[1.1]">
            <span className="inline-block w-fit rounded bg-[#1596b4] px-3 py-1 font-dot-semibold text-xs text-white">
              {product.themeLabel}
            </span>
            <h1 className="font-dot-regular text-[32px] tracking-[-0.64px] text-black">{title}</h1>
            <p className="font-dot-regular text-base text-[#65717e]">
              {product.country} · {product.duration} · {formatDate(product.departureDate)} 출발
            </p>
            <p className="font-dot-semibold text-[32px] tracking-[-0.64px] text-[#1596b4]">
              {basePrice.toLocaleString("ko-KR")}원~
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-[30px] px-5 py-16 md:px-10 lg:flex-row lg:items-start lg:px-[100px]">
        <div className="min-w-0 flex-1 space-y-10">
          <section className="bg-[#f7f7f7]/85 px-[30px] py-[37px] rounded-lg">
            <h2 className="font-dot-medium text-[32px] leading-[1.1] tracking-[-0.64px]">상세 설명</h2>
            {detail?.description && (
              <p className="mt-6 whitespace-pre-line font-dot-regular text-base leading-[1.7] text-[#374151]">
                {detail.description}
              </p>
            )}
            <img
              className="mt-10 aspect-[225/200] w-full object-cover rounded-md"
              src={product.image}
              alt=""
            />
          </section>
          {product.theme && (
            <section>
              <div className="bg-[rgba(21,150,180,0.15)] border-l-4 border-[#1596b4] px-[30px] py-[15px] rounded-r-md">
                <h2 className="font-eb-medium text-2xl tracking-[-0.48px] text-[#171717]">
                  테마별 포함 혜택
                </h2>
                <p className="mt-1 font-eb-regular text-[15px] tracking-[-0.3px] text-[#65717e]">
                  {product.themeLabel} 투어 고객님을 위해 준비된 특전입니다.
                </p>
              </div>
              <ul className="mt-6 space-y-4">
                {themeBenefits[product.theme].map((benefit) => (
                  <li
                    className="flex items-center gap-3 font-dot-regular text-base tracking-[-0.32px]"
                    key={benefit}
                  >
                    <span className="size-2 shrink-0 rounded-full bg-[#1596b4]" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {detail ? (
          <ReservationPanel key={detail.product.id} detail={detail} onReserve={onReserve} />
        ) : (
          <aside className="self-start rounded-xl border border-[#e5e7eb] bg-white p-6 text-center font-dot-regular text-sm text-[#6b7280] lg:w-[360px] lg:shrink-0">
            {loadError || "상품 정보를 불러오는 중입니다..."}
          </aside>
        )}
      </div>
    </main>
  );
}
