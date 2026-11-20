"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/download";
import { useI18n } from "@/i18n/I18nProvider";
import { Button, type ButtonVariant } from "./Button";
import { FieldMessage, type FieldBaseProps } from "./Field";

export interface FileUploadProps extends FieldBaseProps {
  /** 허용 형식 (input accept 와 동일, 예: "image/*,.pdf") */
  accept?: string;
  multiple?: boolean;
  /** 파일 1개 최대 크기 (byte) */
  maxSize?: number;
  /** 최대 파일 수 */
  maxFiles?: number;
  /** 실제 업로드 함수. onProgress(0~100) 로 진행률 전달 */
  upload: (files: File[], onProgress: (percent: number) => void) => Promise<unknown>;
  /** 업로드 성공 후 */
  onUploaded?: (result: unknown) => void;
  /** 파일을 고르면 바로 업로드 */
  autoUpload?: boolean;
  disabled?: boolean;
  /** 드롭 영역 안 설명 (버튼 모양일 때는 버튼 옆 설명) */
  description?: ReactNode;
  /** dropzone: 끌어다 놓는 영역(기본) / button: 버튼 하나 */
  variant?: "dropzone" | "button";
  /** 버튼 모양일 때 버튼 글자 */
  buttonLabel?: ReactNode;
  buttonVariant?: ButtonVariant;
  className?: string;
}

interface Pending {
  key: string;
  file: File;
  error?: string;
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .some((a) => (a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a));
}

/** 파일 업로드 (끌어다 놓기 / 클릭해서 선택, 미리 검사, 진행률) */
export function FileUpload({
  accept,
  multiple = true,
  maxSize,
  maxFiles,
  upload,
  onUploaded,
  autoUpload = false,
  disabled,
  description,
  variant = "dropzone",
  buttonLabel,
  buttonVariant = "secondary",
  label,
  hint,
  error: externalError,
  required,
  className,
}: FileUploadProps) {
  const { t } = useI18n();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const uploading = progress !== null;
  const valid = pending.filter((p) => !p.error);

  const validate = (file: File): string | undefined => {
    if (!matchesAccept(file, accept)) return t("ui.file.badType");
    if (maxSize && file.size > maxSize) return t("ui.file.tooLarge", { size: formatBytes(maxSize) });
    if (file.size === 0) return t("ui.file.empty");
    return undefined;
  };

  const start = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setDone(null);
    setProgress(0);
    try {
      const result = await upload(files, setProgress);
      setPending([]);
      setDone(t("ui.file.done", { count: files.length }));
      onUploaded?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("ui.file.failed"));
    } finally {
      setProgress(null);
    }
  };

  const add = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;
    setDone(null);
    setError(null);
    const base = multiple ? pending : [];
    let next: Pending[] = [
      ...base,
      ...(multiple ? incoming : incoming.slice(0, 1)).map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        error: validate(file),
      })),
    ];
    if (maxFiles && next.length > maxFiles) {
      next = next.slice(0, maxFiles);
      setError(t("ui.file.tooMany", { count: maxFiles }));
    }
    setPending(next);
    if (autoUpload) {
      const ok = next.filter((p) => !p.error).map((p) => p.file);
      if (ok.length) void start(ok);
    }
  };

  const off = disabled || uploading;
  const limitsText =
    description ??
    [
      accept && t("ui.file.accept", { accept }),
      maxSize && t("ui.file.maxSize", { size: formatBytes(maxSize) }),
      multiple && maxFiles && t("ui.file.maxFiles", { count: maxFiles }),
    ]
      .filter(Boolean)
      .join(" · ");
  const openPicker = () => !off && inputRef.current?.click();
  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={off}
      className="hidden"
      onChange={(e) => {
        if (e.target.files) add(e.target.files);
        e.target.value = ""; // 같은 파일을 다시 고를 수 있도록
      }}
    />
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span id={`${id}-label`} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      )}

      {variant === "button" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={buttonVariant}
            onClick={openPicker}
            disabled={disabled}
            loading={uploading}
            aria-labelledby={label ? `${id}-label ${id}-btn` : undefined}
            id={`${id}-btn`}
            icon={<UploadIcon className="size-4" />}
          >
            {uploading && autoUpload ? `${t("ui.file.uploading")} ${progress}%` : (buttonLabel ?? t("ui.file.select"))}
          </Button>
          {limitsText && <span className="text-xs text-gray-500">{limitsText}</span>}
          {fileInput}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={off ? -1 : 0}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-label={label ? undefined : t("ui.file.select")}
          aria-disabled={off || undefined}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!off) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!off) add(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition outline-none",
            "focus-visible:ring-2 focus-visible:ring-blue-300",
            dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
            off ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/50",
          )}
        >
          <svg viewBox="0 0 24 24" className="size-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 16V4m0 0-4 4m4-4 4 4" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-600">{t("ui.file.select")}</span> {t("ui.file.orDrop")}
          </p>
          <p className="text-xs text-gray-500">{limitsText}</p>
          {fileInput}
        </div>
      )}
      {pending.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
          {pending.map((p) => (
            <li key={p.key} className="flex items-center gap-3 px-3 py-2 text-sm">
              <FileIcon />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate", p.error ? "text-gray-400" : "text-gray-800")} title={p.file.name}>
                  {p.file.name}
                </p>
                <p className={cn("text-xs", p.error ? "text-red-600" : "text-gray-500")}>{p.error ?? formatBytes(p.file.size)}</p>
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={() => setPending((list) => list.filter((x) => x.key !== p.key))}
                  aria-label={t("ui.file.remove", { name: p.file.name })}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {uploading && (
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={t("ui.file.uploading")} className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <span className="w-10 text-right text-xs text-gray-600 tabular-nums">{progress}%</span>
        </div>
      )}

      {!autoUpload && pending.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPending([])} disabled={uploading}>
            {t("ui.file.clearAll")}
          </Button>
          <Button size="sm" onClick={() => start(valid.map((p) => p.file))} disabled={valid.length === 0} loading={uploading}>
            {t("ui.file.upload", { count: valid.length })}
          </Button>
        </div>
      )}

      {done && (
        <p role="status" className="text-sm text-green-700">
          {done}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <FieldMessage id={id} hint={hint} error={externalError} />
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 16V4m0 0-4 4m4-4 4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
