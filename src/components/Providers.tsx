"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { DialogProvider } from "@/components/ui/Dialog";
import { ToastProvider } from "@/components/ui/Toast";
import { I18nProvider } from "@/i18n/I18nProvider";

/** 앱 전체 공통 Provider (언어, 로그인 상태, 토스트, 알림/확인 팝업) */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <DialogProvider>{children}</DialogProvider>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
