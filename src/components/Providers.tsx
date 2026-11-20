"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { I18nProvider } from "@/i18n/I18nProvider";

/** 앱 전체 공통 Provider (언어, 로그인 상태) */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}
