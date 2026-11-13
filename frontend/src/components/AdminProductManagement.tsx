import React, { useState, type FormEvent } from "react";
import { assets, type Product, type AdminSection } from "../types/admin";
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

export type TourGradeKey = "CLASSIC" | "GRAND" | "PREMIUM";

export type ThemeItem = {
  id: number; 
  name: string;
  allowedGrades: TourGradeKey[];
  fixedPeople?: number;
};

export const FIXED_THEMES: ThemeItem[] = [
  { id: 1, name: "허니문 낭만 투어", allowedGrades: ["GRAND", "PREMIUM"], fixedPeople: 2 },
  { id: 2, name: "효도 힐링 투어", allowedGrades: ["GRAND", "PREMIUM"] },
  { id: 3, name: "골프 챌린지 투어", allowedGrades: ["CLASSIC", "GRAND", "PREMIUM"] },
  { id: 4, name: "아웃도어 트레킹 투어", allowedGrades: ["CLASSIC", "GRAND", "PREMIUM"] },
];

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

const tableColumnsStyle = {
  gridTemplateColumns: "48px 2.5fr 1fr 0.9fr 2fr 1.2fr 1fr 1.1fr 90px",
};

function PriceInput({
  value,
  onChange,
  placeholder = "0",
  onKeyDown,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
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
      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#65717e]">
        원
      </span>
    </div>
  );
}

// 메인 상품 관리 컴포넌트
export function AdminProductManagement({
  productItems,
  onNavigate,
  adminName,
  onLogout,
}: {
  productItems: Product[];
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<Product[]>(productItems);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [themeFilter, setThemeFilter] = useState("전체 테마");
  const [countryFilter, setCountryFilter] = useState("전체 나라");
  const [statusFilter, setStatusFilter] = useState("전체 상태");
  const [activeTab, setActiveTab] = useState<"전체" | "판매 중" | "판매 중지">("전체");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(() => new Set());

  if (isCreating || editing) {
    return (
      <ProductEditView
        product={editing}
        isCreate={isCreating}
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBack={() => {
          setEditing(null);
          setIsCreating(false);
        }}
        onSave={(saved) => {
          if (isCreating) {
            setItems((prev) => [saved, ...prev]);
          } else {
            setItems((prev) => prev.map((p) => (p.name === editing?.name ? saved : p)));
          }
          setEditing(null);
          setIsCreating(false);
        }}
      />
    );
  }

  const filteredItems = items.filter((p) => {
    if (activeTab !== "전체" && p.status !== activeTab) return false;
    if (keyword.trim() && !p.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (themeFilter !== "전체 테마" && p.theme !== themeFilter) return false;
    if (countryFilter !== "전체 나라" && p.country !== countryFilter) return false;
    if (statusFilter !== "전체 상태" && p.status !== statusFilter) return false;
    return true;
  });

  const toggleAll = (checked: boolean) => {
    setSelectedProducts(checked ? new Set(filteredItems.map((p) => p.name)) : new Set());
  };

  const deleteSelected = () => {
    if (selectedProducts.size === 0) return alert("삭제할 상품을 선택해 주세요.");
    if (confirm("삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((p) => !selectedProducts.has(p.name)));
      setSelectedProducts(new Set());
    }
  };

  const stopSellingSelected = () => {
    if (selectedProducts.size === 0) return alert("상품을 선택해 주세요.");
    setItems((prev) =>
      prev.map((p) => (selectedProducts.has(p.name) ? { ...p, status: "판매 중지" } : p)),
    );
    setSelectedProducts(new Set());
  };

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-5">
          <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">상품 관리</h1>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className={primaryButton}
          >
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
              placeholder="상품명 검색"
              className="min-w-0 flex-1 text-[13px] outline-none placeholder:text-[#8b96a3]"
            />
          </label>
          <div className="w-[170px]">
            <SelectField value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
              <option value="전체 테마">전체 테마</option>
              {FIXED_THEMES.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </SelectField>
          </div>
          <div className="w-[130px]">
            <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              {["전체 나라", "일본", "몰디브", "스위스", "이탈리아", "베트남", "프랑스", "태국"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </SelectField>
          </div>
          <div className="w-[130px]">
            <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="전체 상태">전체 상태</option>
              <option value="판매 중">판매 중</option>
              <option value="판매 중지">판매 중지</option>
            </SelectField>
          </div>
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setThemeFilter("전체 테마");
              setCountryFilter("전체 나라");
              setStatusFilter("전체 상태");
              setActiveTab("전체");
            }}
            className={secondaryButton}
          >
            초기화
          </button>
        </div>

        <section className="border border-[#dde4e8] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 p-[18px]">
            <div className="leading-[1.4]">
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">전체 상품 목록</h2>
              <p className="mt-1 text-xs text-[#65717e]">전체 {filteredItems.length}건</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={deleteSelected} className={secondaryButton}>선택 삭제</button>
              <button type="button" onClick={stopSellingSelected} className={secondaryButton}>선택 판매 중지</button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="w-full min-w-[1100px]">
              <div className="grid h-10 w-full bg-[#c7e8ef]" style={tableColumnsStyle}>
                <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                  <Checkbox
                    checked={filteredItems.length > 0 && selectedProducts.size === filteredItems.length}
                    onChange={toggleAll}
                  />
                </div>
                {["상품명 / 상품코드", "테마", "나라", "선택 가능한 투어 등급", "기본가격", "판매 상태", "최종 수정일", "관리"].map((h) => (
                  <div key={h} className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2.5 font-['42dot_Sans:Bold'] text-[11px] font-bold text-[#65717e]">
                    {h}
                  </div>
                ))}
              </div>

              {filteredItems.map((product) => (
                <div
                  key={product.name}
                  style={tableColumnsStyle}
                  className={`grid h-[54px] w-full ${selectedProducts.has(product.name) ? "bg-[#f1fafc]" : "bg-white"}`}
                >
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                    <Checkbox
                      checked={selectedProducts.has(product.name)}
                      onChange={(checked) => {
                        const next = new Set(selectedProducts);
                        if (checked) next.add(product.name);
                        else next.delete(product.name);
                        setSelectedProducts(next);
                      }}
                    />
                  </div>
                  <div className="flex items-center border-r border-b border-[#dde4e8] px-2.5 text-[13px] text-[#17212b] font-bold">
                    {product.name}
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.theme}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.country}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.grades}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.price}원</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.status}</div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] text-xs">{product.date}</div>
                  <div className="flex items-center justify-center border-b border-[#dde4e8]">
                    <button
                      type="button"
                      onClick={() => setEditing(product)}
                      className="rounded border border-[#c8d2d8] bg-white px-2.5 py-1 text-xs hover:bg-[#f8fafb]"
                    >
                      편집
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

function ProductEditView({
  product,
  isCreate,
  adminName,
  onNavigate,
  onLogout,
  onBack,
  onSave,
}: {
  product: Product | null;
  isCreate: boolean;
  adminName: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
  onSave: (saved: Product) => void;
}) {
  const [selectedThemeId, setSelectedThemeId] = useState<number>(1);
  const selectedTheme = FIXED_THEMES.find((t) => t.id === selectedThemeId) || FIXED_THEMES[0];

  const [fixedOptions, setFixedOptions] = useState<FixedOptionItem[]>([
    { key: "h3", type: "HOTEL", code: "STAR_3", name: "3등급 호텔", enabled: true, extraPrice: "" },
    { key: "h4", type: "HOTEL", code: "STAR_4", name: "4등급 호텔", enabled: true, extraPrice: "" },
    { key: "h5", type: "HOTEL", code: "STAR_5", name: "5등급 호텔", enabled: true, extraPrice: "" },
    { key: "m1", type: "MEAL", code: "LUNCHBOX", name: "도시락", enabled: true, extraPrice: "" },
    { key: "m2", type: "MEAL", code: "LOCAL_RESTAURANT", name: "현지식 레스토랑", enabled: true, extraPrice: "" },
    { key: "m3", type: "MEAL", code: "FINE_DINING", name: "고급 레스토랑", enabled: true, extraPrice: "" },
    { key: "v1", type: "VEHICLE", code: "PRIVATE_LIMOUSINE", name: "VIP 리무진", enabled: false, extraPrice: "" },
  ]);

  const [drinkOptions, setDrinkOptions] = useState<DrinkOptionItem[]>([
    { id: "d1", name: "샴페인", extraPrice: "" },
    { id: "d2", name: "커피", extraPrice: "" },
  ]);
  const [newDrinkName, setNewDrinkName] = useState("");
  const [newDrinkPrice, setNewDrinkPrice] = useState("");

  const handleAddDrink = () => {
    if (!newDrinkName.trim()) return alert("음료명을 입력해 주세요.");
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

  // 등급별 추가가격
  const [gradePrices, setGradePrices] = useState<Record<TourGradeKey, { enabled: boolean; extraPrice: string }>>({
    CLASSIC: { enabled: true, extraPrice: "" },
    GRAND: { enabled: true, extraPrice: "" },
    PREMIUM: { enabled: true, extraPrice: "" },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const price = String(formData.get("price") || "0");
    const duration = String(formData.get("duration") || "").trim();

    if (!name || !country || !price) {
      alert("상품명, 나라, 기본가격을 모두 입력해 주세요.");
      return;
    }

    const savedProduct: Product = {
      name,
      theme: selectedTheme.name,
      country,
      grades: selectedTheme.allowedGrades.join(" / "),
      price: Number(price).toLocaleString(),
      options: "숙소 · 식사 · 차량 · 음료",
      status: "판매 중",
      date: new Date().toISOString().slice(0, 10),
      duration,
    };

    onSave(savedProduct);
  };

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#17212b]">
            {isCreate ? "상품 등록" : "상품 수정"}
          </h1>
          <button type="button" onClick={onBack} className={secondaryButton}>목록으로</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel title="기본 정보">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField label="테마 선택 *">
                <SelectField
                  value={selectedThemeId}
                  onChange={(e) => setSelectedThemeId(Number(e.target.value))}
                >
                  {FIXED_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </SelectField>
              </InfoField>

              <InfoField label="나라 *">
                <input name="country" defaultValue={product?.country || ""} className={fieldClass} required />
              </InfoField>

              <InfoField label="상품명 *">
                <input name="name" defaultValue={product?.name || ""} className={fieldClass} required />
              </InfoField>

              <InfoField label="여행 기간 *">
                <input name="duration" defaultValue={product?.duration || ""} className={fieldClass} required />
              </InfoField>

              <InfoField label="최소 인원수">
                <input
                  value={selectedTheme.fixedPeople ? `${selectedTheme.fixedPeople}명` : "3명"}
                  disabled
                  className={`${fieldClass} bg-[#f3f4f6] text-[#6b7280]`}
                />
              </InfoField>

              <InfoField label="기본 패키지 가격 (원) *">
                <input
                  name="price"
                  defaultValue={product?.price?.replace(/[^\d]/g, "") || ""}
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
            </div>
          </Panel>

          <Panel title="선택 가능한 투어 등급">
            <div className="border border-[#dde4e8] text-xs">
              <div className="grid grid-cols-[60px_120px_2.5fr_200px] bg-[#c7e8ef] h-9 font-bold text-[#65717e] items-center px-3 border-b border-[#dde4e8]">
                <span>사용</span>
                <span>등급</span>
                <span>기본 구성</span>
                <span>추가가격</span>
              </div>
              {[
                { grade: "CLASSIC" as TourGradeKey, name: "클래식", desc: "3등급 숙소 + 도시락" },
                { grade: "GRAND" as TourGradeKey, name: "그랜드", desc: "4등급 숙소 + 현지식 레스토랑" },
                { grade: "PREMIUM" as TourGradeKey, name: "프리미엄", desc: "5등급 숙소 + 고급 레스토랑 + 샴페인 음료" },
              ].map((row) => {
                const isAllowed = selectedTheme.allowedGrades.includes(row.grade);
                const item = gradePrices[row.grade];

                return (
                  <div
                    key={row.grade}
                    className={`grid grid-cols-[60px_120px_2.5fr_200px] h-12 items-center px-3 border-b border-[#dde4e8] ${!isAllowed ? "bg-[#f3f4f6] opacity-50" : "bg-white"}`}
                  >
                    <Checkbox
                      checked={isAllowed && item.enabled}
                      onChange={(checked) => {
                        if (isAllowed) {
                          setGradePrices((prev) => ({
                            ...prev,
                            [row.grade]: { ...prev[row.grade], enabled: checked },
                          }));
                        }
                      }}
                    />
                    <span className="">{row.name}</span>
                    <span className="text-[#65717e]">{row.desc}</span>
                    <PriceInput
                      value={item.extraPrice}
                      onChange={(val) =>
                        setGradePrices((prev) => ({
                          ...prev,
                          [row.grade]: { ...prev[row.grade], extraPrice: val },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="선택 옵션">
            <div className="border border-[#dde4e8] text-xs">
              <div className="grid grid-cols-[60px_100px_2fr_200px] bg-[#c7e8ef] h-9 font-bold text-[#65717e] items-center px-3 border-b border-[#dde4e8]">
                <span>사용</span>
                <span>구분</span>
                <span>옵션명</span>
                <span>추가가격</span>
              </div>
              {fixedOptions.map((opt, idx) => (
                <div key={opt.key} className="grid grid-cols-[60px_100px_2fr_200px] h-11 items-center px-3 border-b border-[#dde4e8] bg-white">
                  <Checkbox
                    checked={opt.enabled}
                    onChange={(checked) => {
                      setFixedOptions((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, enabled: checked } : item))
                      );
                    }}
                  />
                  <span className="text-[#17212b]">{opt.type}</span>
                  <span className="font-normal">{opt.name}</span>
                  <PriceInput
                    value={opt.extraPrice}
                    onChange={(val) => {
                      setFixedOptions((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, extraPrice: val } : item))
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="추가 음료 옵션">
            <div className="space-y-3">
              <div className="border border-[#dde4e8] text-xs">
                <div className="grid grid-cols-[2fr_200px_80px] bg-[#c7e8ef] h-9 font-bold text-[#65717e] items-center px-3 border-b border-[#dde4e8]">
                  <span>음료명</span>
                  <span>추가가격</span>
                  <span className="text-center">삭제</span>
                </div>
                {drinkOptions.map((d) => (
                  <div key={d.id} className="grid grid-cols-[2fr_200px_80px] h-11 items-center px-3 border-b border-[#dde4e8] bg-white">
                    <span className="font-normal">{d.name}</span>
                    <PriceInput
                      value={d.extraPrice}
                      onChange={(val) => {
                        setDrinkOptions((prev) =>
                          prev.map((item) => (item.id === d.id ? { ...item, extraPrice: val } : item))
                        );
                      }}
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
                <PriceInput
                  value={newDrinkPrice}
                  onChange={setNewDrinkPrice}
                  onKeyDown={handleKeyDownAddDrink}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={handleAddDrink}
                  className={`${secondaryButton} shrink-0 whitespace-nowrap`}
                >
                  추가
                </button>
              </div>
            </div>
          </Panel>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onBack} className={secondaryButton}>취소</button>
            <button type="submit" className={primaryButton}>저장하기</button>
          </div>
        </form>
      </main>
    </AdminShell>
  );
}
