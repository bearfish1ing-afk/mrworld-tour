import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { assets, type AdminSection } from "../types/admin";
import { AdminShell, SelectField, primaryButton, secondaryButton } from "./AdminCommon";
import {
  changeReservation,
  changeReservationStatus,
  fetchProductDetail,
  fetchReservation,
  fetchReservations,
  saveReservationMemo,
} from "../api/admin";
import { errorMessage } from "../api/client";
import { GRADE_LABEL, RESERVATION_STATUS_LABEL, allowedByMinGrade, dateTime, won } from "../api/labels";
import type {
  OptionResponse,
  ProductDetail,
  ReservationDetail,
  ReservationStatus,
  ReservationSummary,
} from "../api/types";

function DetailCard({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-[#dde4e8] bg-white shadow-[0_4px_14px_-3px_rgba(16,42,51,0.06)] ${className}`}>
      <h2 className="border-b border-[#dde4e8] p-[18px] font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">{title}</h2>
      {children}
    </section>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-h-12 grid-cols-[108px_minmax(0,1fr)] border-b border-[#dde4e8]">
      <div className="flex items-center border-r border-[#dde4e8] bg-[#f8fafb] px-3.5 text-xs text-[#65717e]">{label}</div>
      <div className="flex min-w-0 items-center px-3.5 py-2 text-[13px] text-[#17212b]">{children}</div>
    </div>
  );
}

function OptionSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: number | "";
  options: Array<{ id: number; label: string }>;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 w-full appearance-none bg-transparent pr-6 text-center text-[13px] outline-none cursor-pointer disabled:cursor-not-allowed disabled:text-[#8b96a3]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
      <img src={assets.dropdown} alt="" className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2" />
    </div>
  );
}

export function AdminReservationManagement({
  onNavigate,
  adminName,
  onLogout,
}: {
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
}) {
  const [list, setList] = useState<ReservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ReservationStatus>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await fetchReservations({ status: statusFilter || undefined });
      setList(page.content);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  if (selectedId !== null) {
    return (
      <ReservationDetailView
        reservationId={selectedId}
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBack={() => {
          setSelectedId(null);
          void load();
        }}
      />
    );
  }

  return (
    <AdminShell active="reservations" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b] mb-5">예약 관리</h1>
        {error && (
          <p role="alert" className="mb-4 whitespace-pre-line border border-[#f0c8c8] bg-[#fdf0f0] px-4 py-3 text-xs text-[#c33]">{error}</p>
        )}
        <section className="border border-[#dde4e8] bg-white">
          <div className="p-[18px] border-b border-[#dde4e8] flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">전체 예약자 목록</h2>
              <p className="mt-1 text-xs text-[#65717e]">{loading ? "불러오는 중..." : `전체 ${list.length}건`}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[140px]">
                <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | ReservationStatus)}>
                  <option value="">전체 상태</option>
                  {(Object.keys(RESERVATION_STATUS_LABEL) as ReservationStatus[]).map((s) => (
                    <option key={s} value={s}>{RESERVATION_STATUS_LABEL[s]}</option>
                  ))}
                </SelectField>
              </div>
              <button type="button" onClick={() => void load()} className={secondaryButton}>새로고침</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-[#c7e8ef] text-[#65717e] font-bold">
                <tr className="border-b border-[#dde4e8]">
                  {["예약코드", "상품명", "출발일", "예약자", "연락처", "인원", "투어 등급", "결제금액", "상태", "관리"].map((h) => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && list.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#65717e]">예약이 없습니다.</td>
                  </tr>
                )}
                {list.map((r) => (
                  <tr key={r.reservationId} className="border-b border-[#dde4e8] hover:bg-[#f1fafc]">
                    <td className="p-3">{r.reservationCode}</td>
                    <td className="p-3">{r.productTitle ?? "-"}</td>
                    <td className="p-3">{r.departureDate ?? "-"}</td>
                    <td className="p-3">{r.customerName ?? "-"}</td>
                    <td className="p-3">{r.customerPhone ?? "-"}</td>
                    <td className="p-3">{r.people}명</td>
                    <td className="p-3">{r.grade ?? "-"}</td>
                    <td className="p-3">{won(r.finalAmount)}</td>
                    <td className="p-3">{RESERVATION_STATUS_LABEL[r.status] ?? r.status}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.reservationId)}
                        className="rounded border border-[#c8d2d8] bg-white px-2.5 py-1 text-xs hover:bg-[#f8fafb]"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminShell>
  );
}

type Draft = {
  gradeId: number;
  hotelId: number;
  mealId: number;
  vehicleId: number;
  drinkIds: number[]; // 고객이 추가한 음료
};

function ReservationDetailView({
  reservationId,
  adminName,
  onNavigate,
  onLogout,
  onBack,
}: {
  reservationId: number;
  adminName: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<ReservationDetail | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // 예약 상세 → 현재 선택값(초안) 만들기
  const toDraft = (res: ReservationDetail, prod: ProductDetail): Draft => {
    const pick = (type: string) => res.options.find((o) => o.type === type)?.productOptionId ?? 0;
    return {
      gradeId: pick("GRADE"),
      hotelId: pick("HOTEL"),
      mealId: pick("MEAL"),
      vehicleId: pick("VEHICLE") || prod.defaultVehicleOptionId || 0,
      drinkIds: res.options
        .filter((o) => o.type === "DRINK" && !o.isDefault && o.productOptionId)
        .map((o) => o.productOptionId as number),
    };
  };

  const load = useCallback(async () => {
    try {
      const res = await fetchReservation(reservationId);
      const prod = await fetchProductDetail(res.summary.productId);
      setDetail(res);
      setProduct(prod);
      setDraft(toDraft(res, prod));
      setMemo(res.adminMemo ?? "");
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [reservationId]);

  useEffect(() => {
    void load();
  }, [load]);

  // 테마 최소 등급보다 낮은 호텔/식사는 목록에서 제외 (이미 그렇게 저장된 예약은 현재 값만 남겨 둠)
  const minGrade = product?.product.theme?.minGrade;
  const optionsOf = (type: string, keepId?: number): OptionResponse[] =>
    product?.options.filter(
      (o) => o.optionType === type && (allowedByMinGrade(o, minGrade) || o.id === keepId),
    ) ?? [];
  const selectedGrade = product?.grades.find((g) => g.id === draft?.gradeId);
  const canceled = detail?.summary.status === "CANCELED";

  const changed = useMemo(() => {
    if (!detail || !product || !draft) return false;
    const original = toDraft(detail, product);
    return JSON.stringify(original) !== JSON.stringify(draft);
  }, [detail, product, draft]);

  const run = async (action: () => Promise<string | void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const message = await action();
      if (message) setNotice(message);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // 등급을 바꾸면 숙소/식사는 새 등급의 기본값으로
  const changeGrade = (gradeId: number) => {
    const grade = product?.grades.find((g) => g.id === gradeId);
    if (!grade || !draft) return;
    setDraft({
      ...draft,
      gradeId,
      hotelId: grade.defaultHotelOptionId ?? draft.hotelId,
      mealId: grade.defaultMealOptionId ?? draft.mealId,
      drinkIds: draft.drinkIds.filter((id) => id !== grade.defaultDrinkOptionId),
    });
  };

  const toggleDrink = (id: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      drinkIds: draft.drinkIds.includes(id) ? draft.drinkIds.filter((d) => d !== id) : [...draft.drinkIds, id],
    });
  };

  const saveOptions = () =>
    run(async () => {
      if (!draft || !detail) return;
      await changeReservation(reservationId, {
        productGradeId: draft.gradeId,
        hotelOptionId: draft.hotelId,
        mealOptionId: draft.mealId,
        vehicleOptionId: draft.vehicleId || null,
        drinks: draft.drinkIds.map((optionId) => ({ optionId, quantity: detail.summary.people })),
      });
      return "변경 사항을 저장했습니다. 금액이 다시 계산되었습니다.";
    });

  const changeStatus = (status: ReservationStatus) => {
    if (status === "CANCELED" && !confirm("이 예약을 취소할까요? 배정된 기념품은 재고로 돌아갑니다.")) return;
    void run(async () => {
      await changeReservationStatus(reservationId, status);
      return `예약 상태를 '${RESERVATION_STATUS_LABEL[status]}'(으)로 변경했습니다.`;
    });
  };

  const saveMemo = () =>
    run(async () => {
      await saveReservationMemo(reservationId, memo);
      return "관리자 메모를 저장했습니다.";
    });

  const summary = detail?.summary;
  const people = summary?.people ?? 0;
  const souvenirShort = detail ? detail.souvenirQuantity < people && Boolean(detail.souvenirName) : false;

  return (
    <AdminShell active="reservations" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="mb-1.5 text-[11px] text-[#8b96a3]">관리자&nbsp;&nbsp;/&nbsp;&nbsp;예약 관리&nbsp;&nbsp;/&nbsp;&nbsp;상세 예약 관리</p>
              <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">상세 예약 관리</h1>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onBack} className={`${secondaryButton} flex items-center gap-[7px]`}>
                <img src={assets.arrowLeft} alt="" />
                예약자 목록
              </button>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 whitespace-pre-line border border-[#f0c8c8] bg-[#fdf0f0] px-4 py-3 text-xs text-[#c33]">{error}</p>}
        {notice && <p role="status" className="mb-4 border border-[#c7e8ef] bg-[#eaf7f9] px-4 py-3 text-xs text-[#17212b]">{notice}</p>}

        {!detail || !summary || !product || !draft ? (
          !error && <p className="text-xs text-[#65717e]">불러오는 중...</p>
        ) : (
          <>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_384px]">
              <div className="grid gap-5">
                <DetailCard title="예약자 정보">
                  <div className="grid md:grid-cols-2">
                    <DetailField label="예약번호">{summary.reservationCode}</DetailField>
                    <DetailField label="예약자">{summary.customerName ?? "-"}</DetailField>
                    <DetailField label="연락처">{summary.customerPhone ?? "-"}</DetailField>
                    <DetailField label="예약일시">{dateTime(summary.reservedAt)}</DetailField>
                    <DetailField label="인원">{people}명</DetailField>
                    <DetailField label="상태">
                      <div className="w-full max-w-[160px]">
                        <SelectField value={summary.status} onChange={(e) => changeStatus(e.target.value as ReservationStatus)}>
                          {(Object.keys(RESERVATION_STATUS_LABEL) as ReservationStatus[]).map((s) => (
                            <option key={s} value={s} disabled={canceled && s !== "CANCELED"}>{RESERVATION_STATUS_LABEL[s]}</option>
                          ))}
                        </SelectField>
                      </div>
                    </DetailField>
                  </div>
                </DetailCard>

                <DetailCard title="상품 및 선택 옵션" className="overflow-x-auto">
                  <DetailField label="상품">{summary.productTitle ?? "-"}</DetailField>
                  <DetailField label="일정">{summary.departureDate} ~ {summary.returnDate}</DetailField>

                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-5 bg-[#c7e8ef]">
                      {["투어 등급", "숙소", "식사", "차량", "추가 음료"].map((header) => (
                        <div key={header} className="border-r border-b border-[#dde4e8] px-2 py-2.5 text-center font-['42dot_Sans:Bold'] text-[11px] font-bold text-[#65717e]">
                          {header}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5">
                      <div className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 py-3.5">
                        <OptionSelect
                          value={draft.gradeId}
                          disabled={canceled}
                          options={product.grades.map((g) => ({ id: g.id, label: GRADE_LABEL[g.grade] ?? g.grade }))}
                          onChange={changeGrade}
                        />
                      </div>
                      {(["HOTEL", "MEAL", "VEHICLE"] as const).map((type) => {
                        const key = type === "HOTEL" ? "hotelId" : type === "MEAL" ? "mealId" : "vehicleId";
                        return (
                          <div key={type} className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 py-3.5">
                            <OptionSelect
                              value={draft[key]}
                              disabled={canceled}
                              options={optionsOf(type, draft[key]).map((o) => ({ id: o.id, label: o.optionName }))}
                              onChange={(id) => setDraft({ ...draft, [key]: id })}
                            />
                          </div>
                        );
                      })}
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-r border-b border-[#dde4e8] px-2 py-3.5">
                        {optionsOf("DRINK").length === 0 && <span className="text-xs text-[#8b96a3]">없음</span>}
                        {optionsOf("DRINK").map((drink) => {
                          const included = selectedGrade?.defaultDrinkOptionId === drink.id;
                          return (
                            <label key={drink.id} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={included || draft.drinkIds.includes(drink.id)}
                                disabled={included || canceled}
                                onChange={() => toggleDrink(drink.id)}
                                className="size-3.5 accent-[#1596b4]"
                              />
                              <span className="text-[#17212b]">{drink.optionName}{included ? " (기본)" : ""}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="px-[18px] pt-2 text-[11px] text-[#65717e]">
                    등급을 바꾸면 숙소·식사가 새 등급 기본값으로 바뀌어요. 추가 음료는 인원 수({people}잔)만큼 주문돼요.
                  </p>

                  <div className="flex items-center gap-3 p-[18px]">
                    <strong className="font-['42dot_Sans:Bold'] text-[13px] font-bold">기념품</strong>
                    <span className="text-[13px]">
                      {detail.souvenirName ? `${detail.souvenirName} ${detail.souvenirQuantity}개 배정` : "없음"}
                    </span>
                    {souvenirShort && (
                      <span className="text-[11px] text-[#c33]">재고 부족 {people - detail.souvenirQuantity}개 (기념품 재고에서 입고하세요)</span>
                    )}
                  </div>
                </DetailCard>
              </div>

              <DetailCard title="결제 정보">
                <DetailField label="결제 수단">
                  <span className="text-xs text-[#17212b]">{detail.paymentMethod ?? "-"}</span>
                </DetailField>
                <div className="px-[18px] pt-1.5 pb-[18px]">
                  <div className="flex justify-between text-[13px]">
                    <span>인원수 x 기본 상품 금액</span>
                    <span className="text-sm">{won(detail.baseAmount)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#65717e]">{people}명 × {won(detail.baseAmount / Math.max(people, 1))}</p>
                  <div className="my-2 h-px bg-[#dde4e8]" />
                  <div className="flex justify-between text-[13px]">
                    <span>옵션 추가 금액</span>
                    <span className="text-sm">{detail.optionAmount >= 0 ? "+" : ""}{won(detail.optionAmount)}</span>
                  </div>
                  <div className="my-2 grid gap-[5px] bg-[#f8fafb] p-2.5 text-[11px]">
                    {detail.options.map((o, i) => (
                      <div key={`${o.type}-${o.productOptionId}-${i}`} className="flex justify-between gap-2">
                        <span className="text-[#65717e]">
                          {{ GRADE: "투어 등급", HOTEL: "숙소", MEAL: "식사", VEHICLE: "차량", DRINK: "음료", ETC: "기타" }[o.type]} | {o.name} × {o.quantity}
                        </span>
                        <span>{o.isDefault && o.amount === 0 ? "기본 포함" : won(o.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span>단골 등급 할인</span>
                    <span className="text-sm">−{won(detail.discountAmount)}</span>
                  </div>
                  <div className="mt-2 bg-[#eaf7f9] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">최종 결제금액</span>
                      <span className="text-sm font-bold">{won(summary.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </DetailCard>
            </div>

            <div className="mt-5">
              <DetailCard title="관리자 메모">
                <div className="p-3.5">
                  <label className="block">
                    <span className="text-sm">관리자 메모</span>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      maxLength={1000}
                      placeholder="고객 요청사항이나 특이사항 등 관리자 메모를 입력해 주세요."
                      className="mt-2 min-h-24 w-full resize-y rounded-md border border-[#c8d2d8] p-3 text-xs outline-none placeholder:text-[#8b96a3] focus:border-[#1596b4]"
                    />
                    <button type="button" disabled={busy} onClick={() => void saveMemo()} className={`${secondaryButton} mt-2 disabled:opacity-60`}>
                      메모 저장
                    </button>
                  </label>
                </div>
              </DetailCard>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button type="button" disabled={busy || canceled} onClick={() => changeStatus("CANCELED")} className={`${secondaryButton} disabled:opacity-60`}>
                  예약 취소
                </button>
                <span className="text-[11px] text-[#17212b]">
                  {canceled ? "취소된 예약은 변경할 수 없습니다." : changed ? "저장하지 않은 변경 사항이 있습니다." : "저장된 상태입니다."}
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onBack} className={secondaryButton}>목록으로</button>
                <button type="button" disabled={busy || !changed || canceled} onClick={() => void saveOptions()} className={`${primaryButton} disabled:opacity-60`}>
                  변경 사항 저장
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </AdminShell>
  );
}
