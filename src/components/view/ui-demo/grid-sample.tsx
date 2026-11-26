"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

/** 그리드 비교 데모 공통 데이터 (모든 그리드 데모가 같은 데이터를 씀) */
export interface SampleRow {
  id: number;
  name: string;
  dept: string;
  owner: string;
  status: string;
  progress: number;
  cost: number;
  due: string;
}

export const OWNERS = ["김민준", "이서연", "박지훈", "최수아"];
export const STATUSES = ["대기", "진행 중", "검토", "완료"];
export const DEPTS = ["개발팀", "디자인팀", "기획팀", "운영팀"];

/** 같은 결과가 나오도록 단순 계산식으로 행 생성 */
export function makeRows(count: number): SampleRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `작업 ${String(i + 1).padStart(5, "0")}`,
    dept: DEPTS[i % DEPTS.length],
    owner: OWNERS[(i * 7) % OWNERS.length],
    status: STATUSES[(i * 3) % STATUSES.length],
    progress: (i * 37) % 101,
    cost: ((i * 7919) % 900 + 100) * 1000,
    due: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  }));
}

export const won = (v: unknown) => (typeof v === "number" ? v.toLocaleString("ko-KR") : String(v ?? ""));

/** 원하는 행 수를 고르고, 바꾼 뒤 화면이 다시 그려질 때까지 걸린 시간을 잼 */
export function useRowCount(initial = 10000) {
  const [count, setCount] = useState(initial);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const started = useRef(0);

  useEffect(() => {
    started.current = performance.now();
  }, []);
  useEffect(() => {
    // 두 프레임 뒤 = 그리드가 실제로 그린 뒤
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setRenderMs(performance.now() - started.current));
    });
    return () => cancelAnimationFrame(id);
  }, [count]);

  const change = (n: number) => {
    started.current = performance.now();
    setRenderMs(null);
    setCount(n);
  };
  return { count, renderMs, change };
}

export function RowCountPicker({
  count,
  renderMs,
  onChange,
  options = [1000, 10000, 100000],
  children,
}: {
  count: number;
  renderMs: number | null;
  onChange: (n: number) => void;
  options?: number[];
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {options.map((n) => (
        <Button key={n} size="sm" variant={n === count ? "primary" : "secondary"} onClick={() => onChange(n)}>
          {n.toLocaleString()}행
        </Button>
      ))}
      <span className="text-sm text-gray-600">{renderMs != null && `렌더 ${renderMs.toFixed(0)}ms`}</span>
      {children && <div className="ml-auto flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
