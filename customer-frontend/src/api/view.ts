// 백엔드 응답을 화면에 보여주기 좋은 형태로 바꾸는 도우미
import type {
  HotelLevel,
  MealType,
  OptionResponse,
  VehicleType,
  ProductSummary,
  ReservationStatus,
  ThemeResponse,
  TravelGrade,
  UserLevel,
} from "./types";

export type ThemeId = "honeymoon" | "parents" | "golf" | "trekking";

export const themeLabels: Record<ThemeId, string> = {
  honeymoon: "허니문",
  parents: "효도",
  golf: "골프",
  trekking: "트레킹",
};

// ThemeDataInitializer 기준 테마 ID (1 허니문, 2 효도, 3 골프, 4 트레킹)
export const themeBackendIds: Record<ThemeId, number> = {
  honeymoon: 1,
  parents: 2,
  golf: 3,
  trekking: 4,
};

// 백엔드 테마 → 화면 테마 (이름 우선, 없으면 ID)
export function toThemeId(theme: ThemeResponse | null | undefined): ThemeId | null {
  if (!theme) return null;
  const name = theme.name ?? "";
  if (name.includes("허니문")) return "honeymoon";
  if (name.includes("효도")) return "parents";
  if (name.includes("골프")) return "golf";
  if (name.includes("트레킹")) return "trekking";
  const byId = (Object.keys(themeBackendIds) as ThemeId[]).find(
    (id) => themeBackendIds[id] === theme.id,
  );
  return byId ?? null;
}

export function themeIdFromLabel(label: string): ThemeId | null {
  const found = (Object.keys(themeLabels) as ThemeId[]).find((id) => themeLabels[id] === label);
  return found ?? null;
}

// 상품 이미지는 백엔드에 없으므로 테마별 기본 이미지 중 하나를 상품 ID로 골라 씀
const themeImages: Record<ThemeId, string[]> = {
  honeymoon: ["cfca1.png", "0a27c.png", "5e8e9.png", "90657.png", "95997.png", "af995.png", "cab04.png", "d51a3.png"],
  parents: ["19e4f.png", "359db.png", "4fb58.png", "5b6af.png", "76903.png", "8c196.png", "c89c1.png", "e4d44.png"],
  golf: ["0eccd.png", "1e5d1.png", "254fd.png", "57774.png", "7a7dd.png", "99b77.png", "a2741.png", "f9712.png"],
  trekking: ["7837e.png", "78415.png", "81fed.png", "c8132.png", "cd6bf.png", "e3f88.png"],
};

export function productImage(productId: number, theme: ThemeId | null): string {
  if (!theme) return "/assets/8a4c7.png";
  const list = themeImages[theme];
  return `/assets/theme-${theme}/${list[Math.abs(productId) % list.length]}`;
}

export const currency = (price: number) => `${price.toLocaleString("ko-KR")}원`;

// "2026-10-24" → "2026.10.24"
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return value.slice(0, 10).replace(/-/g, ".");
}

// "2026-10-24T14:32:00" → "2026.10.24 14:32"
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const [date, time] = value.split("T");
  return time ? `${formatDate(date)} ${time.slice(0, 5)}` : formatDate(date);
}

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function formatDateWithDay(value: string): string {
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return formatDate(value);
  return `${formatDate(value)} (${weekdays[d.getDay()]})`;
}

export function tripDays(departure: string, ret: string): number {
  const start = new Date(`${departure.slice(0, 10)}T00:00:00`).getTime();
  const end = new Date(`${ret.slice(0, 10)}T00:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

export function durationLabel(p: Pick<ProductSummary, "duration" | "departureDate" | "returnDate">) {
  if (p.duration) return p.duration;
  const days = tripDays(p.departureDate, p.returnDate);
  return days > 1 ? `${days - 1}박 ${days}일` : `${days}일`;
}

// 등급 문자열("CLASSIC" 또는 "클래식") → enum
const gradeLabels: Record<TravelGrade, string> = {
  CLASSIC: "클래식",
  GRAND: "그랜드",
  PREMIUM: "프리미엄",
};
const gradeRank: Record<TravelGrade, number> = { CLASSIC: 1, GRAND: 2, PREMIUM: 3 };

export function toTravelGrade(value: string | null | undefined): TravelGrade | null {
  if (!value) return null;
  const v = value.trim();
  const found = (Object.keys(gradeLabels) as TravelGrade[]).find(
    (g) => g === v.toUpperCase() || gradeLabels[g] === v,
  );
  return found ?? null;
}

export function gradeLabel(value: string | null | undefined): string {
  const g = toTravelGrade(value);
  return g ? gradeLabels[g] : value ?? "-";
}

export function gradeSatisfies(value: string, minimum: TravelGrade | null | undefined) {
  if (!minimum) return true;
  const g = toTravelGrade(value);
  return g ? gradeRank[g] >= gradeRank[minimum] : true;
}

export const minGradeLabel = (g: TravelGrade) => gradeLabels[g];

// 예약 상태
export type StatusLabel = "대기" | "확정" | "취소";
export const statusLabels: Record<ReservationStatus, StatusLabel> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELED: "취소",
};

// 회원 등급 (CustomerLevel.java 기준: 브론즈 0%, 실버 2%, 골드 5%)
export const levelInfo: Record<UserLevel, { label: string; discountRate: number; minAmount: number }> = {
  BRONZE: { label: "브론즈", discountRate: 0, minAmount: 0 },
  SILVER: { label: "실버", discountRate: 2, minAmount: 3_000_000 },
  GOLD: { label: "골드", discountRate: 5, minAmount: 10_000_000 },
};

// 상품 옵션 이름 (optionName이 비어 있으면 enum 라벨 사용)
const hotelLabels: Record<HotelLevel, string> = {
  STAR_3: "3성급 호텔",
  STAR_4: "4성급 호텔",
  STAR_5: "5성급 호텔",
};
const vehicleLabels: Record<VehicleType, string> = {
  COUPLE_LUXURY: "2인 전용 고급차량",
  VAN_10_LUXURY: "10인 승합 고급차량",
  PRIVATE_LIMOUSINE: "VIP 리무진",
};
const mealLabels: Record<MealType, string> = {
  LUNCHBOX: "도시락",
  LOCAL_RESTAURANT: "현지식 레스토랑",
  FINE_DINING: "고급 레스토랑 스테이크",
};

export function optionLabel(o: OptionResponse): string {
  if (o.optionName) return o.optionName;
  if (o.hotelLevel) return hotelLabels[o.hotelLevel];
  if (o.vehicleType) return vehicleLabels[o.vehicleType];
  if (o.mealType) return mealLabels[o.mealType];
  return "옵션";
}

// 목록 카드에서 상세로 넘길 때 쓰는 상품 요약
export type SelectedProduct = {
  id: number;
  title: string;
  country: string;
  duration: string;
  price: number;
  image: string;
  theme: ThemeId | null;
  themeLabel: string;
  departureDate: string;
  returnDate: string;
};

export function toSelectedProduct(p: ProductSummary): SelectedProduct {
  const theme = toThemeId(p.theme);
  return {
    id: p.id,
    title: p.title,
    country: p.country,
    duration: durationLabel(p),
    price: p.basePrice,
    image: productImage(p.id, theme),
    theme,
    themeLabel: theme ? themeLabels[theme] : p.theme?.name ?? "테마 여행",
    departureDate: p.departureDate,
    returnDate: p.returnDate,
  };
}
