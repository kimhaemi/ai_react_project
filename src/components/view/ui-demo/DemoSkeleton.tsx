import { Fragment } from "react";
import { Skeleton, SkeletonCard, SkeletonGrid, SkeletonList, SkeletonScreen, SkeletonText } from "@/components/ui";
import { cn } from "@/lib/cn";

/** 예시 섹션 본문 모양 */
type Body =
  | "buttons" // 버튼 여러 개
  | "fields2" // 입력칸 2열
  | "fields3" // 입력칸 3열
  | "choices" // 체크박스·라디오 묶음
  | "calendar" // 달력 + 값
  | "rangeCalendar" // 두 달 달력
  | "pickers" // 날짜 선택칸 2열
  | "chart" // 차트
  | "grid" // 표
  | "tree" // 트리 2개
  | "upload" // 끌어다 놓기 영역
  | "list" // 파일 목록
  | "search" // 검색 영역
  | "text"; // 짧은 안내 글

interface Section {
  body: Body;
  /** 아래 코드 예시 영역 (기본 있음) */
  code?: boolean;
}

/** 배열 안에 배열을 넣으면 넓은 화면에서 2열로 배치 */
type Layout = (Section | Section[])[];

const s = (body: Body, code = true): Section => ({ body, code });

/** 화면(라우트)별 스켈레톤 모양 — 실제 예시 화면의 섹션 순서와 맞춤 */
export const DEMO_LAYOUTS = {
  button: [s("buttons"), s("buttons"), s("buttons")],
  calendar: [s("calendar"), s("pickers")],
  chart: [s("chart"), s("chart"), [s("chart"), s("chart"), s("chart")]],
  checkbox: [s("choices"), s("choices"), s("choices")],
  "date-range": [s("rangeCalendar"), s("pickers")],
  dialog: [s("buttons"), s("buttons"), s("buttons")],
  "file-download": [s("list"), s("buttons")],
  "file-upload": [s("upload"), s("buttons"), s("upload"), s("list", false)],
  grid: [s("grid")],
  input: [s("fields2"), s("fields3"), s("fields3")],
  radio: [s("choices"), s("choices"), s("buttons")],
  "search-box": [s("search"), s("text", false)],
  select: [s("fields2"), s("fields2"), s("fields2"), s("fields3")],
  toast: [s("buttons"), s("buttons")],
  tree: [s("tree"), s("tree")],
  "use-ui": [s("buttons"), s("buttons"), s("buttons")],
} satisfies Record<string, Layout>;

export type DemoSkeletonPage = keyof typeof DEMO_LAYOUTS;

function Field() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

function CalendarBox() {
  return (
    <div className="w-72 max-w-full rounded-lg border border-gray-200 p-3">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="size-7" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="size-7" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 42 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-full" />
        ))}
      </div>
    </div>
  );
}

function TreeBox() {
  const depth = [0, 1, 2, 2, 1, 0, 1, 1];
  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-gray-200 p-3">
      {depth.map((d, i) => (
        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: d * 20 }}>
          <Skeleton className="size-4" />
          <Skeleton className="h-3.5" style={{ width: `${30 + ((i * 13) % 30)}%` }} />
        </div>
      ))}
    </div>
  );
}

function SectionBody({ body }: { body: Body }) {
  switch (body) {
    case "buttons":
      return (
        <div className="flex flex-wrap gap-2">
          {[24, 28, 24, 20, 24].map((w, i) => (
            <Skeleton key={i} className="h-9" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      );
    case "fields2":
    case "fields3":
      return (
        <div className={cn("grid gap-4", body === "fields2" ? "md:grid-cols-2" : "md:grid-cols-3")}>
          {Array.from({ length: body === "fields2" ? 2 : 3 }, (_, i) => (
            <Field key={i} />
          ))}
        </div>
      );
    case "choices":
      return (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-5">
            {[16, 20, 14, 18].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-3.5" style={{ width: `${w * 4}px` }} />
              </div>
            ))}
          </div>
        </div>
      );
    case "calendar":
      return (
        <div className="flex flex-wrap items-start gap-6">
          <CalendarBox />
          <Skeleton className="h-8 w-48" />
        </div>
      );
    case "rangeCalendar":
      return (
        <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 p-3">
          <CalendarBox />
          <div className="hidden sm:block">
            <CalendarBox />
          </div>
        </div>
      );
    case "pickers":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Field />
          <Field />
        </div>
      );
    case "chart":
      return (
        <div>
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="flex h-56 items-end gap-3 border-b border-l border-gray-200 px-3 pb-px">
            {[45, 70, 55, 85, 60, 75, 50, 90].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-b-none" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      );
    case "grid":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <SkeletonGrid rows={6} columns={5} />
        </div>
      );
    case "tree":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <TreeBox />
          <TreeBox />
        </div>
      );
    case "upload":
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 px-4 py-8">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      );
    case "list":
      return <SkeletonList rows={3} meta />;
    case "search":
      return (
        <div className="rounded-lg border border-gray-200">
          <div className="grid gap-px overflow-hidden rounded-t-lg bg-gray-200 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex bg-white">
                <div className="flex w-24 shrink-0 items-center bg-gray-50 px-3">
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <div className="flex min-h-12 flex-1 items-center px-3 py-2">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-200 px-3 py-2.5">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      );
    case "text":
      return <SkeletonText lines={2} className="max-w-md" />;
  }
}

function SectionSkeleton({ body, code = true }: Section) {
  return (
    <SkeletonCard className="p-0">
      <div className="border-b border-gray-100 px-5 py-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-1.5 h-3.5 w-64 max-w-full" />
      </div>
      <div className="p-5">
        <SectionBody body={body} />
      </div>
      {code && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <SkeletonText lines={2} className="max-w-md" />
        </div>
      )}
    </SkeletonCard>
  );
}

/**
 * 공통 UI 예시 화면(DemoPage) 모양의 스켈레톤.
 * page 를 주면 그 화면의 섹션 구성대로, 없으면 기본 3섹션.
 */
export default function DemoSkeleton({ page }: { page?: DemoSkeletonPage }) {
  const layout: Layout = page ? DEMO_LAYOUTS[page] : [s("buttons"), s("buttons"), s("buttons")];
  return (
    <SkeletonScreen className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      </div>
      {layout.map((item, i) => (
        <Fragment key={i}>
          {Array.isArray(item) ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {item.map((sec, j) => (
                <SectionSkeleton key={j} {...sec} />
              ))}
            </div>
          ) : (
            <SectionSkeleton {...item} />
          )}
        </Fragment>
      ))}
    </SkeletonScreen>
  );
}
