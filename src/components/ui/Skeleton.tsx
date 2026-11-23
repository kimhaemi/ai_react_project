"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";

export interface SkeletonProps {
  /** 크기·모양은 className 으로 (예: "h-4 w-32", "size-10 rounded-full") */
  className?: string;
  style?: CSSProperties;
}

/** 내용 자리를 표시하는 회색 블록 (쉬머 효과) */
export function Skeleton({ className, style }: SkeletonProps) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} style={style} />;
}

/** 여러 줄 글 자리. 마지막 줄은 짧게 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/** 흰 카드 틀 (제목 + 본문 자리) */
export function SkeletonCard({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div aria-hidden className={cn("rounded-lg border border-gray-200 bg-white p-5", className)}>
      {children ?? (
        <>
          <Skeleton className="mb-4 h-5 w-1/3" />
          <SkeletonText />
        </>
      )}
    </div>
  );
}

/** 표(그리드) 자리: 머리줄 + 행 */
export function SkeletonGrid({ rows = 8, columns = 5, className }: { rows?: number; columns?: number; className?: string }) {
  const cols = { gridTemplateColumns: `2rem repeat(${columns - 1}, minmax(0, 1fr))` };
  return (
    <div aria-hidden className={cn("overflow-hidden rounded-lg border border-gray-200 bg-white", className)}>
      <div className="grid items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3" style={cols}>
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} className={c === 0 ? "size-4" : "h-3.5 w-2/3"} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid items-center gap-4 border-b border-gray-100 px-4 py-3.5 last:border-b-0" style={cols}>
          {Array.from({ length: columns }, (_, c) => (
            // 칸마다 길이를 조금씩 달리해서 실제 글처럼 보이게
            <Skeleton key={c} className={c === 0 ? "size-4" : "h-3.5"} style={c === 0 ? undefined : { width: `${55 + ((r * 7 + c * 13) % 40)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 화면 전체 스켈레톤을 감싸는 틀.
 * 화면 읽기 프로그램에는 "불러오는 중" 으로 알려줌.
 */
export function SkeletonScreen({ className, children }: { className?: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{t("ui.skeleton")}</span>
      {children}
    </div>
  );
}
