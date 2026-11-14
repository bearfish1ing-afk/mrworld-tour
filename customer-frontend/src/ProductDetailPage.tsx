import { useMemo, useState } from "react";
import type { SelectedProduct } from "./ThemeTravelPage";

const detailAsset = (name: string) => `/assets/product-detail-6001-1366/${name}`;

export type ReservationSelection = {
  people: number;
  champagne: boolean;
  coffee: boolean;
  tourGrade: string;
  hotel: string;
  vehicle: string;
  meal: string;
  detailOptions: PriceOption[];
  additionalOptions: PriceOption[];
  baseTotal: number;
  detailExtraPrice: number;
  additionalExtraPrice: number;
  extraPrice: number;
  totalPrice: number;
};

export type PriceOption = {
  label: string;
  price: number;
};

type SelectPriceOption = PriceOption & {
  value: string;
  disabled?: boolean;
};

const hotelOptions: SelectPriceOption[] = [
  { value: "standard", label: "5성급 호텔 (기본)", price: 0 },
  { value: "luxury", label: "6성급 럭셔리 호텔", price: 300000 },
];

const vehicleOptions: SelectPriceOption[] = [
  { value: "limousine", label: "프리미엄 리무진", price: 0 },
  { value: "van", label: "10인 승합 고급차량", price: 150000 },
];

const mealOptions: SelectPriceOption[] = [
  { value: "restaurant", label: "고급 레스토랑 (기본)", price: 0 },
  { value: "fine-dining", label: "미쉐린 파인다이닝", price: 120000 },
];

const themeBenefits: Record<SelectedProduct["theme"], string[]> = {
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

function ReservationPanel({
  product,
  onReserve,
}: {
  product: SelectedProduct;
  onReserve: (reservation: ReservationSelection) => void;
}) {
  const isHoneymoon = product.theme === "honeymoon";
  const isParents = product.theme === "parents";
  
  const isClassicDisabled = isHoneymoon || isParents;
  
  const initialPeople = isHoneymoon ? 2 : 3;
  const [people, setPeople] = useState(initialPeople);

  const [champagne, setChampagne] = useState(true);
  const [coffee, setCoffee] = useState(false);

  const defaultGrade = isClassicDisabled ? "grand" : "classic";
  const [tourGrade, setTourGrade] = useState(defaultGrade);

  const [hotel, setHotel] = useState("standard");
  const [vehicle, setVehicle] = useState("limousine");
  const [meal, setMeal] = useState("restaurant");

  const basePrice = useMemo(
    () => Number(product.price.replace(/[^\d]/g, "")) || 2700000,
    [product.price],
  );

  const tourGradeOptions = useMemo<SelectPriceOption[]>(() => {
    return [
      {
        value: "classic",
        label: isClassicDisabled
          ? "클래식 (선택 불가 - 그랜드 이상 가능)"
          : "클래식 (기본)",
        price: 0,
        disabled: isClassicDisabled,
      },
      {
        value: "grand",
        label: isClassicDisabled ? "그랜드 (기본)" : "그랜드",
        price: isClassicDisabled ? 0 : 200000,
      },
      {
        value: "premium",
        label: "프리미엄",
        price: isClassicDisabled ? 200000 : 400000,
      },
    ];
  }, [isClassicDisabled]);

  const selectedDetailOptions = [
    tourGradeOptions.find(({ value }) => value === tourGrade),
    hotelOptions.find(({ value }) => value === hotel),
    vehicleOptions.find(({ value }) => value === vehicle),
    mealOptions.find(({ value }) => value === meal),
  ].filter((option): option is SelectPriceOption => Boolean(option));

  const detailOptions = selectedDetailOptions
    .filter(({ price }) => price > 0)
    .map(({ label, price }) => ({ label, price }));

  const additionalOptions = [
    ...(champagne ? [{ label: "샴페인 (1병)", price: 50000 }] : []),
    ...(coffee ? [{ label: "고급 커피 세트", price: 20000 }] : []),
  ];

  const detailExtraPricePerPerson = detailOptions.reduce(
    (sum, option) => sum + option.price,
    0,
  );

  const detailExtraTotal = detailExtraPricePerPerson * people;
  const additionalExtraTotal = additionalOptions.reduce(
    (sum, option) => sum + option.price,
    0,
  );
  const extraPrice = detailExtraTotal + additionalExtraTotal;

  const baseTotal = basePrice * people;

  const totalPrice = baseTotal + extraPrice;
  const membershipDiscount = Math.floor(totalPrice * 0.01);
  const finalPrice = totalPrice - membershipDiscount;

  const currency = (price: number) => `₩ ${price.toLocaleString("ko-KR")}`;
  const optionLabel = ({ label, price, disabled }: SelectPriceOption) =>
    disabled ? label : price ? `${label} (+${currency(price)}/1인)` : label;

  const handleIncreasePeople = () => {
    if (isHoneymoon) return;
    setPeople((prev) => prev + 1);
  };

  const handleDecreasePeople = () => {
    if (isHoneymoon) return;
    const minLimit = 3;
    setPeople((prev) => Math.max(minLimit, prev - 1));
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
            <span className="font-dot-semibold text-[13px] text-[#374151]">
              여행 시작일
            </span>
            <span className="relative mt-2 block">
              <input
                className={`${fieldClass} pr-10`}
                type="date"
                defaultValue="2026-10-24"
              />
              <img
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#f9fafb]"
                src={detailAsset("da41a.svg")}
                alt=""
              />
            </span>
          </label>

          <SelectField label="투어 등급 스타일">
            <select
              className={fieldClass}
              value={tourGrade}
              onChange={(event) => setTourGrade(event.target.value)}
            >
              {tourGradeOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                  disabled={option.disabled}
                >
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </SelectField>
          {isClassicDisabled && (
            <p className="-mt-2 font-dot-regular text-xs text-[#1596b4]">
              ※ {product.themeLabel} 투어는 '그랜드' 스타일 이상만 선택할 수 있습니다.
            </p>
          )}
        </section>

        {/* 서비스 옵션 */}
        <section className="space-y-4">
          <h3 className="font-dot-bold text-sm text-[#374151]">
            서비스 옵션 변경 (1인당)
          </h3>
          <SelectField label="호텔 등급">
            <select
              className={fieldClass}
              value={hotel}
              onChange={(event) => setHotel(event.target.value)}
            >
              {hotelOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </SelectField>
          <SelectField label="차량 서비스">
            <select
              className={fieldClass}
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
            >
              {vehicleOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </SelectField>
          <SelectField label="식사 구성">
            <select
              className={fieldClass}
              value={meal}
              onChange={(event) => setMeal(event.target.value)}
            >
              {mealOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </SelectField>

          <fieldset>
            <legend className="font-dot-semibold text-[13px] text-[#374151]">
              식사 추가 음료 옵션
            </legend>
            <label className="mt-2 flex cursor-pointer items-center gap-2 font-dot-regular text-sm text-[#111827]">
              <button
                className={`flex size-4 items-center justify-center rounded-[3px] border transition-colors ${
                  champagne
                    ? "border-[#1596b4] bg-[#1596b4]"
                    : "border-[#d1d5db] bg-white"
                }`}
                type="button"
                role="checkbox"
                aria-checked={champagne}
                onClick={() => setChampagne((checked) => !checked)}
              >
                {champagne && <img src={detailAsset("a0519.svg")} alt="" />}
              </button>
              <span>샴페인 (1병)</span>
              <span className="ml-auto text-xs text-[#1596b4]">+ ₩50,000</span>
            </label>
            <label className="mt-3 flex cursor-pointer items-center gap-2 font-dot-regular text-sm text-[#111827]">
              <button
                className={`flex size-4 items-center justify-center rounded-[3px] border transition-colors ${
                  coffee
                    ? "border-[#1596b4] bg-[#1596b4]"
                    : "border-[#d1d5db] bg-white"
                }`}
                type="button"
                role="checkbox"
                aria-checked={coffee}
                onClick={() => setCoffee((checked) => !checked)}
              >
                {coffee && <img src={detailAsset("a0519.svg")} alt="" />}
              </button>
              <span>고급 커피 세트</span>
              <span className="ml-auto text-xs text-[#6b7280]">+ ₩20,000</span>
            </label>
          </fieldset>
        </section>

        <section className="space-y-4">
          <h3 className="font-dot-bold text-sm text-[#374151]">예약 인원 설정</h3>
          <div>
            <div className="flex items-center justify-between rounded-md border border-[#d1d5db] bg-[#f9fafb] px-3.5 py-2">
              <button
                className="flex size-7 items-center justify-center rounded border border-[#d1d5db] font-dot-bold text-[#6b7280] hover:bg-[#e5e7eb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                type="button"
                disabled={isHoneymoon || people <= 3}
                onClick={handleDecreasePeople}
                aria-label="예약 인원 줄이기"
              >
                −
              </button>
              <span className="font-dot-bold text-base text-[#111827]">
                성인 {people}명
              </span>
              <button
                className="flex size-7 items-center justify-center rounded border border-[#d1d5db] font-dot-bold text-[#6b7280] hover:bg-[#e5e7eb] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                type="button"
                disabled={isHoneymoon}
                onClick={handleIncreasePeople}
                aria-label="예약 인원 늘리기"
              >
                +
              </button>
            </div>
            <p className="mt-2 font-dot-regular text-xs text-[#6b7280]">
              {isHoneymoon
                ? "※ 허니문 투어는 2인 전용 상품입니다."
                : "※ 3명 이상 신청 시 출발이 확정됩니다."}
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafb] p-4">
          <div className="flex justify-between font-dot-regular text-sm">
            <span className="text-[#6b7280]">기본 금액 (1인당 ₩{basePrice.toLocaleString()})</span>
            <span className="font-dot-semibold text-[#111827]">
              {currency(baseTotal)}
            </span>
          </div>
          <div className="flex justify-between font-dot-regular text-sm">
            <span className="text-[#6b7280]">옵션 추가금</span>
            <span className="font-dot-semibold text-[#1596b4]">
              + {currency(extraPrice)}
            </span>
          </div>
          <div className="flex justify-between font-dot-regular text-sm">
            <span className="text-[#6b7280]">실버 회원 등급 할인 (1%)</span>
            <span className="font-dot-semibold text-[#1596b4]">
              - {currency(membershipDiscount)}
            </span>
          </div>
          <div className="h-px bg-[#e5e7eb]" />
          <div className="flex items-center justify-between">
            <span className="font-dot-bold text-base text-[#111827]">
              총 예상 결제 금액
            </span>
            <span className="font-dot-extrabold text-xl text-[#1596b4]">
              {currency(finalPrice)}
            </span>
          </div>
        </section>

        <button
          className="w-full rounded-md bg-[#1596b4] p-4 font-dot-bold text-base text-white transition-colors hover:bg-[#117f99] cursor-pointer"
          type="button"
          onClick={() =>
            onReserve({
              people,
              champagne,
              coffee,
              tourGrade: selectedDetailOptions[0]?.label || "그랜드",
              hotel: selectedDetailOptions[1]?.label || "5성급 호텔",
              vehicle: selectedDetailOptions[2]?.label || "프리미엄 리무진",
              meal: selectedDetailOptions[3]?.label || "고급 레스토랑",
              detailOptions,
              additionalOptions,
              baseTotal,
              detailExtraPrice: detailExtraTotal,
              additionalExtraPrice: additionalExtraTotal,
              extraPrice,
              totalPrice,
            })
          }
        >
          {currency(finalPrice)} 예약 신청하기
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
  return (
    <main className="bg-white">
      <header className="border-b border-black bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-[30px] px-5 py-[60px] md:flex-row md:items-start md:px-10 lg:px-[100px]">
          <img
            className="size-[279px] object-cover rounded-md"
            src={detailAsset("8a4c7.png")}
            alt=""
          />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 self-stretch leading-[1.1]">
            <span className="inline-block w-fit rounded bg-[#1596b4] px-3 py-1 font-dot-semibold text-xs text-white">
              {product.themeLabel}
            </span>
            <h1 className="font-dot-regular text-[32px] tracking-[-0.64px] text-black">
              {product.title}
            </h1>
            <p className="font-dot-semibold text-[32px] tracking-[-0.64px] text-[#1596b4]">
              {product.price}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-[30px] px-5 py-16 md:px-10 lg:flex-row lg:items-start lg:px-[100px]">
        <div className="min-w-0 flex-1 space-y-10">
          <section className="bg-[#f7f7f7]/85 px-[30px] py-[37px] rounded-lg">
            <h2 className="font-dot-medium text-[32px] leading-[1.1] tracking-[-0.64px]">
              상세 설명
            </h2>
            <img
              className="mt-10 aspect-[225/200] w-full object-cover rounded-md"
              src={detailAsset("8a4c7.png")}
              alt=""
            />
          </section>
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
              {themeBenefits[product.theme]?.map((benefit) => (
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
        </div>
        <ReservationPanel product={product} onReserve={onReserve} />
      </div>
    </main>
  );
}