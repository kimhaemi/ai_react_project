"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export interface LoadingApi {
  /** 화면 전체 로딩 표시 (여러 번 부르면 그만큼 hide 해야 사라짐) */
  show: (message?: ReactNode) => void;
  hide: () => void;
  /** 작업이 끝날 때까지 로딩 표시 */
  wrap: <T>(task: Promise<T> | (() => Promise<T>), message?: ReactNode) => Promise<T>;
}

const LoadingContext = createContext<LoadingApi | null>(null);
/** 빨리 끝나는 작업에서 깜빡이지 않도록, 이 시간 이상 걸릴 때만 표시 (ms) */
const SHOW_DELAY = 200;

export function LoadingProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState<ReactNode>(null);
  const [visible, setVisible] = useState(false);
  const countRef = useRef(0);

  const show = useCallback((msg?: ReactNode) => {
    countRef.current += 1;
    setCount(countRef.current);
    setMessage(msg ?? null);
  }, []);
  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    setCount(countRef.current);
  }, []);
  const wrap = useCallback(
    async <T,>(task: Promise<T> | (() => Promise<T>), msg?: ReactNode) => {
      show(msg);
      try {
        return await (typeof task === "function" ? task() : task);
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  // 일정 시간 이상 걸릴 때만 표시, 끝나면 바로 숨김
  useEffect(() => {
    if (count === 0) {
      const id = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setVisible(true), SHOW_DELAY);
    return () => window.clearTimeout(id);
  }, [count]);

  const api = useMemo(() => ({ show, hide, wrap }), [show, hide, wrap]);

  return (
    <LoadingContext.Provider value={api}>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="toast-in fixed inset-0 z-[80] flex items-center justify-center bg-white/60 backdrop-blur-[1px]"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-5 shadow-xl ring-1 ring-gray-200">
            <svg className="size-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-gray-700">{message ?? t("ui.loading")}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingApi {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside <LoadingProvider>");
  return ctx;
}
