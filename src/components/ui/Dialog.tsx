"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";
import { Button, type ButtonVariant } from "./Button";

export type DialogTone = "info" | "success" | "warning" | "danger";

export interface DialogButton {
  label: ReactNode;
  variant?: ButtonVariant;
  /** 이 버튼을 눌렀을 때 돌려줄 값 */
  value: string;
  /** 처음 포커스를 받을 버튼 */
  autoFocus?: boolean;
}

export interface DialogProps {
  open: boolean;
  title?: ReactNode;
  /** 본문 내용 */
  children?: ReactNode;
  tone?: DialogTone;
  /** 오른쪽부터가 아니라 왼쪽부터 순서대로 표시 (보통 [취소, 확인]) */
  buttons: DialogButton[];
  /** 버튼을 누르거나 닫으면 호출. 닫기(Esc/바깥 클릭)는 dismissValue 를 전달 */
  onClose: (value: string) => void;
  /** Esc / 바깥 클릭으로 닫을 때 값 (기본 "cancel") */
  dismissValue?: string;
  /** 바깥(배경) 클릭으로 닫기 허용 (기본 true) */
  closeOnBackdrop?: boolean;
}

const TONE_ICON: Record<DialogTone, { cls: string; path: ReactNode }> = {
  info: { cls: "bg-blue-50 text-blue-600", path: <path d="M12 8h.01M11 12h1v5h1" /> },
  success: { cls: "bg-green-50 text-green-600", path: <path d="m7 12 3.5 3.5L17 9" /> },
  warning: { cls: "bg-amber-50 text-amber-600", path: <path d="M12 8v5M12 16.5h.01" /> },
  danger: { cls: "bg-red-50 text-red-600", path: <path d="M12 8v5M12 16.5h.01" /> },
};

/**
 * 공통 팝업 (알림 / 확인). 내용과 버튼만 바꿔서 사용.
 * 브라우저 기본 <dialog> 를 써서 포커스 가두기, Esc 닫기, 배경 처리가 기본 동작함.
 */
export function Dialog({ open, title, children, tone = "info", buttons, onClose, dismissValue = "cancel", closeOnBackdrop = true }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // 기본 버튼에 포커스 (React autoFocus 는 팝업이 열리기 전에 실행되어 동작하지 않음)
      el.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  const icon = TONE_ICON[tone];

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={children ? bodyId : undefined}
      // Esc 키
      onCancel={(e) => {
        e.preventDefault();
        onClose(dismissValue);
      }}
      // 배경(dialog 바깥 영역) 클릭
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose(dismissValue);
      }}
      className="dialog-in m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/40"
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex gap-4">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", icon.cls)} aria-hidden>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" strokeWidth="1.75" />
                {icon.path}
              </svg>
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              {title && (
                <h2 id={titleId} className="text-base font-semibold">
                  {title}
                </h2>
              )}
              {children && (
                <div id={bodyId} className={cn("text-sm whitespace-pre-line text-gray-600", !!title && "mt-1.5")}>
                  {children}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {buttons.map((b) => (
              <Button key={b.value} variant={b.variant ?? "secondary"} data-autofocus={b.autoFocus || undefined} onClick={() => onClose(b.value)}>
                {b.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}

/* ---------- useDialog(): await dialog.alert(...) / await dialog.confirm(...) ---------- */

export interface AlertOptions {
  title?: ReactNode;
  tone?: DialogTone;
  okText?: ReactNode;
}

export interface ConfirmOptions extends AlertOptions {
  cancelText?: ReactNode;
  /** 삭제처럼 되돌릴 수 없는 작업 (빨간 확인 버튼) */
  danger?: boolean;
}

export interface DialogApi {
  /** 알림 팝업. 닫히면 끝남 */
  alert: (message: ReactNode, options?: AlertOptions) => Promise<void>;
  /** 확인 팝업. 확인 = true, 취소/닫기 = false */
  confirm: (message: ReactNode, options?: ConfirmOptions) => Promise<boolean>;
}

interface Request {
  id: number;
  kind: "alert" | "confirm";
  message: ReactNode;
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
}

const DialogContext = createContext<DialogApi | null>(null);

/** 앱 전체에서 useDialog() 로 알림/확인 팝업을 띄울 수 있게 해 주는 Provider. 여러 개 요청하면 차례대로 표시 */
export function DialogProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [queue, setQueue] = useState<Request[]>([]);
  const seq = useRef(0);
  const current = queue[0];

  const push = useCallback(
    (kind: Request["kind"], message: ReactNode, options: ConfirmOptions = {}) =>
      new Promise<boolean>((resolve) => {
        setQueue((q) => [...q, { id: ++seq.current, kind, message, options, resolve }]);
      }),
    [],
  );

  const api = useMemo<DialogApi>(
    () => ({
      alert: (m, o) => push("alert", m, o).then(() => undefined),
      confirm: (m, o) => push("confirm", m, o),
    }),
    [push],
  );

  const close = (value: string) => {
    if (!current) return;
    current.resolve(value === "ok");
    setQueue((q) => q.slice(1));
  };

  const o = current?.options ?? {};
  const buttons: DialogButton[] =
    current?.kind === "confirm"
      ? [
          { label: o.cancelText ?? t("ui.dialog.cancel"), value: "cancel", variant: "secondary", autoFocus: !!o.danger },
          { label: o.okText ?? t("ui.dialog.ok"), value: "ok", variant: o.danger ? "danger" : "primary", autoFocus: !o.danger },
        ]
      : [{ label: o.okText ?? t("ui.dialog.ok"), value: "ok", variant: "primary", autoFocus: true }];

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Dialog
        key={current?.id}
        open={!!current}
        title={o.title}
        tone={o.tone ?? (o.danger ? "danger" : current?.kind === "confirm" ? "warning" : "info")}
        buttons={buttons}
        onClose={close}
        // 알림 팝업은 Esc/바깥 클릭도 "확인" 으로 처리
        dismissValue={current?.kind === "alert" ? "ok" : "cancel"}
      >
        {current?.message}
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}
