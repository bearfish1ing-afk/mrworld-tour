// 백엔드 코드값(영문) → 화면 표시용 한글
import type {
  HotelLevel,
  MealType,
  ProductStatus,
  ReservationStatus,
  StockChangeType,
  TravelGrade,
  VehicleType,
} from "./types";

export const GRADE_LABEL: Record<TravelGrade, string> = {
  CLASSIC: "클래식",
  GRAND: "그랜드",
  PREMIUM: "프리미엄",
};

// 테마 최소 등급 규칙: 호텔/식사도 최소 등급의 기본 구성보다 낮으면 선택 불가
const GRADE_RANK: Record<TravelGrade, number> = { CLASSIC: 1, GRAND: 2, PREMIUM: 3 };
const HOTEL_RANK: Record<HotelLevel, number> = { STAR_3: 1, STAR_4: 2, STAR_5: 3 };
const MEAL_RANK: Record<MealType, number> = { LUNCHBOX: 1, LOCAL_RESTAURANT: 2, FINE_DINING: 3 };

export function allowedByMinGrade(
  option: { hotelLevel?: HotelLevel | null; mealType?: MealType | null },
  minGrade: TravelGrade | null | undefined,
): boolean {
  if (!minGrade) return true;
  const min = GRADE_RANK[minGrade];
  if (option.hotelLevel) return HOTEL_RANK[option.hotelLevel] >= min;
  if (option.mealType) return MEAL_RANK[option.mealType] >= min;
  return true;
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  RECRUITING: "모집 중",
  CONFIRMED: "출발 확정",
  CLOSED: "판매 중지",
  CANCELED: "출발 취소",
  COMPLETED: "여행 완료",
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING: "확정 대기",
  CONFIRMED: "확정",
  CANCELED: "취소",
};

export const VEHICLE_LABEL: Record<VehicleType, string> = {
  COUPLE_LUXURY: "2인 전용 고급차량",
  VAN_10_LUXURY: "10인 승합 고급차량",
  PRIVATE_LIMOUSINE: "VIP 리무진",
};

export const STOCK_CHANGE_LABEL: Record<StockChangeType, string> = {
  RECEIVE: "입고",
  ALLOCATE: "예약 배정",
  RESTORE: "취소 복구",
};

export function won(value: number | null | undefined): string {
  return `${(value ?? 0).toLocaleString("ko-KR")}원`;
}

// "2026-11-10T16:56:02.085248" → "2026-11-10 16:56"
export function dateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}
