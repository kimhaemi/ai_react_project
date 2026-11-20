"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useStoredValue } from "@/hooks/useStoredValue";

export type SocialProvider = "google" | "kakao" | "naver";
export type LoginProvider = "local" | SocialProvider;

export interface User {
  id: string;
  name: string;
  provider: LoginProvider;
}

interface AuthContextValue {
  user: User | null;
  login: (id: string, password: string) => Promise<void>;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SOCIAL_NAMES: Record<SocialProvider, string> = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
};

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as Partial<User>;
    if (typeof u.id !== "string" || typeof u.name !== "string") return null;
    return { id: u.id, name: u.name, provider: u.provider ?? "local" };
  } catch {
    return null;
  }
}

/**
 * 데모용 인증. 실제 서버 인증이 붙기 전까지 브라우저(localStorage)에만 로그인 상태를 저장함.
 * 실제 인증을 붙일 때는 login / loginWithSocial / logout 내부만 교체하면 됨.
 * (예: 소셜 로그인은 각 OAuth 인가 URL로 이동 → 콜백에서 세션 생성)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useStoredValue("auth.user");
  const user = useMemo(() => parseUser(raw), [raw]);

  const login = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (id: string, _password: string) => {
      setRaw(JSON.stringify({ id, name: id, provider: "local" } satisfies User));
    },
    [setRaw],
  );

  const loginWithSocial = useCallback(
    async (provider: SocialProvider) => {
      const name = `${SOCIAL_NAMES[provider]} 사용자`;
      setRaw(JSON.stringify({ id: `${provider}-demo`, name, provider } satisfies User));
    },
    [setRaw],
  );

  const logout = useCallback(() => setRaw(null), [setRaw]);

  const value = useMemo(
    () => ({ user, login, loginWithSocial, logout }),
    [user, login, loginWithSocial, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
