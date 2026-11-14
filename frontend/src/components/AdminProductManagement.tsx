import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { assets, type AdminSection } from "../types/admin";
import {
  AdminShell,
  SelectField,
  Checkbox,
  Panel,
  InfoField,
  fieldClass,
  primaryButton,
  secondaryButton,
} from "./AdminCommon";
import {
  changeProductStatus,
  createProduct,
  fetchProductDetail,
  fetchProducts,
} from "../api/admin";
import { errorMessage } from "../api/client";
import { GRADE_LABEL, PRODUCT_STATUS_LABEL, allowedByMinGrade, dateTime, won } from "../api/labels";
import type {
  HotelLevel,
  MealType,
  OptionCreateRequest,
  ProductDetail,
  ProductStatus,
  ProductSummary,
  TravelGrade,
  VehicleType,
} from "../api/types";

export type TourGradeKey = TravelGrade;

export type ThemeItem = {
  id: number;
  name: string;
  allowedGrades: TourGradeKey[];
  fixedPeople?: number;
};

// 테마 4개는 백엔드(ThemeDataInitializer)와 ID까지 고정
export const FIXED_THEMES: ThemeItem[] = [
  { id: 1, name: "허니문 낭만 투어", allowedGrades: ["GRAND", "PREMIUM"], fixedPeople: 2 },
  { id: 2, name: "효도 힐링 투어", allowedGrades: ["GRAND", "PREMIUM"] },
  { id: 3, name: "골프 챌린지 투어", allowedGrades: ["CLASSIC", "GRAND", "PREMIUM"] },
  { id: 4, name: "아웃도어 트레킹 투어", allowedGrades: ["CLASSIC", "GRAND", "PREMIUM"] },
];

const MIN_DEPARTURE_PEOPLE = 3;
const PREMIUM_DEFAULT_DRINK = "샴페인";

// 관리자가 바꿀 수 있는 상태 (출발 확정은 인원이 차면 자동)
const CHANGEABLE_STATUSES: ProductStatus[] = ["RECRUITING", "CLOSED", "COMPLETED", "CANCELED"];

export interface FixedOptionItem {
  key: string;
  type: "HOTEL" | "MEAL" | "VEHICLE";
  code: string;
  name: string;
  enabled: boolean;
  extraPrice: string;
}

export interface DrinkOptionItem {
  id: string;
  name: string;
  extraPrice: string;
}

// 등급별 기본 구성 (요구사항 고정)
const GRADE_BASE: Record<TourGradeKey, { hotel: HotelLevel; meal: MealType; desc: string }> = {
  CLASSIC: { hotel: "STAR_3", meal: "LUNCHBOX", desc: "3등급 숙소 + 도시락" },
  GRAND: { hotel: "STAR_4", meal: "LOCAL_RESTAURANT", desc: "4등급 숙소 + 현지식 레스토랑" },
  PREMIUM: { hotel: "STAR_5", meal: "FINE_DINING", desc: "5등급 숙소 + 고급 레스토랑 + 샴페인 음료" },
};

const tableColumnsStyle = {
  gridTemplateColumns: "48px 2.4fr 1.2fr 0.8fr 1.3fr 1fr 0.9fr 1.2fr 150px",
};

const toNumber = (value: string) => Number(value.replace(/[^\d]/g, "") || 0);

function PriceInput({
  value,
  onChange,
  placeholder = "0",
  onKeyDown,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative w-full max-w-[200px]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode="numeric"
        className={`${fieldClass} pr-8 text-right`}
      />
      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#65717e]">원</span>
    </div>
  );
}

// 상태 변경 (출발 취소는 예약 일괄 취소 + 예약자 문자라 한 번 더 확인)
async function applyStatus(productId: number, status: ProductStatus): Promise<string> {
  if (status === "CANCELED" && !confirm("출발 취소하면 남은 예약이 모두 취소됩니다. 진행할까요?")) {
    return "";
  }
  const res = await changeProductStatus(productId, status);
  if (status === "CANCELED") {
    return `출발 취소되었습니다. 취소된 예약 ${res?.canceledReservations ?? 0}건`;
  }
  return `상태를 '${PRODUCT_STATUS_LABEL[status]}'(으)로 변경했습니다.`;
}

// 메인 상품 관리 컴포넌트
export function AdminProductManagement({
  onNavigate,
  adminName,
  onLogout,
}: {
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [themeFilter, setThemeFilter] = useState("전체 테마");
  const [countryFilter, setCountryFilter] = useState("전체 나라");
  const [statusFilter, setStatusFilter] = useState("전체 상태");
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await fetchProducts();
      setItems(page.content);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const countries = useMemo(
    () => Array.from(new Set(items.map((p) => p.country).filter(Boolean))).sort(),
    [items],
  );

  if (isCreating) {
    return (
      <ProductCreateView
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBack={() => setIsCreating(false)}
        onCreated={(productId) => {
          setIsCreating(false);
          setNotice(`상품이 등록되었습니다. (상품 ID ${productId})`);
          void load();
        }}
      />
    );
  }

  if (detailId !== null) {
    return (
      <ProductDetailView
        productId={detailId}
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBack={() => {
          setDetailId(null);
          void load();
        }}
      />
    );
  }

  const filteredItems = items.filter((p) => {
    if (keyword.trim() && !`${p.title} ${p.productCode}`.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
    if (themeFilter !== "전체 테마" && String(p.theme?.id) !== themeFilter) return false;
    if (countryFilter !== "전체 나라" && p.country !== countryFilter) return false;
    if (statusFilter !== "전체 상태" && p.status !== statusFilter) return false;
    return true;
  });

  const toggleAll = (checked: boolean) => {
    setSelectedProducts(checked ? new Set(filteredItems.map((p) => p.id)) : new Set());
  };

  // 선택 상품 일괄 상태 변경
  const changeSelected = async (status: ProductStatus) => {
    if (selectedProducts.size === 0) {
      alert("상품을 선택해 주세요.");
      return;
    }
    if (status === "CANCELED" && !confirm(`선택한 ${selectedProducts.size}개 상품을 출발 취소할까요? 남은 예약이 모두 취소됩니다.`)) {
      return;
    }
    const failures: string[] = [];
    for (const id of selectedProducts) {
      try {
        await changeProductStatus(id, status);
      } catch (err) {
        failures.push(`#${id}: ${errorMessage(err)}`);
      }
    }
    setSelectedProducts(new Set());
    setNotice(
      failures.length
        ? `일부 상품은 변경하지 못했습니다.\n${failures.join("\n")}`
        : `선택한 상품을 '${PRODUCT_STATUS_LABEL[status]}'(으)로 변경했습니다.`,
    );
    void load();
  };

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-5">
          <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">상품 관리</h1>
          <button type="button" onClick={() => setIsCreating(true)} className={primaryButton}>
            상품 등록
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 xl:flex-nowrap">
          <label className="flex h-10 min-w-[230px] flex-1 items-center gap-[9px] rounded-md border border-[#c8d2d8] bg-white px-[13px]">
            <img src={assets.search} alt="" className="size-[17px]" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="상품명 / 상품코드 검색"
              className="min-w-0 flex-1 text-[13px] outline-none placeholder:text-[#8b96a3]"
            />
          </label>
          <div className="w-[170px]">
            <SelectField value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
              <option value="전체 테마">전체 테마</option>
              {FIXED_THEMES.map((t) => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </SelectField>
          </div>
          <div className="w-[130px]">
            <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="전체 나라">전체 나라</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </SelectField>
          </div>
          <div className="w-[130px]">
            <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="전체 상태">전체 상태</option>
              {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((s) => (
                <option key={s} value={s}>{PRODUCT_STATUS_LABEL[s]}</option>
              ))}
            </SelectField>
          </div>
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setThemeFilter("전체 테마");
              setCountryFilter("전체 나라");
              setStatusFilter("전체 상태");
            }}
            className={secondaryButton}
          >
            초기화
          </button>
        </div>

        {notice && (
          <p role="status" className="mb-4 whitespace-pre-line border border-[#c7e8ef] bg-[#eaf7f9] px-4 py-3 text-xs text-[#17212b]">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 whitespace-pre-line border border-[#f0c8c8] bg-[#fdf0f0] px-4 py-3 text-xs text-[#c33]">
            {error}
          </p>
        )}

        <section className="border border-[#dde4e8] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 p-[18px]">
            <div className="leading-[1.4]">
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">전체 상품 목록</h2>
              <p className="mt-1 text-xs text-[#65717e]">
                {loading ? "불러오는 중..." : `전체 ${filteredItems.length}건`}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void changeSelected("CLOSED")} className={secondaryButton}>
                선택 판매 중지
              </button>
              <button type="button" onClick={() => void changeSelected("CANCELED")} className={secondaryButton}>
                선택 출발 취소
              </button>
              <button type="button" onClick={() => void load()} className={secondaryButton}>
                새로고침
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="w-full min-w-[1150px]">
              <div className="grid h-10 w-full bg-[#c7e8ef]" style={tableColumnsStyle}>
                <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                  <Checkbox
                    checked={filteredItems.length > 0 && selectedProducts.size === filteredItems.length}
                    onChange={toggleAll}
                  />
                </div>
                {["상품명 / 상품코드", "테마", "나라", "출발일 / 신청 인원", "기본가격", "판매 상태", "모집 마감", "관리"].map((h) => (
                  <div key={h} className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2.5 font-['42dot_Sans:Bold'] text-[11px] font-bold text-[#65717e]">
                    {h}
                  </div>
                ))}
              </div>

              {!loading && filteredItems.length === 0 && (
                <p className="p-8 text-center text-xs text-[#65717e]">
                  등록된 상품이 없습니다. 오른쪽 위 "상품 등록"으로 첫 상품을 만들어 보세요.
                </p>
              )}

              {filteredItems.map((product) => (
                <div
                  key={product.id}
                  style={tableColumnsStyle}
                  className={`grid min-h-[54px] w-full ${selectedProducts.has(product.id) ? "bg-[#f1fafc]" : "bg-white"}`}
                >
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onChange={(checked) => {
                        const next = new Set(selectedProducts);
                        if (checked) next.add(product.id);
                        else next.delete(product.id);
                        setSelectedProducts(next);
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-center border-r border-b border-[#dde4e8] px-2.5 py-1.5 text-[13px] text-[#17212b]">
                    <span className="font-bold">{product.title}</span>
                    <span className="text-[11px] text-[#65717e]">{product.productCode}</span>
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-1 text-center text-xs">{product.theme?.name ?? "-"}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.country}</div>
                  <div className="flex flex-col items-center justify-center border-r border-b border-[#dde4e8] text-xs">
                    <span>{product.departureDate}</span>
                    <span className="text-[11px] text-[#65717e]">{product.currentPeople} / {product.maxPeople}명</span>
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{won(product.basePrice)}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{PRODUCT_STATUS_LABEL[product.status] ?? product.status}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{dateTime(product.deadline)}</div>
                  <div className="flex items-center justify-center gap-1.5 border-b border-[#dde4e8]">
                    <button
                      type="button"
                      onClick={() => setDetailId(product.id)}
                      className="rounded border border-[#c8d2d8] bg-white px-2.5 py-1 text-xs hover:bg-[#f8fafb]"
                    >
                      상세 / 상태
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AdminShell>
  );
}

// 상품 상세 (조회 + 판매 상태 변경). 등록 후 내용 수정 API는 아직 없음
function ProductDetailView({
  productId,
  adminName,
  onNavigate,
  onLogout,
  onBack,
}: {
  productId: number;
  adminName: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [nextStatus, setNextStatus] = useState<ProductStatus>("CLOSED");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchProductDetail(productId);
      setDetail(res);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitStatus = async () => {
    setSaving(true);
    try {
      const message = await applyStatus(productId, nextStatus);
      if (message) {
        setNotice(message);
        await load();
      }
    } catch (err) {
      setNotice("");
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const optionName = (id: number | null) =>
    detail?.options.find((o) => o.id === id)?.optionName ?? "-";
  const product = detail?.product;

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#17212b]">상품 상세</h1>
          <button type="button" onClick={onBack} className={secondaryButton}>목록으로</button>
        </div>

        {error && (
          <p role="alert" className="mb-4 whitespace-pre-line border border-[#f0c8c8] bg-[#fdf0f0] px-4 py-3 text-xs text-[#c33]">{error}</p>
        )}
        {notice && (
          <p role="status" className="mb-4 border border-[#c7e8ef] bg-[#eaf7f9] px-4 py-3 text-xs text-[#17212b]">{notice}</p>
        )}

        {!detail || !product ? (
          !error && <p className="text-xs text-[#65717e]">불러오는 중...</p>
        ) : (
          <div className="space-y-6">
            <Panel title="기본 정보">
              <div className="grid md:grid-cols-2">
                <InfoField label="상품명">{product.title}</InfoField>
                <InfoField label="상품코드">{product.productCode}</InfoField>
                <InfoField label="테마">{product.theme?.name ?? "-"}</InfoField>
                <InfoField label="나라 / 기간">{product.country} / {product.duration ?? "-"}</InfoField>
                <InfoField label="출발 ~ 귀국">{product.departureDate} ~ {product.returnDate}</InfoField>
                <InfoField label="모집 마감">{dateTime(product.deadline)}</InfoField>
                <InfoField label="신청 인원">{product.currentPeople} / {product.maxPeople}명 (최소 {detail.minPeople}명)</InfoField>
                <InfoField label="기본가격">{won(product.basePrice)} (1인)</InfoField>
                <InfoField label="판매 상태">{PRODUCT_STATUS_LABEL[product.status]}</InfoField>
                <InfoField label="설명">{detail.description || "-"}</InfoField>
              </div>
            </Panel>

            <Panel title="판매 상태 변경">
              <div className="flex flex-wrap items-center gap-3 p-[18px]">
                <div className="w-[180px]">
                  <SelectField value={nextStatus} onChange={(e) => setNextStatus(e.target.value as ProductStatus)}>
                    {CHANGEABLE_STATUSES.map((s) => (
                      <option key={s} value={s}>{PRODUCT_STATUS_LABEL[s]}</option>
                    ))}
                  </SelectField>
                </div>
                <button type="button" disabled={saving} onClick={() => void submitStatus()} className={`${primaryButton} disabled:opacity-60`}>
                  상태 변경
                </button>
                <p className="text-xs text-[#65717e]">
                  출발 확정은 신청 인원이 {MIN_DEPARTURE_PEOPLE}명 이상이 되면 자동으로 바뀌어요. 출발 취소를 고르면 남은 예약이 모두 취소되고, 배정된 기념품은 재고로 돌아가요.
                </p>
              </div>
            </Panel>

            <Panel title="판매 등급과 기본 구성">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-[#c7e8ef] text-[#65717e]">
                    <tr>
                      {["등급", "등급 추가금(1인)", "기본 숙소", "기본 식사", "기본 음료"].map((h) => (
                        <th key={h} className="border-b border-[#dde4e8] p-3 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.grades.map((g) => (
                      <tr key={g.id} className="border-b border-[#dde4e8]">
                        <td className="p-3">{GRADE_LABEL[g.grade] ?? g.grade}{g.defaultGrade ? " (기본)" : ""}</td>
                        <td className="p-3">{won(g.extraPrice)}</td>
                        <td className="p-3">{optionName(g.defaultHotelOptionId)}</td>
                        <td className="p-3">{optionName(g.defaultMealOptionId)}</td>
                        <td className="p-3">{g.defaultDrinkOptionId ? optionName(g.defaultDrinkOptionId) : "없음"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="옵션 (고객이 바꿀 수 있는 항목)">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="bg-[#c7e8ef] text-[#65717e]">
                    <tr>
                      {["구분", "옵션명", "가격", "요금 기준"].map((h) => (
                        <th key={h} className="border-b border-[#dde4e8] p-3 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.options.map((o) => (
                      <tr key={o.id} className="border-b border-[#dde4e8]">
                        <td className="p-3">{{ HOTEL: "숙소", MEAL: "식사", VEHICLE: "차량", DRINK: "음료" }[o.optionType]}</td>
                        <td className="p-3">{o.optionName}{o.id === detail.defaultVehicleOptionId ? " (기본 차량)" : ""}</td>
                        <td className="p-3">{won(o.extraPrice)}</td>
                        <td className="p-3">{o.applyRule === "PER_RESERVATION" ? "예약당" : "1인당"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

// 상품 등록
function ProductCreateView({
  adminName,
  onNavigate,
  onLogout,
  onBack,
  onCreated,
}: {
  adminName: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
  onCreated: (productId: number) => void;
}) {
  const [selectedThemeId, setSelectedThemeId] = useState<number>(4);
  const selectedTheme = FIXED_THEMES.find((t) => t.id === selectedThemeId) || FIXED_THEMES[0];
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [fixedOptions, setFixedOptions] = useState<FixedOptionItem[]>([
    { key: "h3", type: "HOTEL", code: "STAR_3", name: "3등급 호텔", enabled: true, extraPrice: "0" },
    { key: "h4", type: "HOTEL", code: "STAR_4", name: "4등급 호텔", enabled: true, extraPrice: "" },
    { key: "h5", type: "HOTEL", code: "STAR_5", name: "5등급 호텔", enabled: true, extraPrice: "" },
    { key: "m1", type: "MEAL", code: "LUNCHBOX", name: "도시락", enabled: true, extraPrice: "0" },
    { key: "m2", type: "MEAL", code: "LOCAL_RESTAURANT", name: "현지식 레스토랑", enabled: true, extraPrice: "" },
    { key: "m3", type: "MEAL", code: "FINE_DINING", name: "고급 레스토랑 스테이크", enabled: true, extraPrice: "" },
    { key: "v1", type: "VEHICLE", code: "PRIVATE_LIMOUSINE", name: "VIP 리무진", enabled: false, extraPrice: "" },
  ]);

  // 테마 최소 등급보다 낮은 호텔/식사는 등록 불가 (예: 허니문·효도 → 3등급 호텔, 도시락 제외)
  const minGrade = selectedTheme.allowedGrades[0];
  const isOptionAllowed = (opt: FixedOptionItem) =>
    opt.type === "HOTEL"
      ? allowedByMinGrade({ hotelLevel: opt.code as HotelLevel }, minGrade)
      : opt.type === "MEAL"
        ? allowedByMinGrade({ mealType: opt.code as MealType }, minGrade)
        : true;

  const [drinkOptions, setDrinkOptions] = useState<DrinkOptionItem[]>([
    { id: "d1", name: PREMIUM_DEFAULT_DRINK, extraPrice: "" },
    { id: "d2", name: "커피", extraPrice: "" },
  ]);
  const [newDrinkName, setNewDrinkName] = useState("");
  const [newDrinkPrice, setNewDrinkPrice] = useState("");

  const handleAddDrink = () => {
    if (!newDrinkName.trim()) {
      alert("음료명을 입력해 주세요.");
      return;
    }
    setDrinkOptions((prev) => [
      ...prev,
      { id: `drink-${Date.now()}`, name: newDrinkName.trim(), extraPrice: newDrinkPrice || "0" },
    ]);
    setNewDrinkName("");
    setNewDrinkPrice("");
  };

  const handleKeyDownAddDrink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddDrink();
    }
  };

  // 등급별 사용 여부와 추가가격
  const [gradePrices, setGradePrices] = useState<Record<TourGradeKey, { enabled: boolean; extraPrice: string }>>({
    CLASSIC: { enabled: true, extraPrice: "0" },
    GRAND: { enabled: true, extraPrice: "" },
    PREMIUM: { enabled: true, extraPrice: "" },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const get = (key: string) => String(fd.get(key) || "").trim();

    const grades = (["CLASSIC", "GRAND", "PREMIUM"] as TourGradeKey[]).filter(
      (g) => selectedTheme.allowedGrades.includes(g) && gradePrices[g].enabled,
    );
    if (grades.length === 0) {
      setError("판매할 투어 등급을 하나 이상 선택해 주세요.");
      return;
    }

    // 판매하는 등급의 기본 구성(숙소, 식사, 프리미엄 샴페인)이 켜져 있는지 미리 확인
    const usableOptions = fixedOptions.filter((o) => o.enabled && isOptionAllowed(o));
    const enabledCodes = new Set(usableOptions.map((o) => o.code));
    for (const g of grades) {
      const base = GRADE_BASE[g];
      if (!enabledCodes.has(base.hotel) || !enabledCodes.has(base.meal)) {
        setError(`${GRADE_LABEL[g]} 등급을 팔려면 '${base.desc.split(" + ").slice(0, 2).join("', '")}' 옵션을 사용으로 체크해 주세요.`);
        return;
      }
    }
    if (grades.includes("PREMIUM") && !drinkOptions.some((d) => d.name === PREMIUM_DEFAULT_DRINK)) {
      setError("프리미엄 등급을 팔려면 '샴페인' 음료 옵션이 필요합니다.");
      return;
    }

    const options: OptionCreateRequest[] = [
      ...usableOptions.map((o): OptionCreateRequest => {
          const extraPrice = toNumber(o.extraPrice);
          if (o.type === "HOTEL") return { optionType: "HOTEL", hotelLevel: o.code as HotelLevel, extraPrice };
          if (o.type === "MEAL") return { optionType: "MEAL", mealType: o.code as MealType, extraPrice };
          return { optionType: "VEHICLE", vehicleType: o.code as VehicleType, extraPrice };
        }),
      ...drinkOptions.map((d): OptionCreateRequest => ({
        optionType: "DRINK",
        optionName: d.name,
        extraPrice: toNumber(d.extraPrice),
        applyRule: "PER_PERSON",
      })),
    ];

    setSaving(true);
    try {
      const res = await createProduct({
        themeId: selectedTheme.id,
        productCode: get("productCode"),
        title: get("title"),
        country: get("country"),
        duration: get("duration"),
        description: get("description"),
        basePrice: toNumber(get("price")),
        status: "RECRUITING",
        departureDate: get("departureDate"),
        returnDate: get("returnDate"),
        deadline: get("deadline"),
        maxPeople: toNumber(get("maxPeople")),
        minPeople: MIN_DEPARTURE_PEOPLE,
        options,
        grades: grades.map((g, index) => ({
          grade: g,
          extraPrice: toNumber(gradePrices[g].extraPrice),
          defaultGrade: index === 0,
        })),
      });
      onCreated(res.productId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#17212b]">상품 등록</h1>
          <button type="button" onClick={onBack} className={secondaryButton}>목록으로</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel title="기본 정보">
            <div className="grid md:grid-cols-2">
              <InfoField label="테마 선택 *">
                <SelectField value={String(selectedThemeId)} onChange={(e) => setSelectedThemeId(Number(e.target.value))}>
                  {FIXED_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </SelectField>
              </InfoField>
              <InfoField label="상품코드 *">
                <input name="productCode" placeholder="예: TREK-001" maxLength={30} className={fieldClass} required />
              </InfoField>
              <InfoField label="상품명 *">
                <input name="title" maxLength={255} className={fieldClass} required />
              </InfoField>
              <InfoField label="나라 *">
                <input name="country" maxLength={50} className={fieldClass} required />
              </InfoField>
              <InfoField label="여행 기간">
                <input name="duration" placeholder="예: 4박 5일" maxLength={20} className={fieldClass} />
              </InfoField>
              <InfoField label="기본가격 (1인) *">
                <input
                  name="price"
                  type="text"
                  inputMode="numeric"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^\d]/g, "");
                  }}
                  placeholder="0"
                  className={fieldClass}
                  required
                />
              </InfoField>
              <InfoField label="출발일 *">
                <input name="departureDate" type="date" className={fieldClass} required />
              </InfoField>
              <InfoField label="귀국일 *">
                <input name="returnDate" type="date" className={fieldClass} required />
              </InfoField>
              <InfoField label="모집 마감 *">
                <input name="deadline" type="datetime-local" className={fieldClass} required />
              </InfoField>
              <InfoField label="정원 *">
                <input name="maxPeople" type="number" min={selectedTheme.fixedPeople ?? MIN_DEPARTURE_PEOPLE} defaultValue={10} className={fieldClass} required />
              </InfoField>
              <InfoField label="최소 출발 인원">
                <input
                  value={`${MIN_DEPARTURE_PEOPLE}명 (고정)${selectedTheme.fixedPeople ? ` · 예약당 ${selectedTheme.fixedPeople}명 전용` : ""}`}
                  disabled
                  className={`${fieldClass} bg-[#f3f4f6] text-[#6b7280]`}
                />
              </InfoField>
              <InfoField label="설명" full>
                <input name="description" maxLength={1000} className={fieldClass} />
              </InfoField>
            </div>
          </Panel>

          <Panel title="선택 가능한 투어 등급">
            <div className="border border-[#dde4e8] text-xs">
              <div className="grid grid-cols-[60px_120px_2.5fr_200px] bg-[#c7e8ef] h-9 font-bold text-[#65717e] items-center px-3 border-b border-[#dde4e8]">
                <span>사용</span>
                <span>등급</span>
                <span>기본 구성</span>
                <span>추가가격 (1인)</span>
              </div>
              {(["CLASSIC", "GRAND", "PREMIUM"] as TourGradeKey[]).map((grade) => {
                const isAllowed = selectedTheme.allowedGrades.includes(grade);
                const item = gradePrices[grade];
                return (
                  <div
                    key={grade}
                    className={`grid grid-cols-[60px_120px_2.5fr_200px] h-12 items-center px-3 border-b border-[#dde4e8] ${!isAllowed ? "bg-[#f3f4f6] opacity-50" : "bg-white"}`}
                  >
                    <Checkbox
                      checked={isAllowed && item.enabled}
                      onChange={(checked) => {
                        if (isAllowed) {
                          setGradePrices((prev) => ({ ...prev, [grade]: { ...prev[grade], enabled: checked } }));
                        }
                      }}
                    />
                    <span>{GRADE_LABEL[grade]}{!isAllowed ? " (이 테마 불가)" : ""}</span>
                    <span className="text-[#65717e]">{GRADE_BASE[grade].desc}</span>
                    <PriceInput
                      value={item.extraPrice}
                      onChange={(val) => setGradePrices((prev) => ({ ...prev, [grade]: { ...prev[grade], extraPrice: val } }))}
                    />
                  </div>
                );
              })}
            </div>
            <p className="px-3 py-2 text-[11px] text-[#65717e]">맨 위에 체크된 등급이 상품의 기본 등급이 돼요.</p>
          </Panel>

          <Panel title="선택 옵션 (종류 고정, 가격만 입력)">
            <div className="border border-[#dde4e8] text-xs">
              <div className="grid grid-cols-[60px_100px_2fr_200px] bg-[#c7e8ef] h-9 font-bold text-[#65717e] items-center px-3 border-b border-[#dde4e8]">
                <span>사용</span>
                <span>구분</span>
                <span>옵션명</span>
                <span>추가가격</span>
              </div>
              {fixedOptions.map((opt, idx) => {
                const allowed = isOptionAllowed(opt);
                return (
                  <div
                    key={opt.key}
                    className={`grid grid-cols-[60px_100px_2fr_200px] h-11 items-center px-3 border-b border-[#dde4e8] ${allowed ? "bg-white" : "bg-[#f3f4f6] opacity-50"}`}
                  >
                    <Checkbox
                      checked={allowed && opt.enabled}
                      onChange={(checked) => {
                        if (allowed) {
                          setFixedOptions((prev) => prev.map((item, i) => (i === idx ? { ...item, enabled: checked } : item)));
                        }
                      }}
                    />
                    <span className="text-[#17212b]">{{ HOTEL: "숙소 (1인)", MEAL: "식사 (1인)", VEHICLE: "차량 (예약당)" }[opt.type]}</span>
                    <span className="font-normal">{opt.name}{allowed ? "" : " (이 테마 불가)"}</span>
                    <PriceInput
                      value={opt.extraPrice}
                      onChange={(val) => setFixedOptions((prev) => prev.map((item, i) => (i === idx ? { ...item, extraPrice: val } : item)))}
                    />
                  </div>
                );
              })}
            </div>
            <p className="px-3 py-2 text-[11px] text-[#65717e]">
              테마 기본 차량({selectedTheme.fixedPeople ? "2인 전용 고급차량" : "10인 승합 고급차량"})은 0원으로 자동 등록돼요. 고객이 다른 옵션으로 바꾸면 기본 옵션과의 차액만 붙어요.
            </p>
          </Panel>

          <Panel title="음료 옵션">
            <div className="space-y-3">
              <div className="border border-[#dde4e8] text-xs">
                <div className="grid grid-cols-[2fr_200px_80px] bg-[#c7e8ef] h-9 font-bold text-[#65717e] items-center px-3 border-b border-[#dde4e8]">
                  <span>음료명</span>
                  <span>추가가격 (1잔)</span>
                  <span className="text-center">삭제</span>
                </div>
                {drinkOptions.map((d) => (
                  <div key={d.id} className="grid grid-cols-[2fr_200px_80px] h-11 items-center px-3 border-b border-[#dde4e8] bg-white">
                    <span className="font-normal">
                      {d.name}
                      {d.name === PREMIUM_DEFAULT_DRINK && <span className="ml-1.5 text-[11px] text-[#65717e]">(프리미엄 기본 포함)</span>}
                    </span>
                    <PriceInput
                      value={d.extraPrice}
                      onChange={(val) => setDrinkOptions((prev) => prev.map((item) => (item.id === d.id ? { ...item, extraPrice: val } : item)))}
                    />
                    <button
                      type="button"
                      onClick={() => setDrinkOptions((prev) => prev.filter((item) => item.id !== d.id))}
                      className="text-xs text-[#17212b] hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-[#f8fafb] p-3 border border-[#dde4e8]">
                <input
                  type="text"
                  placeholder="음료명"
                  value={newDrinkName}
                  onChange={(e) => setNewDrinkName(e.target.value)}
                  onKeyDown={handleKeyDownAddDrink}
                  className={`${fieldClass} w-48`}
                />
                <PriceInput value={newDrinkPrice} onChange={setNewDrinkPrice} onKeyDown={handleKeyDownAddDrink} />
                <button type="button" onClick={handleAddDrink} className={`${secondaryButton} shrink-0 whitespace-nowrap`}>
                  추가
                </button>
              </div>
            </div>
          </Panel>

          {error && (
            <p role="alert" className="whitespace-pre-line border border-[#f0c8c8] bg-[#fdf0f0] px-4 py-3 text-xs text-[#c33]">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onBack} className={secondaryButton}>취소</button>
            <button type="submit" disabled={saving} className={`${primaryButton} disabled:opacity-60`}>
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </main>
    </AdminShell>
  );
}
