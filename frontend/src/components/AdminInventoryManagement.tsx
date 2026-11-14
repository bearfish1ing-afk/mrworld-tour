import React, { useCallback, useEffect, useState, type FormEvent } from "react";
import { assets, type AdminSection } from "../types/admin";
import { AdminShell, Panel, InfoField, fieldClass, primaryButton, secondaryButton } from "./AdminCommon";
import { createItem, fetchItems, fetchStockHistory, receiveItem } from "../api/admin";
import { errorMessage } from "../api/client";
import { STOCK_CHANGE_LABEL, dateTime } from "../api/labels";
import type { Item, Page, StockHistory } from "../api/types";

const historyColumns = "grid-cols-[130px_80px_105px_60px_90px_minmax(0,1fr)]";
const HISTORY_PAGE_SIZE = 10;

export function AdminInventoryManagement({
  onNavigate,
  adminName,
  onLogout,
}: {
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<Page<StockHistory> | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyFilterItem, setHistoryFilterItem] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // 입고 등록 상태 (출고는 예약 시 자동 배정)
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const page = await fetchItems();
      setItems(page.content);
      setSelectedItemId((current) => (current === "" && page.content.length > 0 ? page.content[0].id : current));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const page = await fetchStockHistory({
        itemId: historyFilterItem === "" ? undefined : historyFilterItem,
        page: historyPage,
        size: HISTORY_PAGE_SIZE,
      });
      setHistory(page);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [historyFilterItem, historyPage]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const itemName = (id: number) => items.find((i) => i.id === id)?.itemName ?? `#${id}`;

  // 기념품 등록
  if (creating) {
    return (
      <AdminShell active="inventory" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
        <main className="min-w-0 flex-1 p-4 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-5">
            <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">기념품 등록</h1>
            <button type="button" onClick={() => setCreating(false)} className={secondaryButton}>기념품 목록</button>
          </div>

          <div className="mb-5 flex min-h-[66px] items-center border border-[#dde4e8] bg-white px-[18px] py-3">
            <strong className="font-['42dot_Sans:Bold'] text-sm font-bold text-[#17212b]">
              새로운 기념품의 품목 이름과 기초 재고를 입력해 주세요. 테마 기념품 4종은 서버가 자동으로 만들어요.
            </strong>
          </div>

          <form
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") || "").trim();
              const base = Number(fd.get("base") || 0);
              if (!name) {
                setFormError("품목 이름을 입력해 주세요.");
                return;
              }
              setSaving(true);
              try {
                const created = await createItem(name, base, "신규 물품 초기 입고");
                setCreating(false);
                setFormError("");
                setNotice(`'${created.itemName}' 품목을 등록했습니다.`);
                setSelectedItemId(created.id);
                await Promise.all([loadItems(), loadHistory()]);
              } catch (err) {
                setFormError(errorMessage(err));
              } finally {
                setSaving(false);
              }
            }}
          >
            <Panel title="기념품 기본 정보">
              <div className="grid md:grid-cols-2">
                <InfoField label="품목 이름 *">
                  <input name="name" placeholder="품목 이름을 입력해 주세요." maxLength={100} className={fieldClass} required />
                </InfoField>
                <InfoField label="기초 재고 *">
                  <div className="relative w-full">
                    <input name="base" type="number" min="0" defaultValue="0" className={`${fieldClass} pr-9`} required />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#65717e]">개</span>
                  </div>
                </InfoField>
              </div>
            </Panel>
            {formError && <p role="alert" className="mt-3 text-xs text-[#c33]">{formError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className={secondaryButton}>취소</button>
              <button type="submit" disabled={saving} className={`${primaryButton} disabled:opacity-60`}>기념품 등록</button>
            </div>
          </form>
        </main>
      </AdminShell>
    );
  }

  // 입고 적용
  const applyReceive = async (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(quantity);
    if (selectedItemId === "" || !Number.isInteger(amount) || amount <= 0) {
      setFormError("품목을 고르고, 수량은 1개 이상의 정수로 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const updated = await receiveItem(selectedItemId, amount, reason.trim());
      setQuantity("1");
      setReason("");
      setFormError("");
      setNotice(`${updated.itemName} ${amount}개 입고 완료 (현재 ${updated.currentAmount}개)`);
      setHistoryPage(0);
      await Promise.all([loadItems(), loadHistory()]);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const totalPages = history?.totalPages ?? 0;

  return (
    <AdminShell active="inventory" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-5">
          <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">기념품 재고 관리</h1>
          <button type="button" onClick={() => setCreating(true)} className={primaryButton}>기념품 등록</button>
        </div>

        {error && <p role="alert" className="mb-4 whitespace-pre-line border border-[#f0c8c8] bg-[#fdf0f0] px-4 py-3 text-xs text-[#c33]">{error}</p>}
        {notice && <p role="status" className="mb-4 border border-[#c7e8ef] bg-[#eaf7f9] px-4 py-3 text-xs text-[#17212b]">{notice}</p>}

        {/* 품목별 재고 */}
        <section className="mb-5 border border-[#dde4e8] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-[18px] py-3.5">
            <div>
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">품목별 재고</h2>
              <p className="mt-1 text-xs text-[#65717e]">전체 {items.length}건 · 예약하면 인원 수만큼 자동 배정, 취소하면 자동 복구</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2 text-sm text-[#65717e]">
                <span>총 재고</span>
                <span className="font-medium">{items.reduce((sum, i) => sum + i.currentAmount, 0)}</span>
                <span>개</span>
              </div>
              <button type="button" onClick={() => void Promise.all([loadItems(), loadHistory()])} className={secondaryButton}>새로고침</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[560px] w-full">
              <div className="grid h-10 grid-cols-[2fr_1fr_1.5fr] bg-[#c7e8ef]">
                {["품목", "현재 재고", "최근 변경 일시"].map((h) => (
                  <div key={h} className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 font-['42dot_Sans:Bold'] text-xs font-bold text-[#65717e]">{h}</div>
                ))}
              </div>
              {items.map((i) => (
                <div key={i.id} className="grid h-[46px] grid-cols-[2fr_1fr_1.5fr] bg-white">
                  <div className="flex items-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#17212b]">{i.itemName}</div>
                  <div className={`flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm ${i.currentAmount === 0 ? "text-[#c33]" : "text-[#17212b]"}`}>
                    {i.currentAmount}<span className="ml-0.5 text-[#65717e] font-normal">개</span>
                  </div>
                  <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-3 text-sm text-[#65717e]">{dateTime(i.updatedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* 입출고 내역 */}
          <section className="min-w-0 border border-[#dde4e8] bg-white">
            <div className="flex items-center justify-between px-[18px] py-3.5">
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">입출고 내역</h2>
              <div className="relative w-[150px]">
                <select
                  value={historyFilterItem}
                  onChange={(e) => {
                    setHistoryFilterItem(e.target.value === "" ? "" : Number(e.target.value));
                    setHistoryPage(0);
                  }}
                  className={`${fieldClass} h-[38px] appearance-none pr-9 cursor-pointer`}
                >
                  <option value="">전체 품목</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.itemName}</option>
                  ))}
                </select>
                <img src={assets.dropdown} alt="" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className={`grid h-10 ${historyColumns} bg-[#c7e8ef]`}>
                  {["일시", "구분", "품목", "수량", "변동 후 재고", "사유"].map((header) => (
                    <div key={header} className="flex items-center justify-center border-r border-y border-[#dde4e8] px-1.5 font-['42dot_Sans:Bold'] text-xs font-bold text-[#65717e] whitespace-nowrap">
                      {header}
                    </div>
                  ))}
                </div>
                {history && history.content.length === 0 && (
                  <p className="p-6 text-center text-xs text-[#65717e]">입출고 내역이 없습니다.</p>
                )}
                {history?.content.map((entry) => {
                  const signed = entry.type === "ALLOCATE" ? -entry.quantity : entry.quantity;
                  return (
                    <div key={entry.id} className={`grid min-h-[46px] ${historyColumns} bg-white text-xs`}>
                      <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-[#65717e]">{dateTime(entry.createdAt)}</div>
                      <div className="flex items-center justify-center border-r border-b border-[#dde4e8]">{STOCK_CHANGE_LABEL[entry.type] ?? entry.type}</div>
                      <div className="flex items-center border-r border-b border-[#dde4e8] px-2.5 text-[#17212b]">{itemName(entry.itemId)}</div>
                      <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 text-[#17212b]">{signed > 0 ? `+${signed}` : signed}</div>
                      <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 whitespace-nowrap text-[#17212b]">{entry.stockAfter}개</div>
                      <div className="flex items-center border-b border-[#dde4e8] px-2.5 text-[#65717e]">
                        {entry.reason || "-"}{entry.reservationId ? ` (예약 #${entry.reservationId})` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 p-[18px]">
                <button type="button" disabled={historyPage === 0} onClick={() => setHistoryPage((p) => p - 1)} className="size-7 border border-[#dde4e8] bg-white text-xs text-[#65717e] disabled:opacity-40">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i).slice(Math.max(0, historyPage - 2), historyPage + 3).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setHistoryPage(page)}
                    className={`size-7 border text-xs cursor-pointer ${page === historyPage ? "border-[#1596b4] bg-[#1596b4] text-white" : "border-[#dde4e8] bg-white text-[#65717e]"}`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button type="button" disabled={historyPage >= totalPages - 1} onClick={() => setHistoryPage((p) => p + 1)} className="size-7 border border-[#dde4e8] bg-white text-xs text-[#65717e] disabled:opacity-40">›</button>
              </div>
            )}
          </section>

          {/* 입고 등록 */}
          <form onSubmit={applyReceive} className="flex flex-col justify-between border border-[#dde4e8] bg-white shadow-sm">
            <div>
              <div className="border-b border-[#dde4e8] px-[18px] py-3.5">
                <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">입고 등록</h2>
                <p className="mt-1 text-[11px] text-[#65717e]">출고는 예약할 때 자동으로 배정돼요.</p>
              </div>
              <div className="space-y-[14px] p-[18px]">
                <label className="block">
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">품목</span>
                  <div className="relative">
                    <select
                      value={selectedItemId}
                      onChange={(event) => setSelectedItemId(Number(event.target.value))}
                      className={`${fieldClass} h-[38px] appearance-none pr-9 cursor-pointer`}
                    >
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>{item.itemName} (현재 {item.currentAmount}개)</option>
                      ))}
                    </select>
                    <img src={assets.dropdown} alt="" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">수량</span>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(event) => {
                        setQuantity(event.target.value);
                        setFormError("");
                      }}
                      className={`${fieldClass} h-[38px] pr-9`}
                      required
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-[#65717e]">개</span>
                  </div>
                  {formError && <span className="mt-1 block text-[11px] text-[#ba4f4f]">{formError}</span>}
                </label>
                <label className="block">
                  <span className="mb-[7px] block font-['42dot_Sans:Bold'] text-[13px] font-bold">사유</span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    maxLength={255}
                    placeholder="예: 공급업체 정기 납품"
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
                  setFormError("");
                }}
                className={secondaryButton}
              >
                초기화
              </button>
              <button type="submit" disabled={saving} className={`${primaryButton} disabled:opacity-60`}>입고 적용</button>
            </div>
          </form>
        </div>
      </main>
    </AdminShell>
  );
}
