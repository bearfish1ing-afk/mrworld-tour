import React, { useState, type ReactNode } from "react";
import { assets, type Reservation, type AdminSection } from "../types/admin";
import {
  AdminShell,
  primaryButton,
  secondaryButton,
  fieldClass,
} from "./AdminCommon";

// 확인용 임의 데이터
const defaultReservations: Reservation[] = [
  {
    id: "res-1",
    code: "MW-20261002-001",
    product: "몰디브 아일랜드 허니문 6일",
    schedule: "2026-10-15 ~ 2026-10-20",
    customer: "김민수",
    phone: "010-1234-5678",
    people: 2,
    grade: "프리미엄",
    hotel: "5등급 호텔",
    meal: "고급 레스토랑",
    drink: "샴페인",
    souvenir: "커플 기념티",
    amount: "7,980,000",
    status: "확정",
    bookedAt: "2026-10-02 11:30",
  },
  {
    id: "res-2",
    code: "MW-20261002-002",
    product: "일본 규슈 온천 효도여행 4일",
    schedule: "2026-10-22 ~ 2026-10-25",
    customer: "박영희",
    phone: "010-9876-5432",
    people: 4,
    grade: "클래식",
    hotel: "4등급 호텔",
    meal: "현지식 레스토랑",
    drink: "커피",
    souvenir: "인삼식품",
    amount: "5,160,000",
    status: "확정 대기",
    bookedAt: "2026-10-02 13:10",
  },
];

function DetailCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border border-[#dde4e8] bg-white shadow-[0_4px_14px_-3px_rgba(16,42,51,0.06)] ${className}`}
    >
      <h2 className="border-b border-[#dde4e8] p-[18px] font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-12 grid-cols-[108px_minmax(0,1fr)] border-b border-[#dde4e8]">
      <div className="flex items-center border-r border-[#dde4e8] bg-[#f8fafb] px-3.5 text-xs text-[#65717e]">
        {label}
      </div>
      <div className="flex min-w-0 items-center px-3.5 py-2 text-[13px] text-[#17212b]">
        {children}
      </div>
    </div>
  );
}

function OptionSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full appearance-none bg-transparent pr-6 text-center text-[13px] outline-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <img
        src={assets.dropdown}
        alt=""
        className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
      />
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
  const [list, setList] = useState<Reservation[]>(defaultReservations);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // 상세 예약 관리
  if (selectedReservation) {
    return (
      <ReservationDetailView
        reservation={selectedReservation}
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBack={() => setSelectedReservation(null)}
        onSave={(updated) => {
          setList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setSelectedReservation(updated);
        }}
        onCancelReservation={(targetId) => {
          if (confirm("삭제하시겠습니까?")) {
            setList((prev) =>
              prev.map((r) => (r.id === targetId ? { ...r, status: "취소 완료" } : r)),
            );
            setSelectedReservation(null);
          }
        }}
      />
    );
  }

  return (
    <AdminShell active="reservations" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b] mb-5">예약 관리</h1>
        <section className="border border-[#dde4e8] bg-white">
          <div className="p-[18px] border-b border-[#dde4e8] flex justify-between items-center">
            <div>
              <h2 className="font-['42dot_Sans:Bold'] text-base font-bold">전체 예약자 목록</h2>
              <p className="mt-1 text-xs text-[#65717e]">전체 {list.length}건</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#c7e8ef] text-[#65717e] font-bold">
                <tr className="border-b border-[#dde4e8]">
                  <th className="p-3">예약코드</th>
                  <th className="p-3">상품명</th>
                  <th className="p-3">예약자</th>
                  <th className="p-3">연락처</th>
                  <th className="p-3">인원</th>
                  <th className="p-3">투어 등급</th>
                  <th className="p-3">결제금액</th>
                  <th className="p-3">상태</th>
                  <th className="p-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-[#dde4e8] hover:bg-[#f1fafc]">
                    <td className="p-3">{r.code}</td>
                    <td className="p-3">{r.product}</td>
                    <td className="p-3">{r.customer}</td>
                    <td className="p-3">{r.phone}</td>
                    <td className="p-3">{r.people}명</td>
                    <td className="p-3">{r.grade}</td>
                    <td className="p-3">{r.amount}원</td>
                    <td className="p-3">
                      <span className="text-[#17212b]">{r.status}</span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedReservation(r)}
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

function ReservationDetailView({
  reservation,
  adminName,
  onNavigate,
  onLogout,
  onBack,
  onSave,
  onCancelReservation,
}: {
  reservation: Reservation;
  adminName: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  onBack: () => void;
  onSave: (reservation: Reservation) => void;
  onCancelReservation: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Reservation>(reservation);
  const [saved, setSaved] = useState(false);

  const currentDrinks =
    draft.drink && draft.drink !== "선택 안 함"
      ? draft.drink.split(",").map((d) => d.trim()).filter(Boolean)
      : [];

  const singleOptionFields: {
    key: "grade" | "hotel" | "meal";
    label: string;
    value: string;
    options: string[];
  }[] = [
    {
      key: "grade",
      label: "투어 등급",
      value: draft.grade,
      options: ["클래식", "그랜드", "프리미엄"],
    },
    {
      key: "hotel",
      label: "숙소",
      value: draft.hotel,
      options: ["3등급 호텔", "4등급 호텔", "5등급 호텔"],
    },
    {
      key: "meal",
      label: "식사",
      value: draft.meal,
      options: ["도시락", "현지식 레스토랑", "고급 레스토랑"],
    },
  ];

  const updateSingleOption = (
    key: "grade" | "hotel" | "meal" | "souvenir",
    value: string,
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleToggleDrink = (drinkName: "샴페인" | "커피") => {
    const nextDrinks = currentDrinks.includes(drinkName)
      ? currentDrinks.filter((d) => d !== drinkName)
      : [...currentDrinks, drinkName];

    const updatedDrinkString =
      nextDrinks.length > 0 ? nextDrinks.join(", ") : "선택 안 함";

    setDraft((current) => ({
      ...current,
      drink: updatedDrinkString,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
  };

  // 추가음료 -> 추가금계산
  const drinkPrice = currentDrinks.reduce((acc, cur) => {
    if (cur === "샴페인") return acc + 70000;
    if (cur === "커피") return acc + 30000;
    return acc;
  }, 0);

  return (
    <AdminShell active="reservations" adminName={adminName} onNavigate={onNavigate} onLogout={onLogout}>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="mb-1.5 text-[11px] text-[#8b96a3]">
                관리자&nbsp;&nbsp;/&nbsp;&nbsp;예약 관리&nbsp;&nbsp;/&nbsp;&nbsp;상세 예약 관리
              </p>
              <h1 className="text-[28px] tracking-[-0.42px] text-[#17212b]">
                상세 예약 관리
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className={`${secondaryButton} flex items-center gap-[7px]`}
              >
                <img src={assets.arrowLeft} alt="" />
                예약자 목록
              </button>
              <button
                type="button"
                onClick={() => alert(`${draft.customer}님(${draft.phone})에게 안내 문자가 발송되었습니다.`)}
                className={primaryButton}
              >
                안내 문자 발송
              </button>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_384px]">
          <div className="grid gap-5">
            <DetailCard title="예약자 정보">
              <div className="grid md:grid-cols-2">
                <DetailField label="예약번호">{draft.code}</DetailField>
                <DetailField label="예약자">{draft.customer}</DetailField>
                <DetailField label="연락처">{draft.phone}</DetailField>
                <DetailField label="예약일시">{draft.bookedAt}</DetailField>
                <DetailField label="인원">{draft.people}명</DetailField>
                <DetailField label="상태">
                  <div className="relative w-full max-w-[160px]">
                    <select
                      value={draft.status}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        const updated = {
                          ...draft,
                          status: nextStatus,
                        };
                        setDraft(updated);
                        onSave(updated);
                        setSaved(true);
                      }}
                      className={`h-9 w-full appearance-none rounded border px-3 pr-8 text-xs outline-none cursor-pointer ${
                        draft.status === "확정"
                          ? "border-[#c8d2d8] bg-white text-[#17212b]"
                          : draft.status === "취소 완료"
                          ? "border-[#c8d2d8] bg-white text-[#17212b]"
                          : "border-[#c8d2d8] bg-white text-[#17212b]"
                      }`}
                    >
                      <option value="확정 대기">확정 대기</option>
                      <option value="확정">확정</option>
                      <option value="취소 완료">취소 완료</option>
                    </select>
                    <img
                      src={assets.dropdown}
                      alt=""
                      className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-70"
                    />
                  </div>
                </DetailField>
              </div>
            </DetailCard>

            <DetailCard title="상품 및 선택 옵션" className="overflow-x-auto">
              <DetailField label="상품">{draft.product}</DetailField>
              <DetailField label="일정">{draft.schedule}</DetailField>
              
              <div className="min-w-[620px]">
                <div className="grid grid-cols-4 bg-[#c7e8ef]">
                  {["투어 등급", "숙소", "식사", "추가 음료"].map((header) => (
                    <div
                      key={header}
                      className="border-r border-b border-[#dde4e8] px-2 py-2.5 text-center font-['42dot_Sans:Bold'] text-[11px] font-bold text-[#65717e]"
                    >
                      {header}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4">
                  {singleOptionFields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-center border-r border-b border-[#dde4e8] px-2 py-3.5"
                    >
                      <OptionSelect
                        value={field.value}
                        options={field.options}
                        onChange={(value) => updateSingleOption(field.key, value)}
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-center gap-3 border-r border-b border-[#dde4e8] px-2 py-3.5">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentDrinks.includes("샴페인")}
                        onChange={() => handleToggleDrink("샴페인")}
                        className="size-3.5 accent-[#1596b4]"
                      />
                      <span className="text-[#17212b]">샴페인</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentDrinks.includes("커피")}
                        onChange={() => handleToggleDrink("커피")}
                        className="size-3.5 accent-[#1596b4]"
                      />
                      <span className="text-[#17212b]">커피</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-[18px]">
                <strong className="font-['42dot_Sans:Bold'] text-[13px] font-bold">
                  기념품
                </strong>
                <div className="relative flex-1">
                  <select
                    value={draft.souvenir}
                    onChange={(event) => updateSingleOption("souvenir", event.target.value)}
                    className={`${fieldClass} min-h-[38px] appearance-none pr-9 cursor-pointer`}
                  >
                    {["미지정", "커플 기념티", "인삼식품", "골프공", "스카프"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <img
                    src={assets.dropdown}
                    alt=""
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  />
                </div>
              </div>
            </DetailCard>
          </div>

          {/* 결제 정보(더미 데이터) */}
          <DetailCard title="결제 정보">
            <DetailField label="결제 수단">
              <span className="text-xs text-[#17212b]">
                신용카드 / 간편결제
              </span>
            </DetailField>
            <div className="px-[18px] pt-1.5 pb-[18px]">
              <div className="flex justify-between text-[13px]">
                <span>인원수 x 기본 상품 금액</span>
                <span className="text-sm text=[#17212b]">
                  3,000,000원
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#65717e]">
                {draft.people}명 × 1,500,000원
              </p>
              <div className="my-2 h-px bg-[#dde4e8]" />
              <div className="flex justify-between text-[13px]">
                <span>옵션 추가 금액</span>
                <span className="text-sm text=[#17212b]">
                  +{((draft.grade === "그랜드" ? 600000 : 300000) + drinkPrice).toLocaleString()}원
                </span>
              </div>
              <div className="my-2 grid gap-[5px] bg-[#f8fafb] p-2.5 text-[11px]">
                {[
                  [`투어 등급 | ${draft.grade}`, "300,000원"],
                  [`숙소 | ${draft.hotel}`, "200,000원"],
                  [
                    `추가 음료 | ${draft.drink || "선택 안 함"}`,
                    drinkPrice === 0 ? "0원" : `+${drinkPrice.toLocaleString()}원`,
                  ],
                  [`식사 | ${draft.meal}`, "기본 포함"],
                  [`기념품 | ${draft.souvenir}`, "0원"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#65717e]">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[13px]">
                <span>단골 등급 할인</span>
                <span className="text-sm text=[#17212b]">
                  −60,000원
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#65717e]">실버 등급</p>
              <div className="mt-2 bg-[#eaf7f9] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text=[#17212b]">
                    최종 결제금액
                  </span>
                  <span className="text-sm text=[#17212b]">
                    {draft.amount}원
                  </span>
                </div>
              </div>
            </div>
          </DetailCard>
        </div>

        <div className="mt-5">
          <DetailCard title="관리자 메모 및 안내">
            <div className="grid gap-6 p-3.5 md:grid-cols-[minmax(0,1fr)_340px]">
              <label>
                <span className="text-sm text=[#17212b]">
                  관리자 메모
                </span>
                <textarea
                  placeholder="고객 요청사항이나 특이사항 등 관리자 메모를 입력해 주세요."
                  className="min-h-14 w-full resize-y rounded-md border border-[#c8d2d8] p-3 text-xs outline-none placeholder:text-[#8b96a3] focus:border-[#1596b4]"
                />
              </label>
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text=[#17212b]">
                    안내 문자 발송
                  </span>
                </div>
                <p className="mb-2 text-xs text-[#65717e]">
                  발송 대상: {draft.customer} / {draft.phone}
                </p>
                <button
                  type="button"
                  onClick={() => alert("최근 발송된 안내 문자 내역이 없습니다.")}
                  className={secondaryButton}
                >
                  문자 발송 내역
                </button>
              </div>
            </div>
          </DetailCard>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onCancelReservation(draft.id)}
              className={secondaryButton}
            >
              예약 취소
            </button>
            <span
              className={`text-[11px] ${
                saved ? "text-[#17212b]" : "text-[#17212b]"
              }`}
            >
              {saved
                ? "변경 사항이 저장되었습니다."
                : "변경 사항이 저장되지 않았습니다."}
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onBack} className={secondaryButton}>
              목록으로
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={primaryButton}
            >
              변경 사항 저장
            </button>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
