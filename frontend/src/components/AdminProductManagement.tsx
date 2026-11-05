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

//테마 타입
export type TourGradeKey = "클래식" | "그랜드" | "프리미엄";

export type ThemeItem = {
  id: string;
  name: string;
  allowedGrades: TourGradeKey[];
};

const initialThemes: ThemeItem[] = [
  { id: "theme-1", name: "효도여행", allowedGrades: ["클래식", "프리미엄"] },
  { id: "theme-2", name: "허니문", allowedGrades: ["그랜드", "프리미엄"] },
  { id: "theme-3", name: "힐링여행", allowedGrades: ["클래식", "프리미엄"] },
  { id: "theme-4", name: "미식여행", allowedGrades: ["그랜드", "프리미엄"] },
  { id: "theme-5", name: "가족여행", allowedGrades: ["클래식", "그랜드", "프리미엄"] },
  { id: "theme-6", name: "문화여행", allowedGrades: ["클래식", "프리미엄"] },
  { id: "theme-7", name: "골프여행", allowedGrades: ["프리미엄"] },
];

const gradeDefaultOptionsMap: Record<
  TourGradeKey,
  { hotels: string[]; meals: string[]; drinks: string[] }
> = {
  클래식: { hotels: ["3등급 호텔"], meals: ["도시락"], drinks: [] },
  그랜드: { hotels: ["4등급 호텔"], meals: ["현지식 레스토랑"], drinks: [] },
  프리미엄: { hotels: ["5등급 호텔"], meals: ["고급 레스토랑"], drinks: ["샴페인"] },
};

//상품, 옵션
export type CustomAddOn = {
  id: string;
  enabled: boolean;
  type: string;
  name: string;
  price: string;
};

export type CustomDrink = {
  id: string;
  enabled: boolean;
  name: string;
  price: string;
};

const defaultInitialAddOns: CustomAddOn[] = [
  { id: "addon-1", enabled: true, type: "숙소", name: "3등급 호텔", price: "0" },
  { id: "addon-2", enabled: false, type: "숙소", name: "4등급 호텔", price: "150,000" },
  { id: "addon-3", enabled: false, type: "숙소", name: "5등급 호텔", price: "300,000" },
  { id: "addon-4", enabled: true, type: "식사", name: "도시락", price: "0" },
  { id: "addon-5", enabled: false, type: "식사", name: "현지식 레스토랑", price: "40,000" },
  { id: "addon-6", enabled: false, type: "식사", name: "고급 레스토랑", price: "80,000" },
];

const defaultInitialDrinks: CustomDrink[] = [
  { id: "drink-1", enabled: false, name: "샴페인", price: "70,000" },
  { id: "drink-2", enabled: false, name: "커피", price: "30,000" },
];

const tableColumns =
  "grid-cols-[40px_320px_100px_90px_200px_140px_100px_120px_90px]";

function PriceInput({
  defaultValue,
  name,
  value,
  onChange,
  placeholder,
}: {
  defaultValue?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <input
        name={name}
        {...(value === undefined
          ? { defaultValue }
          : {
              value,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                onChange?.(event.target.value),
            })}
        placeholder={placeholder}
        inputMode="numeric"
        className={`${fieldClass} pr-8`}
      />
      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#65717e]">
        원
      </span>
    </div>
  );
}

//상품 관리
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
  const [themes, setThemes] = useState<ThemeItem[]>(initialThemes);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // 검색, 필터
  const [keyword, setKeyword] = useState("");
  const [themeFilter, setThemeFilter] = useState("전체 테마");
  const [countryFilter, setCountryFilter] = useState("전체 나라");
  const [statusFilter, setStatusFilter] = useState("전체 상태");
  const [activeTab, setActiveTab] = useState<"전체" | "판매 중" | "판매 중지">("전체");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(() => new Set());

  // 상품 등록, 편집
  if (isCreating || editing) {
    const isCreate = isCreating;
    const currentProduct: Product = editing || {
      name: "",
      theme: themes[0]?.name || "효도여행",
      country: "",
      grades: "클래식",
      price: "",
      options: "숙소 · 식사 · 음료",
      status: "판매 중",
      date: new Date().toISOString().slice(0, 10),
      duration: "",
    };

    return (
      <ProductEditView
        product={currentProduct}
        isCreate={isCreate}
        themes={themes}
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBack={() => {
          setEditing(null);
          setIsCreating(false);
        }}
        onSave={(saved) => {
          if (isCreate) {
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

  // 필터링 적용
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

  const toggleOne = (name: string, checked: boolean) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  };

  // 상품 삭제 팝업
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

  const allSelected = filteredItems.length > 0 && selectedProducts.size === filteredItems.length;

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-5">
          <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">상품 관리</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              className={secondaryButton}
            >
              테마 관리
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className={primaryButton}
            >
              상품 등록
            </button>
          </div>
        </div>

        {/* 필터 바 */}
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
          <div className="w-[150px]">
            <SelectField value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
              <option value="전체 테마">전체 테마</option>
              {themes.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </SelectField>
          </div>
          <div className="w-[130px]">
            <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              {["전체 나라", "일본", "몰디브", "스위스", "이탈리아", "베트남", "프랑스", "태국", "호주", "대만"].map((c) => (
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
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">
                전체 상품 목록
              </h2>
              <p className="mt-1 text-xs text-[#65717e]">
                전체 {filteredItems.length}건 · 선택 {selectedProducts.size}건
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={deleteSelected} className={secondaryButton}>
                선택 삭제
              </button>
              <button type="button" onClick={stopSellingSelected} className={secondaryButton}>
                선택 판매 중지
              </button>
            </div>
          </div>

          <div className="flex gap-6 border-b border-[#dde4e8] px-[18px]">
            {(["전체", "판매 중", "판매 중지"] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-0.5 py-3 text-[13px] cursor-pointer ${
                  activeTab === tab
                    ? "border-[#1596b4] font-['42dot_Sans:Bold'] font-bold text-[#1596b4]"
                    : "border-transparent text-[#65717e]"
                }`}
              >
                {tab} {tab === "전체" ? items.length : items.filter((p) => p.status === tab).length}
              </button>
            ))}
          </div>

          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="w-[1240px]">
                {/* 💡 헤더 행: w-full 및 bg-[#c7e8ef]로 가로 스크롤 끝까지 완벽 도색 */}
                <div className={`grid h-10 w-full bg-[#c7e8ef] ${tableColumns}`}>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                    <Checkbox checked={allSelected} onChange={toggleAll} />
                  </div>
                  {[
                    "상품명 / 상품코드",
                    "테마",
                    "나라",
                    "선택 가능한 투어 등급",
                    "기본가격",
                    "판매 상태",
                    "최종 수정일",
                    "관리",
                  ].map((h) => (
                    <div
                      key={h}
                      className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2.5 font-['42dot_Sans:Bold'] text-[11px] font-bold text-[#65717e]"
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* 데이터 행들 */}
                {filteredItems.map((product, index) => (
                  <div
                    key={product.name}
                    className={`grid h-[54px] w-full ${tableColumns} ${
                      selectedProducts.has(product.name) ? "bg-[#f1fafc]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                      <Checkbox
                        checked={selectedProducts.has(product.name)}
                        onChange={(checked) => toggleOne(product.name, checked)}
                      />
                    </div>
                    <div
                      className={`flex items-center border-r border-b border-[#dde4e8] px-2.5 text-[13px] text-[#17212b] ${
                        index === 0 ? "font-['42dot_Sans:Bold'] font-bold" : ""
                      }`}
                    >
                      {product.name}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-center text-xs text-[#17212b]">
                      {product.theme}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-center text-xs text-[#17212b]">
                      {product.country}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-center text-xs text-[#17212b]">
                      {product.grades}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 font-['42dot_Sans:Bold'] text-xs font-bold">
                      {product.price}원
                    </div>
                    <div
                      className={`flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-xs ${
                        product.status === "판매 중" ? "text-[#1596b4]" : "text-[#17212b]"
                      }`}
                    >
                      {product.status}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-xs">
                      {product.date}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                      <button
                        type="button"
                        onClick={() => setEditing(product)}
                        className="min-h-7 rounded-md border border-[#c8d2d8] bg-white px-2.5 py-1 text-xs hover:bg-[#f8fafb]"
                      >
                        편집
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 테마 관리 모달 */}
        {showThemeModal && (
          <ThemeManagementModal
            themes={themes}
            onClose={() => setShowThemeModal(false)}
            onUpdateThemes={setThemes}
          />
        )}
      </main>
    </AdminShell>
  );
}

//테마 관리
function ThemeManagementModal({
  themes,
  onClose,
  onUpdateThemes,
}: {
  themes: ThemeItem[];
  onClose: () => void;
  onUpdateThemes: (newThemes: ThemeItem[]) => void;
}) {
  const [themeList, setThemeList] = useState<ThemeItem[]>(themes);
  const [newThemeName, setNewThemeName] = useState("");
  const [newGrades, setNewGrades] = useState<TourGradeKey[]>(["클래식"]);

  const toggleGradeForNew = (grade: TourGradeKey) => {
    setNewGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  };

  const handleAddTheme = () => {
    if (!newThemeName.trim()) return alert("테마명을 입력해 주세요.");
    if (newGrades.length === 0) return alert("최소 1개 이상의 투어 등급을 선택해야 합니다.");
    if (themeList.some((t) => t.name === newThemeName.trim())) return alert("이미 등록된 테마명입니다.");

    const newTheme: ThemeItem = {
      id: `theme-${Date.now()}`,
      name: newThemeName.trim(),
      allowedGrades: newGrades,
    };
    const nextList = [...themeList, newTheme];
    setThemeList(nextList);
    onUpdateThemes(nextList);
    setNewThemeName("");
    setNewGrades(["클래식"]);
  };

  // 삭제 팝업
  const handleDeleteTheme = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      const nextList = themeList.filter((t) => t.id !== id);
      setThemeList(nextList);
      onUpdateThemes(nextList);
    }
  };

  const toggleGradeInList = (themeId: string, grade: TourGradeKey) => {
    const nextList = themeList.map((t) => {
      if (t.id !== themeId) return t;
      const updated = t.allowedGrades.includes(grade)
        ? t.allowedGrades.filter((g) => g !== grade)
        : [...t.allowedGrades, grade];
      if (updated.length === 0) {
        alert("최소 1개 이상의 투어 등급이 유지되어야 합니다.");
        return t;
      }
      return { ...t, allowedGrades: updated };
    });
    setThemeList(nextList);
    onUpdateThemes(nextList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl border border-[#dde4e8] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#dde4e8] px-6 py-4 bg-[#f8fafb]">
          <h2 className="font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">
            테마 관리 및
          </h2>
          <button type="button" onClick={onClose} className="text-xl text-[#65717e] hover:text-black">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 새 테마 등록 패널 */}
          <div className="border border-[#dde4e8] p-4 bg-[#fbfdfd]">
            <h3 className="font-['42dot_Sans:Bold'] text-xs font-bold text-[#17212b] mb-3">
              신규 테마 등록
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="테마명"
                className={`${fieldClass} w-48`}
              />
              <div className="flex items-center gap-3 text-xs">
                {(["클래식", "그랜드", "프리미엄"] as TourGradeKey[]).map((grade) => (
                  <label key={grade} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={newGrades.includes(grade)}
                      onChange={() => toggleGradeForNew(grade)}
                    />
                    <span>{grade}</span>
                  </label>
                ))}
              </div>
              <button type="button" onClick={handleAddTheme} className={primaryButton}>
                테마 추가
              </button>
            </div>
          </div>

          {/* 등록된 테마 목록 표 */}
          <div>
            <h3 className="font-['42dot_Sans:Bold'] text-sm font-bold mb-2">
              등록된 테마 목록 ({themeList.length}건)
            </h3>
            <div className="border border-[#dde4e8] text-xs">
              <div className="grid grid-cols-[160px_1fr_80px] bg-[#c7e8ef] h-10 border-b border-[#dde4e8]">
                <div className="flex items-center px-3 font-['42dot_Sans:Bold'] font-bold text-[#65717e] border-r border-[#dde4e8]">
                  테마명
                </div>
                <div className="flex items-center px-3 font-['42dot_Sans:Bold'] font-bold text-[#65717e] border-r border-[#dde4e8]">
                  선택 가능한 투어 등급 설정
                </div>
                <div className="flex items-center justify-center font-['42dot_Sans:Bold'] font-bold text-[#65717e]">
                  삭제
                </div>
              </div>

              {themeList.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[160px_1fr_80px] h-11 border-b border-[#dde4e8] bg-white hover:bg-[#fbfdfd]"
                >
                  <div className="flex items-center px-3 text-[#17212b] border-r border-[#dde4e8]">
                    {t.name}
                  </div>
                  <div className="flex items-center gap-4 px-3 border-r border-[#dde4e8]">
                    {(["클래식", "그랜드", "프리미엄"] as TourGradeKey[]).map((grade) => (
                      <label key={grade} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={t.allowedGrades.includes(grade)}
                          onChange={() => toggleGradeInList(t.id, grade)}
                        />
                        <span>{grade}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteTheme(t.id)}
                      className="text-xs text-[#17212b] hover:underline cursor-pointer"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-[#dde4e8] bg-[#f8fafb]">
          <button type="button" onClick={onClose} className={primaryButton}>
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductEditView({
  product,
  isCreate,
  themes,
  adminName,
  onNavigate,
  onLogout,
  onBack,
  onSave,
}: {
  product: Product;
  isCreate: boolean;
  themes: ThemeItem[];
  adminName: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
  onSave: (product: Product) => void;
}) {
  const [error, setError] = useState("");

  const [selectedTheme, setSelectedTheme] = useState<string>(
    product.theme || themes[0]?.name || "효도여행",
  );

  const currentThemeObj = themes.find((t) => t.name === selectedTheme) || themes[0];
  const allowedGradesForTheme = currentThemeObj ? currentThemeObj.allowedGrades : ["클래식"];

  const [tourGradesState, setTourGradesState] = useState<
    Array<{ grade: TourGradeKey; price: string; checked: boolean }>
  >(() => {
    const existing = product.grades.split("/").map((g) => g.trim());
    return [
      { grade: "클래식", price: "0", checked: existing.includes("클래식") || true },
      { grade: "그랜드", price: "600,000", checked: existing.includes("그랜드") },
      { grade: "프리미엄", price: "300,000", checked: existing.includes("프리미엄") },
    ];
  });

  const [addOnList, setAddOnList] = useState<CustomAddOn[]>(() => {
    if (product.customAddOns && product.customAddOns.length > 0) {
      return product.customAddOns.map((a, i) => ({
        id: `addon-${Date.now()}-${i}`,
        enabled: a.enabled,
        type: a.type,
        name: a.name,
        price: a.price,
      }));
    }
    return defaultInitialAddOns;
  });

  const [newAddOn, setNewAddOn] = useState({ type: "", name: "", price: "" });

  const [drinkList, setDrinkList] = useState<CustomDrink[]>(() => {
    if (product.customDrinks && product.customDrinks.length > 0) {
      return product.customDrinks.map((d, i) => ({
        id: `drink-${Date.now()}-${i}`,
        enabled: d.enabled,
        name: d.name,
        price: d.price,
      }));
    }
    return defaultInitialDrinks;
  });

  const [newDrink, setNewDrink] = useState({ name: "", price: "" });

  const handleToggleGrade = (gradeKey: TourGradeKey, checked: boolean) => {
    setTourGradesState((prev) =>
      prev.map((g) => (g.grade === gradeKey ? { ...g, checked } : g)),
    );

    if (checked) {
      const defaults = gradeDefaultOptionsMap[gradeKey];
      setAddOnList((prev) =>
        prev.map((item) =>
          defaults.hotels.includes(item.name) || defaults.meals.includes(item.name)
            ? { ...item, enabled: true }
            : item,
        ),
      );
      if (defaults.drinks.length > 0) {
        setDrinkList((prev) =>
          prev.map((item) =>
            defaults.drinks.includes(item.name) ? { ...item, enabled: true } : item,
          ),
        );
      }
    }
  };

  const handleDeleteAddOn = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      setAddOnList((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleDeleteDrink = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      setDrinkList((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim();
    const duration = String(formData.get("duration") ?? "").trim();
    const status = String(formData.get("status") ?? "판매 중").trim();
    const price = String(formData.get("price") ?? "")
      .replace(/[^\d]/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const activeGrades = tourGradesState.filter(
      (g) => g.checked && allowedGradesForTheme.includes(g.grade),
    );
    if (activeGrades.length === 0) {
      setError("해당 테마에서 선택 가능한 투어 등급을 최소 1개 이상 체크해 주세요.");
      return;
    }

    if (!name || !country || !duration || !price) {
      setError("상품명, 나라, 여행 기간, 기본가격을 모두 입력해 주세요.");
      return;
    }

    onSave({
      name,
      theme: selectedTheme,
      country,
      duration,
      status,
      price,
      grades: activeGrades.map((g) => g.grade).join(" / "),
      options: "숙소 · 식사 · 음료",
      date: isCreate ? new Date().toISOString().slice(0, 10) : product.date,
      customAddOns: addOnList.map(({ id, ...rest }) => ({ ...rest, rule: "" })),
      customDrinks: drinkList.map(({ id, ...rest }) => rest),
    });
  };

  return (
    <AdminShell active="products" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-5">
          <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">
            {isCreate ? "상품 등록" : "상품 편집"}
          </h1>
          <button type="button" onClick={onBack} className={secondaryButton}>
            상품 목록
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* =상품 기본 정보 */}
          <Panel title="상품 기본 정보">
            <div className="grid md:grid-cols-2">
              <InfoField label="상품명 *" full>
                <input
                  name="name"
                  defaultValue={product.name}
                  placeholder="상품명을 입력해 주세요."
                  className={fieldClass}
                />
              </InfoField>

              <InfoField label="테마 *">
                <SelectField
                  defaultValue={selectedTheme}
                  name="theme"
                  onChange={(e) => setSelectedTheme(e.target.value)}
                >
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.name}>{theme.name}</option>
                  ))}
                </SelectField>
              </InfoField>

              <InfoField label="나라 *">
                <input
                  name="country"
                  defaultValue={product.country}
                  placeholder="예: 일본, 스위스, 몰디브"
                  className={fieldClass}
                  required
                />
              </InfoField>

              <InfoField label="여행 기간">
                <input
                  name="duration"
                  defaultValue={product.duration}
                  placeholder="예: 3박 4일"
                  className={fieldClass}
                />
              </InfoField>

              <InfoField label="판매 상태">
                <SelectField defaultValue={product.status || "판매 중"} name="status">
                  <option value="판매 중">판매 중</option>
                  <option value="판매 중지">판매 중지</option>
                </SelectField>
              </InfoField>

              <InfoField label="기본가격 *" full>
                <div className="w-full max-w-sm">
                  <PriceInput defaultValue={product.price} name="price" />
                </div>
              </InfoField>
            </div>
          </Panel>

          {/* 선택 가능 투어등급 */}
          <Panel title="선택 가능한 투어 등급" className="overflow-x-auto">
            <div className="grid h-8 grid-cols-[56px_minmax(180px,1fr)_260px] bg-[#c7e8ef] text-[11px] text-[#65717e]">
              {["사용", "투어 등급", "추가가격 (1인 기준)"].map((header) => (
                <div
                  key={header}
                  className="flex items-center border-r border-[#dde4e8] px-3 font-['42dot_Sans:Bold'] font-bold"
                >
                  {header}
                </div>
              ))}
            </div>
            {tourGradesState.map((item, idx) => {
              const isAllowed = allowedGradesForTheme.includes(item.grade);
              return (
                <div
                  key={item.grade}
                  className={`grid h-[43px] grid-cols-[56px_minmax(180px,1fr)_260px] border-b border-[#dde4e8] ${
                    !isAllowed
                      ? "bg-[#f2f4f5] opacity-50"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center border-r border-[#dde4e8] px-3">
                    <Checkbox
                      checked={isAllowed && item.checked}
                      onChange={(checked) => isAllowed && handleToggleGrade(item.grade, checked)}
                    />
                  </div>
                  <div className="flex items-center border-r border-[#dde4e8] px-3 text-[13px]">
                    <span>{item.grade}</span>
                  </div>
                  <div className="flex items-center border-r border-[#dde4e8] px-3">
                    <PriceInput
                      defaultValue={item.price}
                      onChange={(val) => {
                        setTourGradesState((prev) =>
                          prev.map((g, i) => (i === idx ? { ...g, price: val } : g)),
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Panel>

          {/* 부가 옵션, 추가가격*/}
          <Panel title="부가 옵션 및 추가가격" className="overflow-x-auto">
            <div className="grid h-8 grid-cols-[56px_80px_minmax(200px,1fr)_240px_70px] bg-[#c7e8ef] text-[11px] text-[#65717e]">
              {["사용", "구분", "옵션명", "추가가격", "삭제"].map((header) => (
                <div
                  key={header}
                  className="flex items-center justify-center border-r border-[#dde4e8] px-2 font-['42dot_Sans:Bold'] font-bold"
                >
                  {header}
                </div>
              ))}
            </div>

            {addOnList.map((item, index) => (
              <div
                key={item.id}
                className="grid h-11 grid-cols-[56px_80px_minmax(200px,1fr)_240px_70px] border-b border-[#dde4e8]"
              >
                <div className="flex items-center justify-center border-r border-[#dde4e8]">
                  <Checkbox
                    checked={item.enabled}
                    onChange={(enabled) =>
                      setAddOnList((prev) =>
                        prev.map((a, i) => (i === index ? { ...a, enabled } : a)),
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-center border-r border-[#dde4e8] px-2 text-xs text-[#65717e]">
                  {item.type}
                </div>
                <div className="flex items-center border-r border-[#dde4e8] px-3">
                  <input
                    value={item.name}
                    onChange={(e) =>
                      setAddOnList((prev) =>
                        prev.map((a, i) => (i === index ? { ...a, name: e.target.value } : a)),
                      )
                    }
                    className={fieldClass}
                  />
                </div>
                <div className="flex items-center border-r border-[#dde4e8] px-3">
                  <PriceInput
                    value={item.price}
                    onChange={(val) =>
                      setAddOnList((prev) =>
                        prev.map((a, i) => (i === index ? { ...a, price: val } : a)),
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-center border-r border-[#dde4e8]">
                  <button
                    type="button"
                    onClick={() => handleDeleteAddOn(item.id)}
                    className="text-xs text-[#17212b] hover:underline cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {/* 새 옵션 추가 */}
            <div className="grid h-11 grid-cols-[56px_80px_minmax(200px,1fr)_240px_70px] border-b border-[#dde4e8] bg-[#fbfdfd]">
              <div className="flex items-center justify-center border-r border-[#dde4e8] text-[10px] text-gray-400">
                신규
              </div>
              <div className="flex items-center border-r border-[#dde4e8] px-1">
                <input
                  value={newAddOn.type}
                  onChange={(e) => setNewAddOn({ ...newAddOn, type: e.target.value })}
                  placeholder="구분"
                  className="h-8 w-full p-1 text-xs border rounded"
                />
              </div>
              <div className="flex items-center border-r border-[#dde4e8] px-2">
                <input
                  value={newAddOn.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.trim()) {
                      setAddOnList((prev) => [
                        ...prev,
                        {
                          id: `addon-${Date.now()}`,
                          enabled: true,
                          type: newAddOn.type || "옵션",
                          name: val,
                          price: newAddOn.price || "0",
                        },
                      ]);
                      setNewAddOn({ type: "", name: "", price: "" });
                    } else {
                      setNewAddOn({ ...newAddOn, name: val });
                    }
                  }}
                  placeholder="+ 새 옵션명 입력 시 자동 추가"
                  className={fieldClass}
                />
              </div>
              <div className="flex items-center border-r border-[#dde4e8] px-2">
                <PriceInput
                  value={newAddOn.price}
                  onChange={(val) => setNewAddOn({ ...newAddOn, price: val })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-center text-xs text-gray-300">
                -
              </div>
            </div>
          </Panel>

          {/* 추가 음료 */}
          <Panel title="추가 음료 옵션" className="overflow-x-auto">
            <div className="grid h-8 grid-cols-[56px_minmax(200px,1fr)_240px_70px] bg-[#c7e8ef] text-[11px] text-[#65717e]">
              {["사용", "음료명", "추가가격", "삭제"].map((header) => (
                <div
                  key={header}
                  className="flex items-center justify-center border-r border-[#dde4e8] px-2 font-['42dot_Sans:Bold'] font-bold"
                >
                  {header}
                </div>
              ))}
            </div>

            {drinkList.map((item, index) => (
              <div
                key={item.id}
                className="grid h-[50px] grid-cols-[56px_minmax(200px,1fr)_240px_70px] border-b border-[#dde4e8]"
              >
                <div className="flex items-center justify-center border-r border-[#dde4e8]">
                  <Checkbox
                    checked={item.enabled}
                    onChange={(enabled) =>
                      setDrinkList((prev) =>
                        prev.map((d, i) => (i === index ? { ...d, enabled } : d)),
                      )
                    }
                  />
                </div>
                <div className="flex items-center border-r border-[#dde4e8] px-3">
                  <input
                    value={item.name}
                    onChange={(e) =>
                      setDrinkList((prev) =>
                        prev.map((d, i) => (i === index ? { ...d, name: e.target.value } : d)),
                      )
                    }
                    className={fieldClass}
                  />
                </div>
                <div className="flex items-center border-r border-[#dde4e8] px-3">
                  <PriceInput
                    value={item.price}
                    onChange={(val) =>
                      setDrinkList((prev) =>
                        prev.map((d, i) => (i === index ? { ...d, price: val } : d)),
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-center border-r border-[#dde4e8]">
                  <button
                    type="button"
                    onClick={() => handleDeleteDrink(item.id)}
                    className="text-xs text-[#17212b] hover:underline cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {/* 새 음료 추가 */}
            <div className="grid h-[50px] grid-cols-[56px_minmax(200px,1fr)_240px_70px] border-b border-[#dde4e8] bg-[#fbfdfd]">
              <div className="flex items-center justify-center border-r border-[#dde4e8] text-[10px] text-gray-400">
                신규
              </div>
              <div className="flex items-center border-r border-[#dde4e8] px-2">
                <input
                  value={newDrink.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.trim()) {
                      setDrinkList((prev) => [
                        ...prev,
                        {
                          id: `drink-${Date.now()}`,
                          enabled: true,
                          name: val,
                          price: newDrink.price || "0",
                        },
                      ]);
                      setNewDrink({ name: "", price: "" });
                    } else {
                      setNewDrink({ ...newDrink, name: val });
                    }
                  }}
                  placeholder="+ 새 음료명 입력 시 추가"
                  className={fieldClass}
                />
              </div>
              <div className="flex items-center border-r border-[#dde4e8] px-2">
                <PriceInput
                  value={newDrink.price}
                  onChange={(val) => setNewDrink({ ...newDrink, price: val })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-center text-xs text-gray-300">
                -
              </div>
            </div>
          </Panel>

          {error && (
            <p role="alert" className="mt-5 text-right text-[13px] text-[#ba4f4f] font-bold">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onBack} className={secondaryButton}>
              취소
            </button>
            <button type="submit" className={primaryButton}>
              {isCreate ? "상품 등록" : "변경 사항 저장"}
            </button>
          </div>
        </form>
      </main>
    </AdminShell>
  );
}