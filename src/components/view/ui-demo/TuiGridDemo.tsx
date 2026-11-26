"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TuiGrid, { type TuiGridInstance } from "@/components/ui/tui-grid/TuiGrid";
import type { OptColumn, OptRow } from "tui-grid/types/options";
import { Button } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

const OWNERS = ["김민준", "이서연", "박지훈", "최수아"];
const STATUSES = ["대기", "진행 중", "검토", "완료"];
const DEPTS = ["개발팀", "디자인팀", "기획팀", "운영팀"];

/** 대용량 테스트용 행 생성 (같은 결과가 나오도록 단순 계산식 사용) */
function makeRows(count: number): OptRow[] {
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

const listItems = (values: string[]) => values.map((v) => ({ text: v, value: v }));
const won = (v: unknown) => (typeof v === "number" ? v.toLocaleString("ko-KR") : String(v ?? ""));

const TREE_DATA: OptRow[] = [
  {
    name: "본사",
    head: 3,
    _attributes: { expanded: true },
    _children: [
      { name: "개발팀", head: 12, _children: [{ name: "프론트엔드", head: 5 }, { name: "백엔드", head: 7 }] },
      { name: "디자인팀", head: 4 },
    ],
  },
  { name: "지사", head: 2, _children: [{ name: "영업팀", head: 6 }] },
];

export default function TuiGridDemo() {
  const [count, setCount] = useState(10000);
  const rows = useMemo(() => makeRows(count), [count]);
  const gridRef = useRef<TuiGridInstance | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const started = useRef(0);
  useEffect(() => {
    started.current = performance.now();
  }, []);

  const columns = useMemo<OptColumn[]>(
    () => [
      { name: "id", header: "번호", width: 80, align: "right", sortable: true },
      { name: "name", header: "작업명", minWidth: 160, editor: "text", sortable: true, filter: "text" },
      { name: "dept", header: "부서", width: 110, filter: "select", sortable: true },
      {
        name: "owner",
        header: "담당자",
        width: 110,
        editor: { type: "select", options: { listItems: listItems(OWNERS) } },
        formatter: "listItemText",
        filter: "select",
      },
      {
        name: "status",
        header: "상태",
        width: 110,
        editor: { type: "select", options: { listItems: listItems(STATUSES) } },
        formatter: "listItemText",
        filter: "select",
      },
      {
        name: "progress",
        header: "진행률",
        width: 100,
        align: "right",
        editor: "text",
        sortable: true,
        filter: "number",
        formatter: ({ value }) => `${value}%`,
        validation: { dataType: "number", min: 0, max: 100 },
      },
      {
        name: "cost",
        header: "비용(원)",
        width: 130,
        align: "right",
        sortable: true,
        filter: "number",
        formatter: ({ value }) => won(value),
      },
      {
        name: "due",
        header: "마감일",
        width: 130,
        editor: { type: "datePicker", options: { format: "yyyy-MM-dd" } },
        sortable: true,
        filter: { type: "date", format: "yyyy-MM-dd" },
      },
    ],
    [],
  );

  const pushLog = (msg: string) => setLog((l) => [msg, ...l].slice(0, 5));

  return (
    <DemoPage
      title="TOAST UI Grid 테스트"
      description="tui-grid 4.x 를 직접 감싼 래퍼(TuiGrid)로 React 19 / Next.js 에서 동작을 확인합니다. 기존 AG Grid(DataGrid)와는 별개입니다."
    >
      <DemoSection
        title="대용량 + 편집 + 정렬/필터 + 합계 + 엑셀"
        description="헤더 클릭: 정렬 / 깔때기 아이콘: 필터 / 셀 더블클릭: 편집 / 맨 앞 체크박스: 선택 / 행 번호 칸을 끌면 순서 변경"
        code={`<TuiGrid
  data={rows}
  columns={[{ name: "name", header: "작업명", editor: "text", sortable: true, filter: "text" }, ...]}
  rowHeaders={["checkbox", "rowNum"]}
  bodyHeight={420}
  draggable
  summary={{ position: "bottom", columnContent: { cost: { template: (v) => \`합계 \${v.sum}\` } } }}
  events={{ afterChange: (ev) => save(ev.changes) }}
  onReady={(grid) => (gridRef.current = grid)}   // grid.export("xlsx") 등 직접 호출
/>`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {[1000, 10000, 100000].map((n) => (
            <Button
              key={n}
              size="sm"
              variant={n === count ? "primary" : "secondary"}
              onClick={() => {
                started.current = performance.now();
                setRenderMs(null);
                setCount(n);
              }}
            >
              {n.toLocaleString()}행
            </Button>
          ))}
          <span className="text-sm text-gray-600">{renderMs != null && `렌더 ${renderMs.toFixed(0)}ms`}</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => gridRef.current?.export("xlsx", { fileName: "tui-grid-test" })}>
              엑셀 내보내기
            </Button>
            <Button size="sm" variant="secondary" onClick={() => gridRef.current?.export("csv", { fileName: "tui-grid-test" })}>
              CSV 내보내기
            </Button>
          </div>
        </div>
        <TuiGrid
          data={rows}
          columns={columns}
          rowHeaders={["checkbox", "rowNum"]}
          bodyHeight={420}
          draggable
          columnOptions={{ resizable: true, frozenCount: 2 }}
          summary={{
            height: 36,
            position: "bottom",
            columnContent: {
              progress: { template: (v) => `평균 ${Math.round(v.avg)}%` },
              cost: { template: (v) => `합계 ${won(v.sum)}` },
            },
          }}
          onReady={(grid) => {
            gridRef.current = grid;
            requestAnimationFrame(() => setRenderMs(performance.now() - started.current));
          }}
          onGridUpdated={() => setRenderMs(performance.now() - started.current)}
          events={{
            afterChange: (ev) => {
              const changes = (ev as unknown as { changes: { rowKey: number; columnName: string; value: unknown }[] }).changes;
              changes.forEach((c) =>
                pushLog(`편집: 번호 ${gridRef.current?.getValue(c.rowKey, "id")} ${c.columnName} → ${String(c.value)}`),
              );
            },
            check: () => setChecked(gridRef.current?.getCheckedRows().map((r) => Number(r.id)) ?? []),
            uncheck: () => setChecked(gridRef.current?.getCheckedRows().map((r) => Number(r.id)) ?? []),
            checkAll: () => setChecked(gridRef.current?.getCheckedRows().map((r) => Number(r.id)) ?? []),
            uncheckAll: () => setChecked([]),
            drop: () => pushLog("행 순서 변경"),
          }}
        />
        <ValueView value={{ checked: checked.length > 10 ? `${checked.length}개 선택` : checked, log }} />
      </DemoSection>

      <DemoSection title="트리" description="계층 데이터. 화살표로 펼치기/접기, 부모를 체크하면 자식도 함께 체크됩니다.">
        <TuiGrid
          data={TREE_DATA}
          columns={[
            { name: "name", header: "조직" },
            { name: "head", header: "인원", width: 100, align: "right" },
          ]}
          rowHeaders={["checkbox"]}
          treeColumnOptions={{ name: "name", useCascadingCheckbox: true }}
          bodyHeight="auto"
        />
      </DemoSection>
    </DemoPage>
  );
}
