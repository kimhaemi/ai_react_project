"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button, type ButtonProps } from "./Button";
import { useToast } from "./Toast";

export interface DownloadButtonProps extends Omit<ButtonProps, "onClick" | "loading"> {
  /** 다운로드 실행. onProgress(0~100) 로 진행률 전달 */
  download: (onProgress: (percent: number) => void) => Promise<void> | void;
  /** 실패했을 때 (기본: 오류 토스트) */
  onError?: (error: unknown) => void;
}

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 4v12m0 0-4-4m4 4 4-4" />
    <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
  </svg>
);

/** 다운로드 버튼 (받는 동안 진행률 표시, 중복 클릭 방지) */
export function DownloadButton({ download, onError, children, variant = "secondary", icon, ...props }: DownloadButtonProps) {
  const { t } = useI18n();
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  const run = async () => {
    setProgress(0);
    try {
      await download(setProgress);
    } catch (e) {
      if (onError) onError(e);
      else toast.error(e instanceof Error ? e.message : t("ui.file.downloadFailed"));
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;
  return (
    <Button variant={variant} icon={icon ?? <DownloadIcon />} loading={busy} onClick={run} {...props}>
      {busy && progress > 0 ? `${progress}%` : (children ?? t("ui.file.download"))}
    </Button>
  );
}
