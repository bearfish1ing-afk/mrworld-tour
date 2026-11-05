import React, { type ReactNode, useState } from "react";
import { assets, type AdminSection } from "../types/admin";

export const fieldClass =
  "h-9 w-full rounded-md border border-[#c8d2d8] bg-white px-3 text-[13px] outline-none focus:border-[#1596b4]";
export const primaryButton =
  "min-h-9 rounded-md bg-[#1596b4] px-4 font-['42dot_Sans:Bold'] text-xs font-bold text-white hover:bg-[#117f99] transition";
export const secondaryButton =
  "min-h-9 rounded-md border border-[#c8d2d8] bg-white px-3 text-xs text-[#17212b] hover:bg-[#f8fafb] transition";

export function Checkbox({
  checked = false,
  onChange,
  compact = false,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`flex shrink-0 items-center justify-center rounded-[3px] border cursor-pointer ${
        compact ? "size-4" : "size-[17px]"
      } ${checked ? "border-[#1596b4] bg-[#1596b4]" : "border-[#c8d2d8] bg-white"}`}
    >
      {checked && <img src={assets.check} alt="" />}
    </button>
  );
}

export function SelectField({
  defaultValue,
  value,
  onChange,
  children,
  icon = assets.chevron,
  name,
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
  icon?: string;
  name?: string;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className={`${fieldClass} appearance-none pr-9 cursor-pointer`}
      >
        {children ?? <option>{defaultValue}</option>}
      </select>
      <img
        src={icon}
        alt=""
        className="pointer-events-none absolute top-1/2 right-3 size-[14px] -translate-y-1/2"
      />
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-[#dde4e8] bg-white ${className}`}>
      <h2 className="border-b border-[#dde4e8] px-[18px] py-[15px] font-['42dot_Sans:Bold'] text-base font-bold text-[#17212b]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function InfoField({
  label,
  children,
  full = false,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <label
      className={`grid min-h-[50px] grid-cols-[108px_minmax(0,1fr)] border-b border-[#dde4e8] ${
        full ? "col-span-full" : ""
      }`}
    >
      <span className="flex items-center border-r border-[#dde4e8] bg-[#f8fafb] px-3.5 text-xs text-[#65717e]">
        {label}
      </span>
      <span className="flex items-center px-3.5 py-[7px]">{children}</span>
    </label>
  );
}

export function AdminShell({
  children,
  active = "products",
  adminName = "관리자",
  onNavigate,
  onLogout,
}: {
  children: ReactNode;
  active?: AdminSection;
  adminName?: string;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
}) {
  const menuItems: Array<{ label: string; section: AdminSection }> = [
    { label: "상품 / 테마 관리", section: "products" },
    { label: "예약 관리", section: "reservations" },
    { label: "기념품 재고", section: "inventory" },
  ];

  return (
    <div className="min-h-dvh bg-[#f4f7f8] font-['42dot_Sans:Regular'] font-normal">
      <header className="flex h-[72px] items-center justify-between border-b border-[#dde4e8] bg-white px-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden">
            <img
              src={assets.logo}
              alt=""
              className="pointer-events-none absolute left-[-52%] top-[-48%] h-[200%] w-[204%] max-w-none"
            />
          </div>
          <span className="font-['EB_Garamond:Bold'] text-xl font-bold tracking-[-0.64px] text-[#1596b4] sm:text-2xl">
            미스터 월드 테마투어 관리자
          </span>
        </div>
        <div className="flex items-center gap-[18px]">
          <div className="hidden h-6 w-px bg-[#dde4e8] sm:block" />
          <div className="flex items-center gap-[9px]">
            <div className="flex size-[34px] items-center justify-center rounded-full bg-[#eaf7f9]">
              <img src={assets.person} alt="" className="size-[18px]" />
            </div>
            <span className="hidden text-[13px] text-[#17212b] sm:block">{adminName}</span>
            <button
              type="button"
              onClick={onLogout}
              className="ml-1 min-h-8 rounded-md border-0 bg-white px-3 text-xs text-[#17212b] hover:bg-[#f8fafb] cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-72px)] flex-col lg:flex-row">
        <aside className="w-full shrink-0 bg-[#132d35] px-[14px] py-3 lg:w-[220px] lg:self-stretch lg:py-[22px]">
          <div className="hidden items-center gap-2 px-[10px] py-1.5 lg:flex">
            <img src={assets.menu} alt="" className="size-[14px]" />
            <span className="font-['42dot_Sans:Bold'] text-[10px] font-bold tracking-[1.2px] text-[#a9bec5]">
              관리 메뉴
            </span>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:mt-2 lg:flex-col">
            {menuItems.map(({ label, section }) => {
              const selected = section === active;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => onNavigate(section)}
                  className={`shrink-0 rounded-md p-3 text-left text-[13px] cursor-pointer ${
                    selected
                      ? "bg-[#1596b4] font-['42dot_Sans:Bold'] font-bold text-white"
                      : "font-['42dot_Sans:Medium'] font-medium text-[#a9bec5] hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>
        {children}
      </div>
    </div>
  );
}