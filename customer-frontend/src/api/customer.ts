// 고객 화면에서 쓰는 백엔드 API 모음
import { api } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  PriceRequest,
  PriceResponse,
  ProductDetail,
  ProductPage,
  ProductSearchParams,
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationDetail,
  ReservationListItem,
  SignupRequest,
  SignupResponse,
  SmsSendResponse,
  SmsVerifyResponse,
  UserResponse,
  VoiceSearchResponse,
} from "./types";

// ---- 인증 ----
export const login = (request: LoginRequest) =>
  api<LoginResponse>("/api/auth/login", { method: "POST", body: request, auth: false });

export const signup = (request: SignupRequest) =>
  api<SignupResponse>("/api/auth/signup", { method: "POST", body: request, auth: false });

export const requestSmsCode = (phoneNum: string) =>
  api<SmsSendResponse>("/api/auth/sms/request", {
    method: "POST",
    body: { phoneNum },
    auth: false,
  });

export const verifySmsCode = (requestId: string, code: string) =>
  api<SmsVerifyResponse>("/api/auth/sms/verify", {
    method: "POST",
    body: { requestId, code },
    auth: false,
  });

// ---- 회원 ----
export const getMe = () => api<UserResponse>("/api/users/me");

// ---- 상품 ----
function toQuery(params: Record<string, string | number | undefined | null>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const getProducts = (page = 0, size = 20, signal?: AbortSignal) =>
  api<ProductPage>(`/api/products${toQuery({ page, size })}`, { auth: false, signal });

export const searchProducts = (params: ProductSearchParams, signal?: AbortSignal) =>
  api<ProductPage>(`/api/products/search${toQuery(params)}`, { auth: false, signal });

export const getProduct = (productId: number, signal?: AbortSignal) =>
  api<ProductDetail>(`/api/products/${productId}`, { auth: false, signal });

export const voiceSearch = (transcript: string, signal?: AbortSignal) =>
  api<VoiceSearchResponse>("/api/voice/products/search", {
    method: "POST",
    body: { transcript },
    auth: false,
    signal,
  });

// ---- 예약 ----
// 로그인 상태면 토큰을 붙여 회원 등급 할인까지 계산됨
export const calculatePrice = (request: PriceRequest, signal?: AbortSignal) =>
  api<PriceResponse>("/api/reservations/price", { method: "POST", body: request, signal });

export const createReservation = (request: ReservationCreateRequest) =>
  api<ReservationCreateResponse>("/api/reservations", { method: "POST", body: request });

export const getMyReservations = () => api<ReservationListItem[]>("/api/reservations/me");

export const getMyReservation = (reservationId: number) =>
  api<ReservationDetail>(`/api/reservations/me/${reservationId}`);

export const cancelReservation = (reservationId: number) =>
  api<void>(`/api/reservations/${reservationId}/cancel`, { method: "PATCH" });
