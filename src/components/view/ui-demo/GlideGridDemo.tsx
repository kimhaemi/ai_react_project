"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CompactSelection,
  DataEditor,
  GridCellKind,
  type EditableGridCell,
  type GridCell,
  type GridColumn,
  type GridSelection,
  type Item,
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { makeRows, won, RowCountPicker, useRowCount, type SampleRow } from "./grid-sample";

type Key = keyof SampleRow;
const COLS: { key: Key; title: string; width: number }[] = [
  { key: "id", title: "번호", width: 80 },
  { key: "name", title: "작업명", width: 160 },
  { key: "dept", title: "부서", width: 110 },
  { key: "owner", title: "담당자", width: 110 },
  { key: "status", title: "상태", width: 110 },
  { key: "progress", title: "진행률", width: 100 },
  { key: "cost", title: "비용(원)", width: 130 },
  { key: "due", title: "마감일", width: 130 },
];
const READONLY: Key[] = ["id", "dept", "cost"];

export default function GlideGridDemo() {
  const { count, renderMs, change } = useRowCount();
  // 원본 데이터 (편집 결과를 반영해야 해서 state 로 보관)
  const [data, setData] = useState(() => makeRows(count));
  const [sort, setSort] = useState<{ key: Key; desc: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<GridSelection>({ columns: CompactSelection.empty(), rows: CompactSelection.empty() });
  const [log, setLog] = useState<string[]>([]);

  // Glide 는 정렬/필터 기능이 없어서 화면에 보일 순서(인덱스 배열)를 직접 계산
  const view = useMemo(() => {
    const q = query.trim();
    let idx = data.map((_, i) => i);
    if (q) idx = idx.filter((i) => data[i].name.includes(q) || data[i].owner.includes(q) || data[i].status.includes(q));
    if (sort) {
      const { key, desc } = sort;
      idx.sort((a, b) => {
        const x = data[a][key];
        const y = data[b][key];
        const r = typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y), "ko");
        return desc ? -r : r;
      });
    }
    return idx;
  }, [data, sort, query]);

  const columns = useMemo<GridColumn[]>(
    () => COLS.map((c) => ({ id: c.key, title: c.title + (sort?.key === c.key ? (sort.desc ? " ▼" : " ▲") : ""), width: c.width })),
    [sort],
  );

  const getCellContent = useCallback(
    ([col, row]: Item): GridCell => {
      const r = data[view[row]];
      const key = COLS[col].key;
      const value = r[key];
      const readonly = READONLY.includes(key);
      if (typeof value === "number") {
        const text = key === "progress" ? `${value}%` : key === "cost" ? won(value) : String(value);
        return { kind: GridCellKind.Number, data: value, displayData: text, allowOverlay: !readonly, readonly };
      }
      return { kind: GridCellKind.Text, data: value, displayData: value, allowOverlay: !readonly, readonly };
    },
    [data, view],
  );

  const onCellEdited = useCallback(
    ([col, row]: Item, cell: EditableGridCell) => {
      const key = COLS[col].key;
      const dataIndex = view[row];
      const value = cell.data;
      if (key === "progress" && (typeof value !== "number" || value < 0 || value > 100)) return;
      setData((list) => list.map((r, i) => (i === dataIndex ? { ...r, [key]: value } : r)));
      setLog((l) => [`편집: 번호 ${data[dataIndex].id} ${key} → ${String(value)}`, ...l].slice(0, 5));
    },
    [view, data],
  );

  const summary = useMemo(() => {
    let sum = 0;
    let progress = 0;
    for (const i of view) {
      sum += data[i].cost;
      progress += data[i].progress;
    }
    return { rows: view.length, progressAvg: view.length ? Math.round(progress / view.length) : 0, costSum: won(sum) };
  }, [data, view]);

  const checked = selection.rows.toArray().map((i) => data[view[i]]?.id);

  return (
    <DemoPage
      title="Glide Data Grid 테스트"
      description="캔버스로 그리는 MIT 그리드. 스크롤과 대용량에 강하지만 정렬·필터·합계는 직접 만들어야 합니다 (이 화면도 직접 구현)."
    >
      <DemoSection
        title="대용량 + 편집 + 정렬(직접 구현) + 검색(직접 구현)"
        description="헤더 클릭: 정렬 / 셀 더블클릭(또는 바로 입력): 편집 / 맨 앞 체크박스: 선택 / 셀 범위를 끌어 선택 후 Ctrl+C 복사"
        code={`<DataEditor
  columns={columns}
  rows={view.length}
  getCellContent={([col, row]) => ({ kind: GridCellKind.Text, data, displayData, allowOverlay: true })}
  onCellEdited={([col, row], cell) => save(row, col, cell.data)}
  onHeaderClicked={(col) => toggleSort(col)}   // 정렬은 직접
  rowMarkers="checkbox"
  freezeColumns={2}
/>`}
      >
        <RowCountPicker
          count={count}
          renderMs={renderMs}
          options={[1000, 10000, 100000, 1000000]}
          onChange={(n) => {
            change(n);
            setData(makeRows(n));
            setSelection({ columns: CompactSelection.empty(), rows: CompactSelection.empty() });
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="작업명/담당자/상태 검색"
            className="h-8 rounded border border-gray-300 px-2 text-sm"
          />
        </RowCountPicker>
        <DataEditor
          columns={columns}
          rows={view.length}
          getCellContent={getCellContent}
          onCellEdited={onCellEdited}
          onHeaderClicked={(col) =>
            setSort((s) => {
              const key = COLS[col].key;
              if (s?.key !== key) return { key, desc: false };
              return s.desc ? null : { key, desc: true };
            })
          }
          rowMarkers="checkbox"
          gridSelection={selection}
          onGridSelectionChange={setSelection}
          getCellsForSelection
          freezeColumns={2}
          smoothScrollX
          smoothScrollY
          width="100%"
          height={460}
        />
        <p className="mt-2 text-right text-sm text-gray-600">
          {summary.rows.toLocaleString()}행 · 진행률 평균 {summary.progressAvg}% · 비용 합계 {summary.costSum}
        </p>
        <ValueView value={{ checked: checked.length > 10 ? `${checked.length}개 선택` : checked, log }} />
      </DemoSection>
      {/* 편집기 등 겹쳐 뜨는 요소가 들어갈 자리 (Glide 필수) */}
      <div id="portal" style={{ position: "fixed", left: 0, top: 0, zIndex: 9999 }} />
    </DemoPage>
  );
}
