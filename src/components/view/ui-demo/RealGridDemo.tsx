"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import RealGrid, { GridFitStyle, ValueType, type GridView, type LocalDataProvider } from "realgrid";
import { RGDataColumn, RealGridReact, RealTreeReact } from "realgrid-react";
import "realgrid/dist/realgrid-style.css";
import { Button } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

const LICENSE = process.env.NEXT_PUBLIC_REALGRID_LICENSE ?? "";
if (LICENSE) RealGrid.setLicenseKey(LICENSE);

const OWNERS = ["김민준", "이서연", "박지훈", "최수아"];
const STATUSES = ["대기", "진행 중", "검토", "완료"];
const DEPTS = ["개발팀", "디자인팀", "기획팀", "운영팀"];

interface Row {
  id: number;
  name: string;
  dept: string;
  owner: string;
  status: string;
  progress: number;
  cost: number;
  due: string;
}

/** TOAST UI Grid 데모와 같은 데이터 (비교용) */
function makeRows(count: number): Row[] {
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

const TREE_ROWS = [
  { path: "1", name: "본사", head: 3 },
  { path: "1.1", name: "개발팀", head: 12 },
  { path: "1.1.1", name: "프론트엔드", head: 5 },
  { path: "1.1.2", name: "백엔드", head: 7 },
  { path: "1.2", name: "디자인팀", head: 4 },
  { path: "2", name: "지사", head: 2 },
  { path: "2.1", name: "영업팀", head: 6 },
];

/** 라이선스가 잘못되면 RealGrid 가 생성 시 예외를 던져 페이지 전체가 깨지므로, 그리드 영역만 오류 안내로 바꿈 */
class GridErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        RealGrid 를 만들지 못했습니다: {this.state.error.message}
        <br />
        NEXT_PUBLIC_REALGRID_LICENSE 값과 키를 발급받은 도메인을 확인하세요.
      </p>
    );
  }
}

const LicenseNotice = () => (
  <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    RealGrid2 라이선스 키가 없어 그리드를 표시하지 않습니다. https://service.realgrid.com/start 에서 개발용 키를 받아
    .env.local 의 NEXT_PUBLIC_REALGRID_LICENSE 에 넣고 서버를 다시 실행하세요.
  </p>
);

export default function RealGridDemo() {
  if (!LICENSE) {
    return (
      <DemoPage title="RealGrid2 테스트" description="공식 realgrid-react 래퍼로 React 19 / Next.js 에서 동작을 확인합니다.">
        <LicenseNotice />
      </DemoPage>
    );
  }
  return (
    <GridErrorBoundary>
      <RealGridDemoBody />
    </GridErrorBoundary>
  );
}

function RealGridDemoBody() {
  const [count, setCount] = useState(10000);
  const rows = useMemo(() => makeRows(count), [count]);
  const gridRef = useRef<GridView | null>(null);
  const [grouped, setGrouped] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const started = useRef(0);

  useEffect(() => {
    started.current = performance.now();
  }, []);
  // rows 가 바뀐 뒤 그리드가 다시 그려지면 걸린 시간 표시
  useEffect(() => {
    const id = requestAnimationFrame(() => setRenderMs(performance.now() - started.current));
    return () => cancelAnimationFrame(id);
  }, [rows]);

  const pushLog = (msg: string) => setLog((l) => [msg, ...l].slice(0, 5));
  const readChecked = (grid: GridView) =>
    setChecked(grid.getCheckedRows().map((r) => Number((grid.getDataSource() as LocalDataProvider).getValue(r, "id"))));

  const exportExcel = async () => {
    const { default: JSZip } = await import("jszip");
    gridRef.current?.exportGrid({ type: "excel", target: "local", fileName: "realgrid-test.xlsx", zip: JSZip });
  };

  const toggleGroup = () => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.groupBy(grouped ? [] : ["dept"]);
    setGrouped(!grouped);
  };

  return (
    <DemoPage
      title="RealGrid2 테스트"
      description="공식 realgrid-react 래퍼로 React 19 / Next.js 에서 동작을 확인합니다. 데이터는 TOAST UI Grid 테스트와 같습니다."
    >
      <DemoSection
        title="대용량 + 편집 + 정렬/필터 + 그룹 + 합계 + 엑셀"
        description="헤더 클릭: 정렬 / 필터 아이콘: 값 목록 필터 / 셀 더블클릭: 편집 / 맨 앞 체크박스: 선택 / 컬럼 헤더를 위 그룹 영역으로 끌면 그룹핑"
        code={`<RealGridReact rows={rows} autoGenerateField onInitialized={(grid) => (gridRef.current = grid)}>
  <RGDataColumn name="name" fieldName="name" header={{ text: "작업명" }} autoFilter />
  <RGDataColumn name="owner" fieldName="owner" editor={{ type: "dropdown", values: OWNERS }} />
  <RGDataColumn name="cost" fieldName="cost" field={{ fieldName: "cost", dataType: ValueType.NUMBER }}
    numberFormat="#,##0" footer={{ expression: "sum", numberFormat: "#,##0" }} />
</RealGridReact>
// 엑셀: grid.exportGrid({ type: "excel", target: "local", zip: JSZip })`}
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
            <Button size="sm" variant="secondary" onClick={toggleGroup}>
              {grouped ? "그룹 해제" : "부서별 그룹"}
            </Button>
            <Button size="sm" variant="secondary" onClick={exportExcel}>
              엑셀 내보내기
            </Button>
          </div>
        </div>
        <div style={{ height: 480 }}>
          <RealGridReact
            rows={rows}
            autoGenerateField
            onInitialized={(grid) => {
              gridRef.current = grid;
              grid.groupPanel.visible = true;
              grid.footer.visible = true;
              grid.displayOptions.fitStyle = GridFitStyle.EVEN_FILL;
              grid.setFixedOptions({ colCount: 2 });
            }}
            onCellEdited={(grid, itemIndex, _row, field) => {
              grid.commit();
              const ds = grid.getDataSource() as LocalDataProvider;
              const dataRow = grid.getDataRow(itemIndex);
              pushLog(`편집: 번호 ${ds.getValue(dataRow, "id")} ${ds.getOrgFieldName(field)} → ${ds.getValue(dataRow, field)}`);
            }}
            onItemChecked={(grid) => readChecked(grid)}
            onItemAllChecked={(grid) => readChecked(grid)}
          >
            <RGDataColumn name="id" fieldName="id" field={{ fieldName: "id", dataType: ValueType.NUMBER }} header={{ text: "번호" }} width={80} editable={false} />
            <RGDataColumn name="name" fieldName="name" header={{ text: "작업명" }} width={160} />
            <RGDataColumn name="dept" fieldName="dept" header={{ text: "부서" }} width={110} autoFilter editable={false} />
            <RGDataColumn
              name="owner"
              fieldName="owner"
              header={{ text: "담당자" }}
              width={110}
              autoFilter
              editor={{ type: "dropdown", values: OWNERS, labels: OWNERS, domainOnly: true }}
            />
            <RGDataColumn
              name="status"
              fieldName="status"
              header={{ text: "상태" }}
              width={110}
              autoFilter
              editor={{ type: "dropdown", values: STATUSES, labels: STATUSES, domainOnly: true }}
            />
            <RGDataColumn
              name="progress"
              fieldName="progress"
              field={{ fieldName: "progress", dataType: ValueType.NUMBER }}
              header={{ text: "진행률" }}
              width={100}
              numberFormat="#,##0'%'"
              editor={{ type: "number", editFormat: "#,##0" }}
              footer={{ expression: "avg", numberFormat: "평균 #,##0'%'" }}
            />
            <RGDataColumn
              name="cost"
              fieldName="cost"
              field={{ fieldName: "cost", dataType: ValueType.NUMBER }}
              header={{ text: "비용(원)" }}
              width={130}
              numberFormat="#,##0"
              editable={false}
              footer={{ expression: "sum", numberFormat: "#,##0" }}
            />
            <RGDataColumn
              name="due"
              fieldName="due"
              field={{ fieldName: "due", dataType: ValueType.DATETIME, datetimeFormat: "yyyy-MM-dd" }}
              header={{ text: "마감일" }}
              width={130}
              datetimeFormat="yyyy-MM-dd"
              editor={{ type: "date", datetimeFormat: "yyyy-MM-dd" }}
            />
          </RealGridReact>
        </div>
        <ValueView value={{ checked: checked.length > 10 ? `${checked.length}개 선택` : checked, log }} />
      </DemoSection>

      <DemoSection title="트리" description="계층 데이터(path 로 구성). 왼쪽 아이콘으로 펼치기/접기.">
        <div style={{ height: 300 }}>
          <RealTreeReact
            rows={TREE_ROWS}
            autoGenerateField
            treeField="path"
            onInitialized={(tree) => {
              tree.displayOptions.fitStyle = GridFitStyle.EVEN_FILL;
              tree.expandAll();
            }}
          >
            <RGDataColumn name="name" fieldName="name" header={{ text: "조직" }} />
            <RGDataColumn name="head" fieldName="head" field={{ fieldName: "head", dataType: ValueType.NUMBER }} header={{ text: "인원" }} width={100} />
          </RealTreeReact>
        </div>
      </DemoSection>
    </DemoPage>
  );
}
