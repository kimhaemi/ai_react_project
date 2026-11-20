"use client";

import { useMemo, type Ref } from "react";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import type { ColDef, GetRowIdParams } from "ag-grid-community";
import { gridTheme } from "./setup";

export const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
};

export type DataGridProps<T> = AgGridReactProps<T> & {
  ref?: Ref<AgGridReact<T>>;
  /** 그리드 높이 (기본 600px). 숫자는 px */
  height?: number | string;
  className?: string;
  /** 행 고유키 필드. 지정하면 getRowId 를 자동으로 만들어 줌 */
  rowIdField?: keyof T & string;
  /** 데이터가 없을 때 표시할 문구 */
  emptyMessage?: string;
};

/**
 * 공통 AG Grid 컴포넌트.
 * 테마, 기본 컬럼 옵션, 페이지네이션 등 공통 기본값이 적용되어 있고
 * AgGridReact 의 모든 props 를 그대로 넘겨서 덮어쓸 수 있음.
 */
export default function DataGrid<T>({
  ref,
  height = 600,
  className,
  rowIdField,
  emptyMessage = "데이터가 없습니다.",
  defaultColDef,
  getRowId,
  ...props
}: DataGridProps<T>) {
  const mergedColDef = useMemo<ColDef<T>>(
    () => ({ ...(DEFAULT_COL_DEF as ColDef<T>), ...defaultColDef }),
    [defaultColDef],
  );

  const resolvedGetRowId = useMemo(() => {
    if (getRowId) return getRowId;
    if (!rowIdField) return undefined;
    return (p: GetRowIdParams<T>) => String(p.data[rowIdField]);
  }, [getRowId, rowIdField]);

  return (
    <div className={className} style={{ height, width: "100%" }}>
      <AgGridReact<T>
        ref={ref}
        theme={gridTheme}
        pagination
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        overlayNoRowsTemplate={emptyMessage}
        {...props}
        defaultColDef={mergedColDef}
        getRowId={resolvedGetRowId}
      />
    </div>
  );
}
