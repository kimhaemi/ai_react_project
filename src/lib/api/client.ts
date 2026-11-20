import axios, { AxiosError } from "axios";

/** API 호출 실패 시 던지는 에러. message 는 서버가 보낸 메시지(없으면 기본 문구) */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 공통 axios 인스턴스. 모든 API 호출은 이걸 사용.
 * 주소는 .env 의 NEXT_PUBLIC_API_BASE_URL (pnpm makeenv 로 생성)
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10_000,
  headers: { "Content-Type": "application/json" },
});

// 요청 공통 처리 (예: 로그인 토큰 붙이기)
api.interceptors.request.use((config) => {
  // const token = ...; if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 에러를 ApiError 하나로 통일
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ??
      (err.code === "ECONNABORTED"
        ? "서버 응답이 지연되고 있습니다."
        : !err.response
          ? "API 서버에 연결할 수 없습니다."
          : "요청을 처리하지 못했습니다.");
    return Promise.reject(new ApiError(message, status));
  },
);
