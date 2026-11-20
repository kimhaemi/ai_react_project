"use client";

import { useMemo, type ReactNode } from "react";
import { useDialog, type AlertOptions, type ConfirmOptions, type OpenDialogOptions } from "./Dialog";
import { useLoading, type LoadingApi } from "./Loading";
import { useToast, type ToastApi } from "./Toast";

export interface RunOptions {
  /** 실행 전에 물어볼 확인 문구 (취소하면 실행하지 않음) */
  confirm?: ReactNode | ({ message: ReactNode } & ConfirmOptions);
  /** 실행 중 화면 전체 로딩 표시 (true 또는 표시할 문구) */
  loading?: boolean | ReactNode;
  /** 성공 시 토스트 문구 */
  success?: ReactNode;
  /** 실패 시 토스트 문구 (기본: 에러 메시지). false 면 표시하지 않음 */
  error?: ReactNode | false;
}

export interface UI {
  /** 토스트: ui.toast.success("저장했습니다") */
  toast: ToastApi;
  /** 알림 팝업: await ui.alert("저장되었습니다") */
  alert: (message: ReactNode, options?: AlertOptions) => Promise<void>;
  /** 확인 팝업: if (await ui.confirm("삭제할까요?", { danger: true })) ... */
  confirm: (message: ReactNode, options?: ConfirmOptions) => Promise<boolean>;
  /** 버튼을 직접 구성하는 팝업: const v = await ui.dialog({ title, content, buttons }) */
  dialog: (options: OpenDialogOptions) => Promise<string>;
  /** 화면 전체 로딩: ui.loading.wrap(promise) / show() / hide() */
  loading: LoadingApi;
  /**
   * 자주 쓰는 흐름을 한 번에: 확인 → 로딩 → 실행 → 성공/실패 토스트
   * 성공하면 결과, 취소·실패하면 undefined
   */
  run: <T>(task: () => Promise<T>, options?: RunOptions) => Promise<T | undefined>;
}

/**
 * 화면에서 공통 UI 를 한 번에 쓰는 훅
 *
 * const ui = useUI();
 * ui.toast.success("저장했습니다.");
 * if (await ui.confirm("삭제할까요?", { danger: true })) ...
 * await ui.run(() => api.save(data), { loading: true, success: "저장했습니다." });
 */
export function useUI(): UI {
  const toast = useToast();
  const dialog = useDialog();
  const loading = useLoading();

  return useMemo<UI>(
    () => ({
      toast,
      alert: dialog.alert,
      confirm: dialog.confirm,
      dialog: dialog.open,
      loading,
      run: async (task, o = {}) => {
        if (o.confirm) {
          const c = o.confirm;
          const ok =
            typeof c === "object" && c !== null && "message" in c
              ? await dialog.confirm(c.message, c)
              : await dialog.confirm(c as ReactNode);
          if (!ok) return undefined;
        }
        try {
          const result = o.loading
            ? await loading.wrap(task, typeof o.loading === "boolean" ? undefined : o.loading)
            : await task();
          if (o.success) toast.success(o.success);
          return result;
        } catch (e) {
          if (o.error !== false) toast.error(o.error ?? (e instanceof Error ? e.message : String(e)));
          return undefined;
        }
      },
    }),
    [toast, dialog, loading],
  );
}
