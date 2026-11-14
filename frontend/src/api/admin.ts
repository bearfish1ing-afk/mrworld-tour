// 관리자 화면에서 쓰는 백엔드 API
import { api } from "./client";
import type {
  Item,
  LoginResponse,
  Page,
  ProductCreateRequest,
  ProductDetail,
  ProductStatus,
  ProductSummary,
  ReservationChangeRequest,
  ReservationDetail,
  ReservationStatus,
  ReservationSummary,
  SignupRequest,
  SmsSendResponse,
  SmsVerifyResponse,
  StockHistory,
} from "./types";

// ---------- 인증 (토큰 없이 호출) ----------
export const adminLogin = (email: string, password: string) =>
  api<LoginResponse>("/api/admin/auth/login", { method: "POST", body: { email, password }, auth: false });

export const requestSmsCode = (phoneNum: string) =>
  api<SmsSendResponse>("/api/auth/sms/request", { method: "POST", body: { phoneNum }, auth: false });

export const verifySmsCode = (requestId: string, code: string) =>
  api<SmsVerifyResponse>("/api/auth/sms/verify", { method: "POST", body: { requestId, code }, auth: false });

export const adminSignup = (request: SignupRequest) =>
  api<{ userId: number; message: string }>("/api/admin/auth/signup", { method: "POST", body: request, auth: false });

// ---------- 상품 ----------
export const fetchProducts = (page = 0, size = 100) =>
  api<Page<ProductSummary>>(`/api/admin/products?page=${page}&size=${size}`);

export const fetchProductDetail = (productId: number) =>
  api<ProductDetail>(`/api/admin/products/${productId}`);

export const createProduct = (request: ProductCreateRequest) =>
  api<{ productId: number }>("/api/admin/products", { method: "POST", body: request });

// CANCELED면 남은 예약 일괄 취소 후 { canceledReservations } 반환, 나머지는 응답 본문 없음
export const changeProductStatus = (productId: number, status: ProductStatus) =>
  api<{ canceledReservations?: number } | undefined>(`/api/admin/products/${productId}/status`, {
    method: "PATCH",
    body: { status },
  });

// ---------- 예약 ----------
export const fetchReservations = (params: { productId?: number; status?: ReservationStatus } = {}) => {
  const query = new URLSearchParams({ page: "0", size: "100" });
  if (params.productId) query.set("productId", String(params.productId));
  if (params.status) query.set("status", params.status);
  return api<Page<ReservationSummary>>(`/api/admin/reservations?${query}`);
};

export const fetchReservation = (reservationId: number) =>
  api<ReservationDetail>(`/api/admin/reservations/${reservationId}`);

export const changeReservation = (reservationId: number, request: ReservationChangeRequest) =>
  api<ReservationDetail>(`/api/admin/reservations/${reservationId}`, { method: "PATCH", body: request });

export const changeReservationStatus = (reservationId: number, status: ReservationStatus) =>
  api<void>(`/api/admin/reservations/${reservationId}/status`, { method: "PATCH", body: { status } });

export const saveReservationMemo = (reservationId: number, memo: string) =>
  api<void>(`/api/admin/reservations/${reservationId}/memo`, { method: "PATCH", body: { memo } });

// ---------- 재고 ----------
export const fetchItems = () => api<Page<Item>>("/api/admin/items?page=0&size=100");

export const createItem = (itemName: string, initialAmount: number, reason: string) =>
  api<Item>("/api/admin/items", {
    method: "POST",
    body: { itemName, baseAmount: 0, initialAmount, reason },
  });

export const receiveItem = (itemId: number, quantity: number, reason: string) =>
  api<Item>(`/api/admin/items/${itemId}/inputs`, { method: "POST", body: { quantity, reason } });

export const fetchStockHistory = (params: { itemId?: number; page?: number; size?: number } = {}) => {
  const query = new URLSearchParams({ page: String(params.page ?? 0), size: String(params.size ?? 10) });
  if (params.itemId) query.set("itemId", String(params.itemId));
  return api<Page<StockHistory>>(`/api/admin/items/history?${query}`);
};
