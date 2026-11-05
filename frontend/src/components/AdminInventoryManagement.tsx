import React, { useState, type FormEvent } from "react";
import { assets, type InventoryItem, type InventoryHistory, type AdminSection } from "../types/admin";
import {
  AdminShell,
  Checkbox,
  Panel,
  InfoField,
  fieldClass,
  primaryButton,
  secondaryButton,
} from "./AdminCommon";

const defaultInventory: InventoryItem[] = [
  { name: "커플 기념티", base: 100, inbound: 40, outbound: 12, current: 128, lastUpdated: "2026-10-02 14:20" },
  { name: "인삼식품", base: 60, inbound: 40, outbound: 6, current: 94, lastUpdated: "2026-10-02 13:40" },
  { name: "골프공", base: 180, inbound: 40, outbound: 24, current: 196, lastUpdated: "2026-10-02 11:10" },
  { name: "스카프", base: 50, inbound: 40, outbound: 8, current: 82, lastUpdated: "2026-10-02 10:30" },
];

const defaultHistory: InventoryHistory[] = [
  { date: "2026-10-02 14:20", type: "출고", item: "커플 기념티", quantity: -12, stockAfter: 128, reason: "허니문 고객 6커플 증정" },
  { date: "2026-10-02 13:40", type: "출고", item: "인삼식품", quantity: -6, stockAfter: 84, reason: "효도여행 고객 웰컴 선물" },
  { date: "2026-10-02 11:10", type: "출고", item: "골프공", quantity: -24, stockAfter: 216, reason: "골프여행 단체 고객 증정" },
  { date: "2026-10-02 10:30", type: "출고", item: "스카프", quantity: -8, stockAfter: 62, reason: "문화탐방 고객 기념품 지급" },
  { date: "2026-10-01 16:00", type: "입고", item: "스카프", quantity: 20, stockAfter: 70, reason: "가을 시즌 기념품 추가 매입" },
  { date: "2026-10-01 14:30", type: "입고", item: "골프공", quantity: 60, stockAfter: 240, reason: "골프여행 프로모션 물량 확보" },
  { date: "2026-10-01 11:00", type: "입고", item: "인삼식품", quantity: 30, stockAfter: 90, reason: "공급업체 정기 납품" },
  { date: "2026-10-01 09:30", type: "입고", item: "커플 기념티", quantity: 40, stockAfter: 140, reason: "허니문 행사 물량 추가 발주" },
];

const historyColumns =
  "grid-cols-[130px_54px_105px_60px_90px_minmax(0,1fr)]";

function formatNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminInventoryManagement({
  onNavigate,
  adminName,
  onLogout,
}: {
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<InventoryItem[]>(defaultInventory);
  const [history, setHistory] = useState<InventoryHistory[]>(defaultHistory);
  const [creating, setCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(() => new Set());

  // 입출고 상태
  const [movement, setMovement] = useState<"입고" | "출고">("출고");
  const [selectedItem, setSelectedItem] = useState("커플 기념티");
  const [quantity, setQuantity] = useState("2");
  const [reason, setReason] = useState("10월 3일 출발 허니문 고객 1커플 증정");
  const [historyFilterItem, setHistoryFilterItem] = useState("전체 품목");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleAllItems = (checked: boolean) => {
    setSelectedItems(checked ? new Set(items.map((i) => i.name)) : new Set());
  };

  const toggleOneItem = (name: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  };

  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) return alert("삭제할 품목을 선택해 주세요.");
    if (confirm(`선택한 ${selectedItems.size}개 품목을 목록에서 삭제하시겠습니까?`)) {
      setItems((prev) => prev.filter((i) => !selectedItems.has(i.name)));
      setSelectedItems(new Set());
    }
  };

  // 기념품 등록
  if (creating) {
    return (
      <AdminShell active="inventory" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
        <main className="min-w-0 flex-1 p-4 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-5">
            <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">기념품 등록</h1>
            <button type="button" onClick={() => setCreating(false)} className={secondaryButton}>
              기념품 목록
            </button>
          </div>

          <div className="mb-5 flex h-[66px] items-center border border-[#dde4e8] bg-white px-[18px]">
            <strong className="font-['42dot_Sans:Bold'] text-sm font-bold text-[#17212b]">
              새로운 기념품의 품목 이름과 기초 재고를 입력해 주세요.
            </strong>
          </div>

          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") || "").trim();
              const base = Number(fd.get("base") || 0);

              if (!name) return alert("품목 이름을 입력해 주세요.");
              if (items.some((i) => i.name === name)) return alert("이미 등록된 품목 이름입니다.");

              const newItem: InventoryItem = {
                name,
                base,
                inbound: 0,
                outbound: 0,
                current: base,
                lastUpdated: formatNow(),
              };

              setItems([newItem, ...items]);
              setSelectedItem(newItem.name);
              setCreating(false);
            }}
          >
            <Panel title="기념품 기본 정보">
              <div className="grid md:grid-cols-2">
                <InfoField label="품목 이름 *">
                  <input name="name" placeholder="품목 이름을 입력해 주세요." className={fieldClass} required />
                </InfoField>
                <InfoField label="기초 재고 *">
                  <div className="relative w-full">
                    <input name="base" type="number" min="0" defaultValue="0" className={`${fieldClass} pr-9`} required />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#65717e]">개</span>
                  </div>
                </InfoField>
              </div>
            </Panel>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className={secondaryButton}>
                취소
              </button>
              <button type="submit" className={primaryButton}>
                기념품 등록
              </button>
            </div>
          </form>
        </main>
      </AdminShell>
    );
  }

  // 입출고 적용
  const applyMovement = (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(quantity);
    const target = items.find((i) => i.name === selectedItem);
    if (!target || amount <= 0) return setErrorMsg("수량은 1개 이상의 정수로 입력해 주세요.");

    const currentStock = target.base + target.inbound - target.outbound;
    if (movement === "출고" && amount > currentStock) {
      return setErrorMsg(`현재 재고 ${currentStock}개보다 많이 출고할 수 없습니다.`);
    }

    const signedAmount = movement === "입고" ? amount : -amount;
    const stockAfter = currentStock + signedAmount;
    const processedAt = formatNow();

    setItems((prev) =>
      prev.map((i) =>
        i.name === selectedItem
          ? {
              ...i,
              inbound: i.inbound + (movement === "입고" ? amount : 0),
              outbound: i.outbound + (movement === "출고" ? amount : 0),
              current: stockAfter,
              lastUpdated: processedAt,
            }
          : i,
      ),
    );

    setHistory((prev) => [
      {
        date: processedAt,
        type: movement,
        item: selectedItem,
        quantity: signedAmount,
        stockAfter,
        reason: reason || "사유 미입력",
      },
      ...prev,
    ]);

    setQuantity("1");
    setReason("");
    setErrorMsg("");
    alert(`${selectedItem} ${amount}개 ${movement} 처리가 완료되었습니다.`);
  };

  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const filteredHistory = history.filter(
    (h) => historyFilterItem === "전체 품목" || h.item === historyFilterItem,
  );

  return (
    <AdminShell active="inventory" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-5">
          <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">기념품 재고 관리</h1>
          <button type="button" onClick={() => setCreating(true)} className={primaryButton}>
            기념품 등록
          </button>
        </div>

        {/* 품목별 재고 테이블 */}
        <section className="mb-5 border border-[#dde4e8] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-[18px] py-3.5">
            <div>
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">품목별 재고</h2>
              <p className="mt-1 text-xs text-[#65717e]">
                전체 {items.length}건 · 선택 {selectedItems.size}건
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-[#65717e]">총 재고</span>
                <span className="font-medium text-[#65717e]">
                  {items.reduce((sum, i) => sum + i.base + i.inbound - i.outbound, 0)}
                </span>
                <span className="text-[#65717e]">개</span>
              </div>
              <button type="button" onClick={deleteSelectedItems} className={secondaryButton}>
                선택 삭제
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[840px] w-full">
              <div className="grid h-10 grid-cols-[40px_2fr_1fr_0.9fr_0.9fr_1.2fr_2fr] bg-[#c7e8ef]">
                <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                  <Checkbox checked={allSelected} onChange={toggleAllItems} />
                </div>
                {["품목", "기초 재고", "입고", "출고", "현재 재고", "최근 입출고 일시"].map((h) => (
                  <div
                    key={h}
                    className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 font-['42dot_Sans:Bold'] text-xs font-bold text-[#65717e]"
                  >
                    {h}
                  </div>
                ))}
              </div>

              {items.map((i) => (
                <div
                  key={i.name}
                  className={`grid h-[46px] grid-cols-[40px_2fr_1fr_0.9fr_0.9fr_1.2fr_2fr] ${
                    selectedItems.has(i.name) ? "bg-[#f1fafc]" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                    <Checkbox
                      checked={selectedItems.has(i.name)}
                      onChange={(checked) => toggleOneItem(i.name, checked)}
                    />
                  </div>
                  <div className="flex items-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#17212b]">
                    {i.name}
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#17212b]">
                    {i.base}
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#17212b]">
                    +{i.inbound}
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#17212b]">
                    −{i.outbound}
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#17212b]">
                    <span>{i.base + i.inbound - i.outbound}</span>
                    <span className="text-[#65717e] font-normal">개</span>
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#65717e]">
                    {i.lastUpdated}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* 입출고 내역*/}
          <section className="min-w-0 border border-[#dde4e8] bg-white">
            <div className="flex items-center justify-between px-[18px] py-3.5">
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">
                입출고 내역
              </h2>
              <div className="relative w-[130px]">
                <select
                  value={historyFilterItem}
                  onChange={(e) => setHistoryFilterItem(e.target.value)}
                  className={`${fieldClass} h-[38px] appearance-none pr-9 cursor-pointer`}
                >
                  <option value="전체 품목">전체 품목</option>
                  {items.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
                <img
                  src={assets.dropdown}
                  alt=""
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[620px]">
                <div className={`grid h-10 ${historyColumns} bg-[#c7e8ef]`}>
                  {["일시", "구분", "품목", "수량", "변동 후 재고", "사유"].map(
                    (header) => (
                      <div
                        key={header}
                        className={`flex items-center justify-center border-r border-y border-[#dde4e8] px-1.5 font-['42dot_Sans:Bold'] text-xs font-bold text-[#65717e] ${
                          header === "변동 후 재고" ? "whitespace-nowrap" : ""
                        }`}
                      >
                        {header}
                      </div>
                    ),
                  )}
                </div>

                {filteredHistory.map((entry, index) => (
                  <div
                    key={`${entry.date}-${entry.item}-${index}`}
                    className={`grid h-[46px] ${historyColumns} bg-white text-xs`}
                  >
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-[#65717e]">
                      {entry.date}
                    </div>
                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">
                      <span className={`font-['42dot_Sans']`}>
                        {entry.type}
                      </span>
                    </div>
                    <div className="flex items-center border-r border-b border-[#dde4e8] px-2.5 text-[#17212b]">
                      {entry.item}
                    </div>
                    <div className={`flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-[#17212b]`}>
                      {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                    </div>

                    <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 whitespace-nowrap text-[#17212b]">
                      {entry.stockAfter}개
                    </div>
                    <div className="flex items-center border-b border-[#dde4e8] px-2.5 text-[#65717e]">
                      {entry.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 입출고 내역 페이지 넘기기 */}
            <div className="flex justify-center gap-1.5 p-[18px]">
              {["‹", "1", "2", "3", "›"].map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`size-7 border text-xs cursor-pointer ${
                    page === "1"
                      ? "border-[#1596b4] bg-[#1596b4] text-white"
                      : "border-[#dde4e8] bg-white text-[#65717e]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </section>

          {/* 입출고 등록 */}
          <form
            onSubmit={applyMovement}
            className="flex flex-col justify-between border border-[#dde4e8] bg-white shadow-sm"
          >
            <div>
              <div className="border-b border-[#dde4e8] px-[18px] py-3.5">
                <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">
                  입출고 등록
                </h2>
              </div>
              <div className="space-y-[14px] p-[18px]">
                <div>
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">
                    구분
                  </span>
                  <div className="flex gap-[18px] text-[13px]">
                    <label className="flex items-center gap-[7px] cursor-pointer font-bold">
                      <input
                        type="radio"
                        checked={movement === "출고"}
                        onChange={() => setMovement("출고")}
                        className="accent-[#1596b4]"
                      />
                      출고
                    </label>
                    <label className="flex items-center gap-[7px] cursor-pointer font-bold">
                      <input
                        type="radio"
                        checked={movement === "입고"}
                        onChange={() => setMovement("입고")}
                        className="accent-[#1596b4]"
                      />
                      입고
                    </label>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">
                    품목
                  </span>
                  <div className="relative">
                    <select
                      value={selectedItem}
                      onChange={(event) => setSelectedItem(event.target.value)}
                      className={`${fieldClass} h-[38px] appearance-none pr-9 cursor-pointer`}
                    >
                      {items.map((item) => (
                        <option key={item.name} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                    <img
                      src={assets.dropdown}
                      alt=""
                      className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">
                    수량
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(event) => {
                        setQuantity(event.target.value);
                        setErrorMsg("");
                      }}
                      className={`${fieldClass} h-[38px] pr-9`}
                      required
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-[#65717e]">
                      개
                    </span>
                  </div>
                  {errorMsg && (
                    <span className="mt-1 block text-[11px] text-[#ba4f4f]">
                      {errorMsg}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">
                    사유
                  </span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="사유를 입력하세요"
                    className="h-[72px] w-full resize-none rounded-md border border-[#c8d2d8] p-3 text-[13px] leading-[1.5] outline-none focus:border-[#1596b4]"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#dde4e8] px-[18px] pt-3 pb-4">
              <button
                type="button"
                onClick={() => {
                  setQuantity("1");
                  setReason("");
                  setErrorMsg("");
                }}
                className={secondaryButton}
              >
                초기화
              </button>
              <button type="submit" className={primaryButton}>
                적용
              </button>
            </div>
          </form>
        </div>
      </main>
    </AdminShell>
  );
}