"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TabulatorFull as Tabulator, type ColumnDefinition } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_simple.min.css";
import { Button } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { makeRows, won, RowCountPicker, useRowCount, OWNERS, STATUSES, type SampleRow } from "./grid-sample";

const COLUMNS: ColumnDefinition[] = [
  { title: "번호", field: "id", width: 80, hozAlign: "right", frozen: true, sorter: "number" },
  { title: "작업명", field: "name", width: 160, frozen: true, editor: "input", headerFilter: "input" },
  { title: "부서", field: "dept", width: 110, headerFilter: "list", headerFilterParams: { valuesLookup: "all", clearable: true } },
  {
    title: "담당자",
    field: "owner",
    width: 110,
    editor: "list",
    editorParams: { values: OWNERS },
    headerFilter: "list",
    headerFilterParams: { values: OWNERS, clearable: true },
  },
  {
    title: "상태",
    field: "status",
    width: 110,
    editor: "list",
    editorParams: { values: STATUSES },
    headerFilter: "list",
    headerFilterParams: { values: STATUSES, clearable: true },
  },
  {
    title: "진행률",
    field: "progress",
    width: 110,
    hozAlign: "right",
    sorter: "number",
    editor: "number",
    editorParams: { min: 0, max: 100 },
    validator: [{ type: "integer" }, { type: (_cell, v) => Number(v) >= 0 && Number(v) <= 100 }],
    formatter: (cell) => `${cell.getValue()}%`,
    bottomCalc: "avg",
    bottomCalcFormatter: (cell) => `평균 ${Math.round(Number(cell.getValue()))}%`,
  },
  {
    title: "비용(원)",
    field: "cost",
    width: 130,
    hozAlign: "right",
    sorter: "number",
    formatter: (cell) => won(cell.getValue()),
    bottomCalc: "sum",
    bottomCalcFormatter: (cell) => won(cell.getValue()),
  },
  { title: "마감일", field: "due", width: 130, editor: "date", sorter: "string" },
];

export default function TabulatorDemo() {
  const { count, renderMs, change } = useRowCount();
  const rows = useMemo(() => makeRows(count), [count]);
  const elRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<Tabulator | null>(null);
  const firstRows = useRef(rows);
  const [grouped, setGrouped] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([]);

  // Tabulator 는 바닐라 JS 라 직접 생성/정리 (공식 react-tabulator 는 React 17 에서 멈춤)
  useEffect(() => {
    if (!elRef.current) return;
    const table = new Tabulator(elRef.current, {
      data: firstRows.current,
      columns: COLUMNS,
      height: 480,
      layout: "fitColumns",
      index: "id",
      rowHeader: { formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, frozen: true, width: 40, hozAlign: "center" },
      movableRows: true,
      movableColumns: true,
      selectableRange: false,
      clipboard: true,
    });
    table.on("cellEdited", (cell) => {
      const row = cell.getRow().getData() as SampleRow;
      setLog((l) => [`편집: 번호 ${row.id} ${cell.getField()} → ${String(cell.getValue())}`, ...l].slice(0, 5));
    });
    table.on("rowSelectionChanged", (data: SampleRow[]) => setChecked(data.map((r) => r.id)));
    table.on("rowMoved", (row) => setLog((l) => [`행 이동: 번호 ${(row.getData() as SampleRow).id}`, ...l].slice(0, 5)));
    tableRef.current = table;
    return () => {
      table.destroy();
      tableRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (rows !== firstRows.current) tableRef.current?.replaceData(rows);
  }, [rows]);

  const toggleGroup = () => {
    tableRef.current?.setGroupBy(grouped ? [] : "dept");
    setGrouped(!grouped);
  };

  return (
    <DemoPage
      title="Tabulator 테스트"
      description="tabulator-tables 6.x (MIT) 를 직접 감싸서 사용. 편집·필터·그룹·합계·내보내기까지 기본 기능이 고르게 들어 있습니다."
    >
      <DemoSection
        title="대용량 + 편집 + 정렬/헤더 필터 + 그룹 + 합계 + 내보내기"
        description="헤더 클릭: 정렬 / 헤더 아래 칸: 필터 / 셀 클릭: 편집 / 맨 앞 체크박스: 선택 / 행·컬럼 헤더를 끌어 순서 변경"
        code={`const table = new Tabulator(el, {
  data: rows,
  columns: [{ title: "작업명", field: "name", editor: "input", headerFilter: "input" },
            { title: "비용", field: "cost", sorter: "number", bottomCalc: "sum" }, ...],
  rowHeader: { formatter: "rowSelection", titleFormatter: "rowSelection" },
  height: 480,           // 높이를 주면 가상 렌더링
});
table.setGroupBy("dept");
table.download("csv", "data.csv");`}
      >
        <RowCountPicker count={count} renderMs={renderMs} onChange={change}>
          <Button size="sm" variant="secondary" onClick={toggleGroup}>
            {grouped ? "그룹 해제" : "부서별 그룹"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => tableRef.current?.download("csv", "tabulator-test.csv", { bom: true })}>
            CSV 내보내기
          </Button>
        </RowCountPicker>
        <div ref={elRef} />
        <ValueView value={{ checked: checked.length > 10 ? `${checked.length}개 선택` : checked, log }} />
      </DemoSection>
    </DemoPage>
  );
}
