"use client";

import { useMemo, useRef, useState } from "react";
import { RevoGrid, type ColumnRegular, type ExportFilePlugin } from "@revolist/react-datagrid";
import { Button } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { makeRows, won, RowCountPicker, useRowCount, type SampleRow } from "./grid-sample";

const pct = (v: unknown) => (v === "" || v == null ? "" : `${v}%`);

export default function RevoGridDemo() {
  const { count, renderMs, change } = useRowCount();
  const rows = useMemo(() => makeRows(count), [count]);
  const gridRef = useRef<HTMLRevoGridElement>(null);
  const [grouped, setGrouped] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  // 편집하면 합계가 바뀌도록 갱신 신호
  const [version, setVersion] = useState(0);

  const columns = useMemo<ColumnRegular[]>(
    () => [
      { prop: "id", name: "번호", size: 80, sortable: true, readonly: true, pin: "colPinStart" },
      { prop: "name", name: "작업명", size: 160, sortable: true, filter: true, pin: "colPinStart" },
      { prop: "dept", name: "부서", size: 110, sortable: true, filter: true, readonly: true },
      { prop: "owner", name: "담당자", size: 110, sortable: true, filter: true },
      { prop: "status", name: "상태", size: 110, sortable: true, filter: true },
      {
        prop: "progress",
        name: "진행률",
        size: 100,
        sortable: true,
        filter: "number",
        cellTemplate: (h, { value }) => h("span", { style: { float: "right" } }, pct(value)),
      },
      {
        prop: "cost",
        name: "비용(원)",
        size: 130,
        sortable: true,
        filter: "number",
        readonly: true,
        cellTemplate: (h, { value }) => h("span", { style: { float: "right" } }, won(value)),
      },
      { prop: "due", name: "마감일", size: 130, sortable: true, filter: true },
    ],
    [],
  );

  // 하단 고정 합계 행
  const summary = useMemo(() => {
    void version;
    const sum = rows.reduce((s, r) => s + r.cost, 0);
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length) : 0;
    return [{ name: "합계", progress: `평균 ${avg}`, cost: sum } as unknown as SampleRow];
  }, [rows, version]);

  const exportCsv = async () => {
    const plugins = await gridRef.current?.getPlugins();
    const exporter = plugins?.find((p) => "exportFile" in p) as ExportFilePlugin | undefined;
    await exporter?.exportFile({ filename: "revogrid-test" });
  };

  return (
    <DemoPage
      title="RevoGrid 테스트"
      description="웹 컴포넌트 기반 MIT 그리드 (@revolist/react-datagrid). 가상 스크롤이 가로·세로 모두 적용돼 대용량에 강합니다."
    >
      <DemoSection
        title="대용량 + 편집 + 정렬/필터 + 그룹 + 하단 합계 + CSV"
        description="헤더 클릭: 정렬 / 헤더의 필터 아이콘: 조건 필터 / 셀 더블클릭(또는 바로 입력): 편집 / 셀 범위를 끌어 선택, 오른쪽 아래 점을 끌어 채우기"
        code={`<RevoGrid
  source={rows}
  columns={[{ prop: "name", name: "작업명", sortable: true, filter: true, pin: "colPinStart" }, ...]}
  pinnedBottomSource={[{ name: "합계", cost: sum }]}
  grouping={{ props: ["dept"] }}
  filter range resize rowHeaders exporting
  onAfteredit={(e) => save(e.detail)}
/>`}
      >
        <RowCountPicker count={count} renderMs={renderMs} options={[1000, 10000, 100000, 1000000]} onChange={change}>
          <Button size="sm" variant="secondary" onClick={() => setGrouped((g) => !g)}>
            {grouped ? "그룹 해제" : "부서별 그룹"}
          </Button>
          <Button size="sm" variant="secondary" onClick={exportCsv}>
            CSV 내보내기
          </Button>
        </RowCountPicker>
        <div style={{ height: 480 }}>
          <RevoGrid
            ref={gridRef}
            source={rows}
            columns={columns}
            pinnedBottomSource={summary}
            grouping={grouped ? { props: ["dept"], expandedAll: true } : undefined}
            filter
            range
            resize
            rowHeaders
            exporting
            canMoveColumns
            theme="compact"
            onBeforeedit={(e) => {
              const d = e.detail as { prop: string; val: unknown };
              if (d.prop === "progress") {
                const n = Number(d.val);
                if (!Number.isFinite(n) || n < 0 || n > 100) e.preventDefault();
                else d.val = n;
              }
            }}
            onAfteredit={(e) => {
              const d = e.detail as { prop?: string; val?: unknown; model?: SampleRow };
              if (d.model) setLog((l) => [`편집: 번호 ${d.model!.id} ${d.prop} → ${String(d.val)}`, ...l].slice(0, 5));
              setVersion((v) => v + 1);
            }}
          />
        </div>
        <ValueView value={{ log }} />
      </DemoSection>
    </DemoPage>
  );
}
