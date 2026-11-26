"use client";

import { useMemo, useState } from "react";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid";
import { koKR } from "@mui/x-data-grid/locales";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { makeRows, won, RowCountPicker, useRowCount, OWNERS, STATUSES, type SampleRow } from "./grid-sample";

const columns: GridColDef<SampleRow>[] = [
  { field: "id", headerName: "번호", width: 80, type: "number" },
  { field: "name", headerName: "작업명", width: 160, editable: true },
  { field: "dept", headerName: "부서", width: 110 },
  { field: "owner", headerName: "담당자", width: 110, editable: true, type: "singleSelect", valueOptions: OWNERS },
  { field: "status", headerName: "상태", width: 110, editable: true, type: "singleSelect", valueOptions: STATUSES },
  {
    field: "progress",
    headerName: "진행률",
    width: 100,
    type: "number",
    editable: true,
    valueFormatter: (v) => `${v}%`,
  },
  { field: "cost", headerName: "비용(원)", width: 130, type: "number", valueFormatter: (v) => won(v) },
  { field: "due", headerName: "마감일", width: 130 },
];

export default function MuiGridDemo() {
  const { count, renderMs, change } = useRowCount();
  const rows = useMemo(() => makeRows(count), [count]);
  const [selection, setSelection] = useState<GridRowSelectionModel>({ type: "include", ids: new Set() });
  const [log, setLog] = useState<string[]>([]);

  const selected = selection.type === "include" ? [...selection.ids].map(Number) : [];

  return (
    <DemoPage
      title="MUI X DataGrid (무료 버전) 테스트"
      description="@mui/x-data-grid MIT 버전. 정렬·필터·편집·선택·CSV 내보내기는 되지만, 한 페이지 100행 제한·다중 정렬/필터·그룹·합계는 유료(Pro/Premium) 기능입니다."
    >
      <DemoSection
        title="대용량(페이지 단위) + 편집 + 정렬/필터 + 선택 + CSV"
        description="헤더 클릭: 정렬 / 헤더 메뉴(⋮): 필터·컬럼 숨기기 / 셀 더블클릭: 편집 / 툴바: 검색·CSV 내보내기·인쇄"
        code={`<DataGrid
  rows={rows}
  columns={[{ field: "owner", editable: true, type: "singleSelect", valueOptions: OWNERS }, ...]}
  checkboxSelection
  showToolbar
  processRowUpdate={(newRow) => save(newRow)}
  initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}  // 무료 버전은 100행이 최대
/>`}
      >
        <RowCountPicker count={count} renderMs={renderMs} onChange={change} />
        <div style={{ height: 520 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            showToolbar
            density="compact"
            rowSelectionModel={selection}
            onRowSelectionModelChange={setSelection}
            initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
            pageSizeOptions={[25, 50, 100]}
            localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
            processRowUpdate={(newRow, oldRow) => {
              if (newRow.progress < 0 || newRow.progress > 100) return oldRow;
              const changed = (Object.keys(newRow) as (keyof SampleRow)[]).filter((k) => newRow[k] !== oldRow[k]);
              changed.forEach((k) => setLog((l) => [`편집: 번호 ${newRow.id} ${k} → ${newRow[k]}`, ...l].slice(0, 5)));
              return newRow;
            }}
          />
        </div>
        <ValueView value={{ checked: selected.length > 10 ? `${selected.length}개 선택` : selected, log }} />
      </DemoSection>
    </DemoPage>
  );
}
