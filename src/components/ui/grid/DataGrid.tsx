"use client";

import { useMemo, type Ref } from "react";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import type { CellClassParams, CellEditRequestEvent, ColDef, ColGroupDef, GetRowIdParams, RowDragEndEvent } from "ag-grid-community";
import { gridTheme } from "./setup";

export const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
};

/** 셀을 고쳤을 때 전달되는 정보 */
export interface CellEditParams<T> {
  /** 고치기 전 행 데이터 (변경되지 않음) */
  data: T;
  /** 고친 컬럼의 field */
  field: string;
  oldValue: unknown;
  newValue: unknown;
  event: CellEditRequestEvent<T>;
}

export type DataGridProps<T> = AgGridReactProps<T> & {
  ref?: Ref<AgGridReact<T>>;
  /** 그리드 높이 (기본 600px). 숫자는 px */
  height?: number | string;
  className?: string;
  /** 행 고유키 필드. 지정하면 getRowId 를 자동으로 만들어 줌 */
  rowIdField?: keyof T & string;
  /** 데이터가 없을 때 표시할 문구 */
  emptyMessage?: string;
  /**
   * 셀 편집 처리. 지정하면 컬럼에 editable: true 인 칸을 더블클릭(또는 Enter/F2)해서 바로 고칠 수 있음.
   * 그리드는 데이터를 직접 바꾸지 않으므로, 저장에 성공하면 rowData 를 새 값으로 바꿔서 넘겨야 함
   * (실패하면 아무것도 하지 않으면 원래 값이 그대로 보임).
   */
  onCellEdit?: (params: CellEditParams<T>) => void | Promise<void>;
  /**
   * 행 순서 바꾸기. 지정하면 맨 앞에 끌기 손잡이(⠿) 칸이 생기고, 놓으면 바뀐 순서의 전체 행을 전달.
   * 끌어서 옮기는 동안 순서가 섞이지 않도록 페이지 나누기·정렬·필터는 자동으로 꺼짐.
   * 받은 배열을 rowData 로 다시 넘겨 주면 됨.
   */
  onRowOrderChange?: (rows: T[]) => void;
};

/** 배열에서 항목 하나를 옮긴 새 배열 (키보드용 위/아래 버튼 등에 사용) */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

const DRAG_COLUMN = {
  colId: "__rowDrag",
  headerName: "",
  rowDrag: true,
  width: 44,
  minWidth: 44,
  maxWidth: 44,
  sortable: false,
  filter: false,
  resizable: false,
  suppressMovable: true,
  suppressHeaderMenuButton: true,
  cellClass: "dg-drag-cell",
} satisfies ColDef;

const isColDef = <T,>(c: ColDef<T> | ColGroupDef<T>): c is ColDef<T> => !("children" in c);

/** 편집 가능한 칸에 표시용 class 추가 (기존 cellClass 는 유지) */
function markEditable<T>(defs: (ColDef<T> | ColGroupDef<T>)[] | null | undefined): (ColDef<T> | ColGroupDef<T>)[] | null | undefined {
  return defs?.map((c) => {
    if (!isColDef(c)) return { ...c, children: markEditable(c.children) ?? [] };
    if (!c.editable) return c;
    const original = c.cellClass;
    return {
      ...c,
      // 저장되면 칸이 잠깐 깜빡여서 바뀐 것을 알려줌
      enableCellChangeFlash: c.enableCellChangeFlash ?? true,
      cellClass: (p: CellClassParams<T>) => {
        const base = typeof original === "function" ? original(p) : original;
        const editable = typeof c.editable === "function" ? p.node && c.editable(p as never) : c.editable;
        return [...(Array.isArray(base) ? base : base ? [base] : []), ...(editable ? ["dg-editable"] : [])];
      },
    };
  });
}

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
  columnDefs,
  onCellEdit,
  onRowOrderChange,
  ...props
}: DataGridProps<T>) {
  const reorder = !!onRowOrderChange;
  const mergedColDef = useMemo<ColDef<T>>(
    () => ({
      ...(DEFAULT_COL_DEF as ColDef<T>),
      // 순서 바꾸기 모드에서는 정렬/필터가 켜져 있으면 끌기가 막히므로 기본으로 끔
      ...(reorder ? { sortable: false, filter: false } : {}),
      ...defaultColDef,
    }),
    [defaultColDef, reorder],
  );

  const resolvedGetRowId = useMemo(() => {
    if (getRowId) return getRowId;
    if (!rowIdField) return undefined;
    return (p: GetRowIdParams<T>) => String(p.data[rowIdField]);
  }, [getRowId, rowIdField]);

  const resolvedColumnDefs = useMemo(() => {
    const defs = markEditable(columnDefs);
    return reorder ? [DRAG_COLUMN as ColDef<T>, ...(defs ?? [])] : defs;
  }, [columnDefs, reorder]);

  const reorderProps: Partial<AgGridReactProps<T>> = reorder
    ? {
        rowDragManaged: true,
        pagination: false,
        onRowDragEnd: (e: RowDragEndEvent<T>) => {
          const rows: T[] = [];
          e.api.forEachNodeAfterFilterAndSort((n) => n.data && rows.push(n.data));
          onRowOrderChange(rows);
        },
      }
    : {};

  const editProps: Partial<AgGridReactProps<T>> = onCellEdit
    ? {
        // 그리드가 데이터를 직접 바꾸지 않고 요청만 보냄 → 저장 성공 시 앱이 rowData 를 갱신
        readOnlyEdit: true,
        onCellEditRequest: (e: CellEditRequestEvent<T>) => {
          const field = e.colDef.field;
          if (!e.data || !field || Object.is(e.oldValue, e.newValue)) return;
          void onCellEdit({ data: e.data, field, oldValue: e.oldValue, newValue: e.newValue, event: e });
        },
      }
    : {};

  return (
    <div className={className} style={{ height, width: "100%" }}>
      <AgGridReact<T>
        ref={ref}
        theme={gridTheme}
        pagination
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        overlayNoRowsTemplate={emptyMessage}
        // 다른 곳을 누르면 편집 종료(입력한 값 반영), Enter 로 저장 후 아래 칸으로 이동
        stopEditingWhenCellsLoseFocus
        enterNavigatesVerticallyAfterEdit
        {...editProps}
        {...props}
        {...reorderProps}
        columnDefs={resolvedColumnDefs}
        defaultColDef={mergedColDef}
        getRowId={resolvedGetRowId}
      />
    </div>
  );
}
