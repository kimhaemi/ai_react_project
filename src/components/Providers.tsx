"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { DialogProvider } from "@/components/ui/Dialog";
import { LoadingProvider } from "@/components/ui/Loading";
import { ToastProvider } from "@/components/ui/Toast";
import { I18nProvider } from "@/i18n/I18nProvider";

/** 앱 전체 공통 Provider (언어, 로그인 상태, 토스트, 팝업, 로딩) → 화면에서는 useUI() 하나로 사용 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <DialogProvider>
            <LoadingProvider>{children}</LoadingProvider>
          </DialogProvider>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
