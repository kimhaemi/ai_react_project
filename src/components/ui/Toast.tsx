"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastOptions {
  title?: ReactNode;
  /** 표시 시간(ms). 0 이면 직접 닫을 때까지 유지. 기본 4000 (오류는 6000) */
  duration?: number;
  /** 토스트 안 버튼 (예: 실행 취소) */
  action?: { label: ReactNode; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: number;
  type: ToastType;
  message: ReactNode;
}

type ToastFn = (message: ReactNode, options?: ToastOptions) => number;

export interface ToastApi {
  show: (type: ToastType, message: ReactNode, options?: ToastOptions) => number;
  success: ToastFn;
  info: ToastFn;
  warning: ToastFn;
  error: ToastFn;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const MAX_TOASTS = 5;

/** 앱 전체에서 useToast() 로 토스트를 띄울 수 있게 해 주는 Provider */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback((type: ToastType, message: ReactNode, options: ToastOptions = {}) => {
    const id = ++seq.current;
    setItems((list) => [...list, { id, type, message, ...options }].slice(-MAX_TOASTS));
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m, o) => show("success", m, o),
      info: (m, o) => show("info", m, o),
      warning: (m, o) => show("warning", m, o),
      error: (m, o) => show("error", m, o),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* 화면 오른쪽 아래 (모바일은 아래 가운데) */}
      <section
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        {items.map((t) => (
          <ToastView key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// 상태 색은 상태 표시에만 사용 (아이콘 + 글자와 함께 표시해서 색만으로 구분하지 않음)
const STYLES: Record<ToastType, { bar: string; icon: string; path: ReactNode }> = {
  success: { bar: "bg-green-600", icon: "text-green-600", path: <path d="m5 12 5 5 9-10" /> },
  info: { bar: "bg-blue-600", icon: "text-blue-600", path: <path d="M12 8h.01M11 12h1v5h1" /> },
  warning: { bar: "bg-amber-500", icon: "text-amber-600", path: <path d="M12 8v5M12 16.5h.01" /> },
  error: { bar: "bg-red-600", icon: "text-red-600", path: <path d="M8 8l8 8M16 8l-8 8" /> },
};

function ToastView({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { t } = useI18n();
  const duration = item.duration ?? (item.type === "error" ? 6000 : 4000);
  const [paused, setPaused] = useState(false);
  const s = STYLES[item.type];

  // 마우스를 올리거나 포커스가 있으면 자동으로 닫히지 않음
  useEffect(() => {
    if (!duration || paused) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, paused, onClose]);

  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      aria-live={item.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="toast-in pointer-events-auto relative flex w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
    >
      <span className={cn("w-1 shrink-0", s.bar)} aria-hidden />
      <div className="flex flex-1 items-start gap-3 py-3 pr-2 pl-3">
        <svg viewBox="0 0 24 24" className={cn("mt-0.5 size-5 shrink-0", s.icon)} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9.5" strokeWidth="1.75" />
          {s.path}
        </svg>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-gray-900">
            <span className="sr-only">{t(`ui.toast.${item.type}`)}: </span>
            {item.title ?? t(`ui.toast.${item.type}`)}
          </p>
          <div className="mt-0.5 break-words text-gray-600">{item.message}</div>
          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action!.onClick();
                onClose();
              }}
              className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
            >
              {item.action.label}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("ui.toast.close")}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
