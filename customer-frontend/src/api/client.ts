// 백엔드 API 호출 공통 처리 (고객 화면)
// - 개발 서버(vite)는 /api 요청을 http://localhost:8080 으로 넘김 (vite.config.ts proxy)
// - 배포 환경에서는 nginx가 /api 요청을 백엔드로 넘김
// - 고객 토큰은 localStorage에 보관해 새로고침해도 로그인이 유지되도록 함
// - 로그인/회원가입/문자 인증 요청에는 토큰을 붙이지 않음 (만료된 토큰 때문에 401 나는 문제 방지)

const TOKEN_KEY = "mrworld-customer-token";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let unauthorizedHandler: (() => void) | null = null;

// 토큰 만료 등으로 401이 오면 호출할 함수 등록 (App에서 로그아웃 처리)
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 새로고침 시 다시 로그인
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 무시
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // false면 토큰을 붙이지 않음
  signal?: AbortSignal;
};

// 백엔드 오류 응답(ProblemDetail)에서 사용자에게 보여줄 문장 추출
async function toApiError(res: Response): Promise<ApiError> {
  let message = `요청에 실패했습니다. (${res.status})`;
  let code: string | undefined;
  try {
    const data = await res.json();
    code = data.code;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      message = data.errors.map((e: { message: string }) => e.message).join("\n");
    } else if (data.detail) {
      message = data.detail;
    }
  } catch {
    // 본문이 없거나 JSON이 아님
  }
  if (res.status === 403 && !code) {
    message = "접근 권한이 없습니다.";
  }
  return new ApiError(res.status, message, code);
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  // 토큰을 보냈는데 401이면 만료된 것 → 로그아웃 처리
  if (res.status === 401 && token) {
    clearToken();
    unauthorizedHandler?.();
    throw new ApiError(401, "로그인이 만료되었습니다. 다시 로그인해 주세요.");
  }
  if (!res.ok) {
    throw await toApiError(res);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// 화면에서 오류 문장 꺼내기
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
