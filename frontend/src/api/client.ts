// 백엔드 API 호출 공통 처리
// - 개발 서버(vite)는 /api 요청을 http://localhost:8080 으로 넘김 (vite.config.ts proxy)
// - 관리자 토큰은 이 브라우저 탭(sessionStorage)에만 보관
// - 로그인/회원가입/문자 인증 요청에는 토큰을 붙이지 않음 (만료된 토큰 때문에 401 나는 문제 방지)

const TOKEN_KEY = "mrworld-admin-token";
const NAME_KEY = "mrworld-admin-name";

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

// 토큰 만료 등으로 401이 오면 호출할 함수 등록 (App에서 로그인 화면으로 이동)
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getSessionName(): string | null {
  try {
    return sessionStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export function setSession(token: string, name: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(NAME_KEY, name);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 새로고침 시 다시 로그인
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(NAME_KEY);
  } catch {
    // 무시
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // false면 토큰을 붙이지 않음
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
    message = "접근 권한이 없습니다. 관리자 계정으로 로그인해 주세요.";
  }
  return new ApiError(res.status, message, code);
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
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
    });
  } catch {
    throw new ApiError(0, "서버에 연결할 수 없습니다. 백엔드 서버(localhost:8080)가 켜져 있는지 확인해 주세요.");
  }

  if (res.status === 401 && auth) {
    clearSession();
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
