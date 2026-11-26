"use client";

import { useEffect, useRef } from "react";
import type Grid from "tui-grid";
import type { GridEventListener, GridEventName, OptGrid, OptRow } from "tui-grid/types/options";
// 원본 CSS 는 Turbopack 에서 파싱 오류가 나서 정리한 사본을 씀 (scripts/tui-grid-css.mjs)
import "./tui-grid.css";
import "tui-date-picker/dist/tui-date-picker.css";

export type TuiGridInstance = Grid;

export interface TuiGridProps extends Omit<OptGrid, "el" | "data"> {
  data: OptRow[];
  /** 그리드 이벤트 (예: { afterChange: (ev) => ... }) */
  events?: Partial<Record<GridEventName, GridEventListener>>;
  /** 생성 직후 인스턴스를 받음 (엑셀 내보내기, getCheckedRows 등 직접 호출용) */
  onReady?: (grid: TuiGridInstance) => void;
  className?: string;
}

/**
 * TOAST UI Grid 를 React 19 / Next.js 에서 쓰기 위한 얇은 래퍼.
 * 공식 @toast-ui/react-grid 는 React 16·17 만 지원해서 직접 감쌈.
 * - tui-grid 는 브라우저 전용이라 useEffect 안에서 동적 import
 * - data 가 바뀌면 resetData, columns 가 바뀌면 setColumns
 * - 나머지 옵션은 생성 시 1회만 적용 (바꾸려면 key 를 바꿔 다시 생성)
 */
export default function TuiGrid({ data, columns, events, onReady, className, ...options }: TuiGridProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Grid | null>(null);
  // 생성 시점에 최신 값을 쓰기 위한 ref (effect 의존성에서 제외)
  const latest = useRef({ data, columns, options, onReady });
  const eventsRef = useRef(events);
  useEffect(() => {
    latest.current = { data, columns, options, onReady };
    eventsRef.current = events;
  });

  useEffect(() => {
    let disposed = false;
    import("tui-grid").then(({ default: GridClass }) => {
      if (disposed || !elRef.current) return;
      const { data, columns, options, onReady } = latest.current;
      GridClass.setLanguage("ko");
      const grid = new GridClass({ el: elRef.current, data, columns, usageStatistics: false, ...options });
      gridRef.current = grid;
      // 이벤트는 ref 를 통해 항상 최신 핸들러로 호출
      const names = Object.keys(eventsRef.current ?? {}) as GridEventName[];
      names.forEach((name) => grid.on(name, (ev) => eventsRef.current?.[name]?.(ev)));
      onReady?.(grid);
    });
    return () => {
      disposed = true;
      gridRef.current?.destroy();
      gridRef.current = null;
    };
  }, []);

  useEffect(() => {
    // 셀 편집 결과를 다시 data 로 넣으면 스크롤·포커스가 초기화되므로, 편집 값은 그리드가 들고 있게 두는 것을 권장
    gridRef.current?.resetData(data);
  }, [data]);

  useEffect(() => {
    gridRef.current?.setColumns(columns);
  }, [columns]);

  return <div ref={elRef} className={className} />;
}
