"use client";

import { useMemo, useRef, useState } from "react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { makeRows, won, RowCountPicker, useRowCount, OWNERS, STATUSES, type SampleRow } from "./grid-sample";

// v9: 쓸 기능과 행 모델을 명시적으로 등록 (모듈 최상단에 두어 참조가 바뀌지 않게)
const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  tableMeta: {} as { update: (id: number, key: keyof SampleRow, value: string | number) => void },
});
const helper = createColumnHelper<typeof features, SampleRow>();

const ROW_HEIGHT = 36;
const WIDTHS: Record<string, number> = { select: 40, id: 80, name: 160, dept: 110, owner: 110, status: 110, progress: 100, cost: 130, due: 130 };

/** 셀 편집기 (TanStack 은 화면이 없어서 편집 UI 도 직접 만듦) */
function EditCell({
  value,
  options,
  suffix = "",
  onSave,
}: {
  value: string | number;
  options?: string[];
  suffix?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  if (!editing)
    return (
      <span className="block cursor-text truncate" onDoubleClick={() => setEditing(true)}>
        {String(value) + suffix}
      </span>
    );
  const done = (v: string) => {
    setEditing(false);
    if (v !== String(value)) onSave(v);
  };
  if (options)
    return (
      <select autoFocus defaultValue={String(value)} onBlur={(e) => done(e.target.value)} onChange={(e) => done(e.target.value)} className="w-full">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  return (
    <input
      autoFocus
      defaultValue={String(value)}
      className="w-full rounded border border-blue-400 px-1"
      onBlur={(e) => done(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") done(e.currentTarget.value);
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

const columns = helper.columns([
  helper.display({
    id: "select",
    header: ({ table }) => (
      <input type="checkbox" aria-label="전체 선택" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />
    ),
    cell: ({ row }) => <input type="checkbox" aria-label="행 선택" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
  }),
  helper.accessor("id", { header: "번호" }),
  helper.accessor("name", {
    header: "작업명",
    cell: ({ getValue, row, table }) => (
      <EditCell value={getValue()} onSave={(v) => v.trim() && table.options.meta?.update(row.original.id, "name", v.trim())} />
    ),
  }),
  helper.accessor("dept", { header: "부서" }),
  helper.accessor("owner", {
    header: "담당자",
    cell: ({ getValue, row, table }) => (
      <EditCell value={getValue()} options={OWNERS} onSave={(v) => table.options.meta?.update(row.original.id, "owner", v)} />
    ),
  }),
  helper.accessor("status", {
    header: "상태",
    cell: ({ getValue, row, table }) => (
      <EditCell value={getValue()} options={STATUSES} onSave={(v) => table.options.meta?.update(row.original.id, "status", v)} />
    ),
  }),
  helper.accessor("progress", {
    header: "진행률",
    cell: ({ getValue, row, table }) => (
      <EditCell
        value={getValue()}
        suffix="%"
        onSave={(v) => {
          const n = Number(v);
          if (Number.isInteger(n) && n >= 0 && n <= 100) table.options.meta?.update(row.original.id, "progress", n);
        }}
      />
    ),
  }),
  helper.accessor("cost", { header: "비용(원)", cell: ({ getValue }) => won(getValue()) }),
  helper.accessor("due", { header: "마감일" }),
]);

export default function TanStackTableDemo() {
  const { count, renderMs, change } = useRowCount();
  const [data, setData] = useState(() => makeRows(count));
  const [log, setLog] = useState<string[]>([]);
  const meta = useMemo(
    () => ({
      update: (id: number, key: keyof SampleRow, value: string | number) => {
        setData((list) => list.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
        setLog((l) => [`편집: 번호 ${id} ${key} → ${value}`, ...l].slice(0, 5));
      },
    }),
    [],
  );

  const table = useTable({ features, columns, data, meta, getRowId: (r) => String(r.id) });
  const rows = table.getRowModel().rows;
  const sorting = table.state.sorting;
  const selectedCount = Object.keys(table.state.rowSelection).length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => ROW_HEIGHT, overscan: 12 });
  const items = virtualizer.getVirtualItems();
  const padTop = items[0]?.start ?? 0;
  const padBottom = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0);

  const summary = useMemo(() => {
    let cost = 0;
    let progress = 0;
    for (const r of rows) {
      cost += r.original.cost;
      progress += r.original.progress;
    }
    return { cost: won(cost), progress: rows.length ? Math.round(progress / rows.length) : 0 };
  }, [rows]);

  return (
    <DemoPage
      title="TanStack Table + Virtual 테스트"
      description="화면 없이 정렬·필터·선택 '로직'만 주는 MIT 라이브러리(v9). 표 마크업·편집기·가상 스크롤은 직접 만들어서 디자인 자유도가 가장 높습니다."
    >
      <DemoSection
        title="대용량 + 편집(직접 구현) + 정렬 + 검색 + 선택 + 합계"
        description="헤더 클릭: 정렬 / 셀 더블클릭: 편집 (작업명·담당자·상태·진행률) / 맨 앞 체크박스: 선택"
        code={`const features = tableFeatures({ rowSortingFeature, globalFilteringFeature, rowSelectionFeature,
  sortedRowModel: createSortedRowModel(), filteredRowModel: createFilteredRowModel(), ... });
const table = useTable({ features, columns, data });
const virtualizer = useVirtualizer({ count: table.getRowModel().rows.length, estimateSize: () => 36, ... });
// <table> 마크업은 직접 작성`}
      >
        <RowCountPicker
          count={count}
          renderMs={renderMs}
          onChange={(n) => {
            change(n);
            setData(makeRows(n));
            table.resetRowSelection();
          }}
        >
          <input
            value={String(table.state.globalFilter ?? "")}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="전체 검색"
            className="h-8 rounded border border-gray-300 px-2 text-sm"
          />
        </RowCountPicker>
        <div ref={scrollRef} className="h-[480px] overflow-auto rounded border border-gray-200 text-sm">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              {table.getAllLeafColumns().map((c) => (
                <col key={c.id} style={{ width: WIDTHS[c.id] }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-gray-50">
              {table.getHeaderGroups().map((g) => (
                <tr key={g.id}>
                  {g.headers.map((h) => {
                    const dir = sorting.find((s) => s.id === h.column.id);
                    return (
                      <th
                        key={h.id}
                        onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                        className="h-9 cursor-pointer select-none border-b border-gray-200 px-2 text-left font-semibold"
                      >
                        <table.FlexRender header={h} />
                        {dir && (dir.desc ? " ▼" : " ▲")}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {padTop > 0 && (
                <tr>
                  <td style={{ height: padTop }} colSpan={columns.length} />
                </tr>
              )}
              {items.map((vi) => {
                const row = rows[vi.index];
                return (
                  <tr key={row.id} className={row.getIsSelected() ? "bg-blue-50" : "hover:bg-gray-50"} style={{ height: ROW_HEIGHT }}>
                    {row.getAllCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`truncate border-b border-gray-100 px-2 ${["id", "progress", "cost"].includes(cell.column.id) ? "text-right" : ""}`}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {padBottom > 0 && (
                <tr>
                  <td style={{ height: padBottom }} colSpan={columns.length} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-right text-sm text-gray-600">
          {rows.length.toLocaleString()}행 · 선택 {selectedCount.toLocaleString()} · 진행률 평균 {summary.progress}% · 비용 합계 {summary.cost}
        </p>
        <ValueView value={{ log }} />
      </DemoSection>
    </DemoPage>
  );
}
