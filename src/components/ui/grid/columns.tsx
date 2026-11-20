import type { ColDef, ICellRendererParams } from "ag-grid-community";

type ActionVariant = "primary" | "danger" | "default";

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: ActionVariant;
  /** 행별로 버튼을 숨길 때 사용 */
  hidden?: (row: T) => boolean;
}

const variantClass: Record<ActionVariant, string> = {
  primary: "border-blue-500 text-blue-600 hover:bg-blue-50",
  danger: "border-red-500 text-red-600 hover:bg-red-50",
  default: "border-gray-400 text-gray-700 hover:bg-gray-50",
};

/** 수정/삭제 같은 행 버튼 열을 만들어 주는 헬퍼 */
export function actionColumn<T>(
  actions: RowAction<T>[],
  overrides: ColDef<T> = {},
): ColDef<T> {
  return {
    headerName: "관리",
    colId: "__actions",
    width: 70 + actions.length * 45,
    sortable: false,
    filter: false,
    resizable: false,
    suppressMovable: true,
    cellRenderer: (p: ICellRendererParams<T>) => {
      const row = p.data;
      if (!row) return null;
      return (
        <div className="flex h-full items-center gap-2">
          {actions
            .filter((a) => !a.hidden?.(row))
            .map((a) => (
              <button
                key={a.label}
                type="button"
                className={`rounded border px-2 py-0.5 text-xs ${variantClass[a.variant ?? "default"]}`}
                onClick={(e) => {
                  e.stopPropagation();
                  a.onClick(row);
                }}
                onDoubleClick={(e) => e.stopPropagation()}
              >
                {a.label}
              </button>
            ))}
        </div>
      );
    },
    ...overrides,
  };
}
