import Link from "next/link";
import { DemoPage, DemoSection } from "./Demo";

/**
 * 그리드 기능 비교표 (Syncfusion React Grid 기능 목록 기준).
 * 각 그리드는 "무료로 쓸 수 있는 범위" 로 평가 (RealGrid2·Syncfusion 은 상용 전체 기능),
 * 2026-11 시점 이 프로젝트 데모 + 각 라이브러리 문서.
 */

type Mark = "yes" | "part" | "diy" | "no";
interface Cell {
  m: Mark;
  note?: string;
}

const GRIDS = [
  { key: "sf", name: "Syncfusion", sub: "기준", href: null },
  { key: "ag", name: "AG Grid", sub: "Community", href: "/components/grid" },
  { key: "tui", name: "TOAST UI", sub: "Grid", href: "/components/tui-grid" },
  { key: "rg", name: "RealGrid2", sub: "상용", href: "/components/realgrid" },
  { key: "glide", name: "Glide", sub: "Data Grid", href: "/components/glide-grid" },
  { key: "revo", name: "RevoGrid", sub: "MIT", href: "/components/revogrid" },
  { key: "tab", name: "Tabulator", sub: "MIT", href: "/components/tabulator" },
  { key: "tan", name: "TanStack", sub: "Table v9", href: "/components/tanstack-table" },
  { key: "mui", name: "MUI X", sub: "무료 버전", href: "/components/mui-grid" },
] as const;
type GridKey = (typeof GRIDS)[number]["key"];
type Row = Record<GridKey, Cell>;

/** 표에 그대로 글자로 보여 줄 기본 정보 */
const INFO: { label: string; values: Record<GridKey, string> }[] = [
  {
    label: "라이선스",
    values: {
      sf: "상용 (조건부 무료¹)",
      ag: "MIT",
      tui: "MIT",
      rg: "상용 (개발 키 무료)",
      glide: "MIT",
      revo: "MIT",
      tab: "MIT",
      tan: "MIT",
      mui: "MIT (상위 버전 유료)",
    },
  },
  {
    label: "만든 곳",
    values: {
      sf: "Syncfusion (미국)",
      ag: "AG Grid (영국)",
      tui: "NHN (국내)",
      rg: "우리테크 (국내)",
      glide: "Glide (미국)",
      revo: "Revolist",
      tab: "오픈소스",
      tan: "TanStack",
      mui: "MUI",
    },
  },
  {
    label: "React 연동",
    values: {
      sf: "공식 컴포넌트",
      ag: "공식 래퍼",
      tui: "직접 래퍼²",
      rg: "공식 래퍼",
      glide: "React 컴포넌트³",
      revo: "공식 래퍼",
      tab: "직접 래퍼²",
      tan: "React 훅",
      mui: "React 컴포넌트",
    },
  },
  {
    label: "그리는 방식",
    values: { sf: "DOM", ag: "DOM", tui: "DOM", rg: "DOM", glide: "캔버스", revo: "DOM", tab: "DOM", tan: "직접 마크업", mui: "DOM" },
  },
  {
    label: "렌더 시간 (측정)",
    values: {
      sf: "미측정",
      ag: "미측정",
      tui: "10만 행 0.7초",
      rg: "미측정",
      glide: "100만 행 0.6초",
      revo: "100만 행 0.6초",
      tab: "10만 행 0.45초",
      tan: "10만 행 0.27초",
      mui: "10만 행 0.29초⁴",
    },
  },
];

const y = (note?: string): Cell => ({ m: "yes", note });
const p = (note?: string): Cell => ({ m: "part", note });
const d = (note?: string): Cell => ({ m: "diy", note });
const n = (note?: string): Cell => ({ m: "no", note });
/** TanStack 은 화면이 없어 대부분 "로직만 제공" */
const logic = () => p("로직만");

/** 행 = Syncfusion React Grid(+TreeGrid) 가 제공하는 기능 목록 */
const FEATURES: { group: string; label: string; values: Row }[] = [
  // 데이터 표시
  {
    group: "데이터 표시",
    label: "페이징",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: d(), revo: d(), tab: y(), tan: logic(), mui: y() },
  },
  {
    group: "데이터 표시",
    label: "가상 스크롤 (대용량)",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: y(), revo: y(), tab: y(), tan: p("Virtual 로 직접"), mui: p("페이지당 100행 제한") },
  },
  {
    group: "데이터 표시",
    label: "서버 데이터 연동 / 무한 스크롤",
    values: { sf: y(), ag: y("무한 스크롤 방식"), tui: y("dataSource"), rg: d(), glide: p("필요한 행만 요청"), revo: d(), tab: y("ajax·단계 로딩"), tan: logic(), mui: p("서버 페이징만") },
  },
  // 정렬·필터·검색
  {
    group: "정렬·필터·검색",
    label: "정렬 (다중 컬럼)",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: d(), revo: y(), tab: y(), tan: logic(), mui: p("1개 컬럼만") },
  },
  {
    group: "정렬·필터·검색",
    label: "조건 필터 (필터 바·메뉴)",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: d(), revo: y(), tab: y(), tan: logic(), mui: p("조건 1개만") },
  },
  {
    group: "정렬·필터·검색",
    label: "엑셀식 값 목록 필터",
    values: { sf: y(), ag: n("Enterprise"), tui: y(), rg: y(), glide: n(), revo: n(), tab: y(), tan: p("faceting 로직"), mui: p("'값 중 하나' 조건") },
  },
  {
    group: "정렬·필터·검색",
    label: "전체 검색",
    values: { sf: y(), ag: y("quick filter"), tui: d(), rg: p("API 만"), glide: y(), revo: d(), tab: d(), tan: logic(), mui: y() },
  },
  // 그룹·집계
  {
    group: "그룹·집계",
    label: "행 그룹핑 (드래그 그룹 패널)",
    values: { sf: y(), ag: n("Enterprise"), tui: n(), rg: y(), glide: p("실험 기능"), revo: p("코드로만, 패널 없음"), tab: p("코드로만, 패널 없음"), tan: logic(), mui: n("Premium") },
  },
  {
    group: "그룹·집계",
    label: "하단 합계·평균",
    values: { sf: y(), ag: d("고정 행으로 직접"), tui: y(), rg: y(), glide: d(), revo: p("고정 행 + 계산 직접"), tab: y(), tan: logic(), mui: n("Premium") },
  },
  {
    group: "그룹·집계",
    label: "그룹별 합계",
    values: { sf: y(), ag: n("Enterprise"), tui: n(), rg: y(), glide: n(), revo: n(), tab: y(), tan: logic(), mui: n("Premium") },
  },
  // 편집
  {
    group: "편집",
    label: "셀·행 편집",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: y(), revo: y(), tab: y(), tan: d(), mui: y() },
  },
  {
    group: "편집",
    label: "편집기 종류 (드롭다운·날짜·숫자·체크)",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: p("별도 셀 패키지"), revo: p("플러그인"), tab: y(), tan: d(), mui: y() },
  },
  {
    group: "편집",
    label: "일괄 편집 (변경 추적·한 번에 저장/취소)",
    values: { sf: y(), ag: d(), tui: y("getModifiedRows"), rg: y("행 상태"), glide: d(), revo: d(), tab: p("편집 기록·되돌리기"), tan: d(), mui: d() },
  },
  // 선택·클립보드
  {
    group: "선택·클립보드",
    label: "체크박스 선택",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: y(), revo: d(), tab: y(), tan: logic(), mui: y() },
  },
  {
    group: "선택·클립보드",
    label: "셀 범위 선택",
    values: { sf: y(), ag: n("Enterprise"), tui: y(), rg: y(), glide: y(), revo: y(), tab: y(), tan: logic(), mui: n("Premium") },
  },
  {
    group: "선택·클립보드",
    label: "복사·붙여넣기",
    values: { sf: y(), ag: n("Enterprise"), tui: y(), rg: y(), glide: y(), revo: y(), tab: y(), tan: d(), mui: p("복사만") },
  },
  // 컬럼
  {
    group: "컬럼",
    label: "컬럼 고정",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: y(), revo: y(), tab: y(), tan: logic(), mui: n("Pro") },
  },
  {
    group: "컬럼",
    label: "컬럼 크기·순서 변경",
    values: { sf: y(), ag: y(), tui: p("크기만"), rg: y(), glide: y(), revo: y(), tab: y(), tan: logic(), mui: p("순서 변경 Pro") },
  },
  {
    group: "컬럼",
    label: "다단 헤더",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: p("그룹 헤더 1단"), revo: y(), tab: y(), tan: logic(), mui: y() },
  },
  {
    group: "컬럼",
    label: "컬럼 선택기·컬럼 메뉴",
    values: { sf: y(), ag: p("도구 패널 Enterprise"), tui: p("API 만"), rg: p("API 만"), glide: d(), revo: d(), tab: d(), tan: logic(), mui: y() },
  },
  // 계층
  {
    group: "계층",
    label: "트리 그리드",
    values: { sf: y("TreeGrid"), ag: n("Enterprise"), tui: y(), rg: y(), glide: n(), revo: n("Pro"), tab: y(), tan: logic(), mui: n("Pro") },
  },
  // 내보내기·기타
  {
    group: "내보내기·기타",
    label: "엑셀 (xlsx)",
    values: { sf: y(), ag: n("Enterprise"), tui: y(), rg: y("JSZip 필요"), glide: n(), revo: n(), tab: p("SheetJS 필요"), tan: n(), mui: n("Premium") },
  },
  {
    group: "내보내기·기타",
    label: "PDF",
    values: { sf: y(), ag: n(), tui: n(), rg: n(), glide: n(), revo: n(), tab: p("jsPDF 필요"), tan: n(), mui: n() },
  },
  {
    group: "내보내기·기타",
    label: "CSV",
    values: { sf: y(), ag: y(), tui: y(), rg: y(), glide: n(), revo: y(), tab: y(), tan: n(), mui: y() },
  },
  {
    group: "내보내기·기타",
    label: "인쇄",
    values: { sf: y(), ag: p("인쇄용 레이아웃"), tui: n(), rg: n(), glide: n(), revo: n(), tab: y(), tan: d(), mui: y() },
  },
  {
    group: "내보내기·기타",
    label: "컨텍스트 메뉴",
    values: { sf: y(), ag: n("Enterprise"), tui: y(), rg: y(), glide: d(), revo: d(), tab: y(), tan: d(), mui: d() },
  },
  {
    group: "내보내기·기타",
    label: "한국어 UI",
    values: { sf: y("번역 파일"), ag: y("locale 패키지"), tui: y(), rg: y(), glide: p("UI 글자 거의 없음"), revo: p("UI 글자 거의 없음"), tab: p("번역 직접 정의"), tan: p("UI 직접"), mui: y("koKR") },
  },
];

/** Syncfusion 기능 대비 커버율: ◎ 1점, ○ 0.5점 (△·✕ 0점) */
const SCORE = Object.fromEntries(
  GRIDS.map((g) => {
    const yes = FEATURES.filter((f) => f.values[g.key].m === "yes").length;
    const part = FEATURES.filter((f) => f.values[g.key].m === "part").length;
    return [g.key, { yes, part, pct: Math.round(((yes + part * 0.5) / FEATURES.length) * 100) }];
  }),
) as Record<GridKey, { yes: number; part: number; pct: number }>;

/** 정렬 기준 점수: ◎ 1점, ○ 0.5점 */
const POINT: Record<Mark, number> = { yes: 1, part: 0.5, diy: 0, no: 0 };

/** 열: Syncfusion(기준) 고정 + 나머지는 커버율 높은 순 (같으면 ◎ 많은 순) */
const SORTED_GRIDS = [
  GRIDS[0],
  ...GRIDS.slice(1).toSorted((a, b) => SCORE[b.key].pct - SCORE[a.key].pct || SCORE[b.key].yes - SCORE[a.key].yes),
];

/** 행: 분류 순서는 유지하고, 같은 분류 안에서 지원하는 그리드가 많은 기능부터 (Syncfusion 제외) */
const groupOrder = [...new Set(FEATURES.map((f) => f.group))];
const support = (f: (typeof FEATURES)[number]) => GRIDS.slice(1).reduce((sum, g) => sum + POINT[f.values[g.key].m], 0);
const SORTED_FEATURES = FEATURES.map((f, i) => ({ f, i, score: support(f) }))
  .toSorted((a, b) => groupOrder.indexOf(a.f.group) - groupOrder.indexOf(b.f.group) || b.score - a.score || a.i - b.i)
  .map(({ f, score }) => ({ ...f, score }));

const MARK: Record<Mark, { icon: string; label: string; className: string }> = {
  yes: { icon: "◎", label: "기본 제공", className: "text-blue-600" },
  part: { icon: "○", label: "일부 제공", className: "text-emerald-600" },
  diy: { icon: "△", label: "직접 구현", className: "text-amber-600" },
  no: { icon: "✕", label: "없음 / 유료", className: "text-gray-400" },
};

const PICKS = [
  { title: "Syncfusion 에 가장 가까운 무료", body: "Tabulator. 커버율이 무료 그리드 중 가장 높음 (그룹 패널·컬럼 선택기·검색 UI 는 직접)." },
  { title: "Syncfusion 을 그대로 쓰기", body: "조건(연매출 100만$ 미만·개발자 5명 이하)에 맞으면 Community 라이선스로 전체 기능 무료. 키를 받으면 데모로 붙여 볼 수 있음." },
  { title: "무료 + 100만 행 이상", body: "RevoGrid (기능 균형) 또는 Glide (가장 빠르지만 정렬·필터 직접 구현)." },
  { title: "디자인을 직접 맞춰야 함", body: "TanStack Table. 마크업을 전부 직접 만들어 Tailwind 디자인과 완전히 맞출 수 있음." },
  { title: "국내 상용 + 기술지원", body: "RealGrid2. 그룹·합계·엑셀·트리 모두 기본 제공, 국내 지원." },
  { title: "이미 쓰는 것 유지", body: "AG Grid Community. 기본기는 가장 탄탄하나 그룹·엑셀·트리는 Enterprise(유료)." },
];

function MarkCell({ cell }: { cell: Cell }) {
  const mk = MARK[cell.m];
  return (
    <td className="border-b border-gray-100 px-1 py-2 text-center align-top">
      <span className={`text-base font-semibold ${mk.className}`} title={mk.label}>
        {mk.icon}
      </span>
      {cell.note && <span className="mt-0.5 block text-[10px] leading-tight text-gray-500">{cell.note}</span>}
    </td>
  );
}

export default function GridCompare() {
  return (
    <DemoPage
      wide
      title="그리드 기능 비교표"
      description="Syncfusion React Grid 의 기능 목록을 기준으로, 프로젝트에 붙여 본 그리드 8종이 같은 기능을 얼마나 제공하는지 비교합니다. 각 그리드는 무료로 쓸 수 있는 범위 기준 (RealGrid2·Syncfusion 은 상용 전체 기능). 2026-11 기준."
    >
      <DemoSection title="Syncfusion 기준 기능 비교" description="행은 Syncfusion Grid 가 제공하는 기능입니다. 열은 Syncfusion 대비 커버율이 높은 순, 행은 같은 분류 안에서 지원하는 그리드가 많은 기능부터 정렬했습니다 (◎ 1점·○ 0.5점). 그리드 이름을 누르면 데모 화면으로 이동합니다.">
        <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-600">
          {Object.values(MARK).map((mk) => (
            <span key={mk.label}>
              <span className={`font-semibold ${mk.className}`}>{mk.icon}</span> {mk.label}
            </span>
          ))}
        </div>
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full table-fixed border-collapse text-xs break-keep [overflow-wrap:anywhere]">
            <colgroup>
              <col className="w-[15%]" />
              {SORTED_GRIDS.map((g) => (
                <col key={g.key} />
              ))}
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 px-2 py-2 text-left text-sm font-semibold">항목</th>
                {SORTED_GRIDS.map((g, rank) => (
                  <th key={g.key} className="border-b border-gray-200 px-1 py-2 text-center text-[13px] font-semibold">
                    <span className="mb-0.5 block text-[11px] font-normal text-gray-400">{rank === 0 ? "기준" : `${rank}위`}</span>
                    {g.href ? (
                      <Link href={g.href} className="text-blue-600 hover:underline">
                        {g.name}
                      </Link>
                    ) : (
                      <span className="text-gray-900">{g.name}</span>
                    )}
                    <span className="block text-[11px] font-normal text-gray-500">{g.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INFO.map((row) => (
                <tr key={row.label}>
                  <th className="border-b border-gray-100 px-2 py-2 text-left font-medium">{row.label}</th>
                  {SORTED_GRIDS.map((g) => (
                    <td key={g.key} className="border-b border-gray-100 px-1 py-2 text-center text-gray-700">
                      {row.values[g.key]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-blue-50/60">
                <th className="border-b border-gray-200 px-2 py-2 text-left font-semibold">
                  Syncfusion 대비 커버율
                  <span className="block text-[11px] font-normal text-gray-500">◎ 1점 · ○ 0.5점</span>
                </th>
                {SORTED_GRIDS.map((g) => (
                  <td key={g.key} className="border-b border-gray-200 px-1 py-2 text-center">
                    <span className="text-base font-bold text-gray-900">{SCORE[g.key].pct}%</span>
                    <span className="block text-[11px] text-gray-500">
                      ◎{SCORE[g.key].yes} ○{SCORE[g.key].part} / {FEATURES.length}
                    </span>
                  </td>
                ))}
              </tr>
              {SORTED_FEATURES.map((row, i) => {
                const header = row.group !== SORTED_FEATURES[i - 1]?.group;
                return [
                  header && (
                    <tr key={`g-${row.group}`} className="bg-gray-50">
                      <th colSpan={SORTED_GRIDS.length + 1} className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500">
                        {row.group}
                      </th>
                    </tr>
                  ),
                  <tr key={row.label}>
                    <th className="border-b border-gray-100 px-2 py-2 text-left font-medium">
                      {row.label}
                      <span className="block text-[11px] font-normal text-gray-500">
                        지원 {row.score} / {SORTED_GRIDS.length - 1}
                      </span>
                    </th>
                    {SORTED_GRIDS.map((g) => (
                      <MarkCell key={g.key} cell={row.values[g.key]} />
                    ))}
                  </tr>,
                ];
              })}
            </tbody>
          </table>
        </div>
        <ol className="mt-3 space-y-0.5 text-xs text-gray-500">
          <li>¹ Syncfusion Community 라이선스: 연매출 100만 달러 미만, 개발자 5명 이하면 무료.</li>
          <li>² 공식 React 래퍼가 React 17 에서 멈춰 있어 본체를 직접 감쌈.</li>
          <li>³ 공식 지원은 React 18 까지지만 React 19 에서 동작 확인.</li>
          <li>⁴ MUI X 무료 버전은 한 페이지 최대 100행 (그 이상은 Pro).</li>
        </ol>
        <p className="mt-2 text-xs text-gray-500">
          ※ 렌더 시간은 이 프로젝트 데모에서 같은 데이터로 잰 대략값입니다 (헤드리스 Chromium, 운영 빌드). RealGrid2 는 라이선스 키가 없어 화면 동작은
          확인하지 못했고, Syncfusion 은 이 프로젝트에 데모가 없어 둘 다 문서 기준입니다. 유료 버전 조건은 바뀔 수 있으니 도입 전 각 사이트에서 다시 확인하세요.
        </p>
      </DemoSection>

      <DemoSection title="상황별 추천">
        <ul className="grid gap-3 md:grid-cols-2">
          {PICKS.map((pick) => (
            <li key={pick.title} className="rounded border border-gray-200 p-3">
              <p className="font-semibold">{pick.title}</p>
              <p className="mt-1 text-sm text-gray-600">{pick.body}</p>
            </li>
          ))}
        </ul>
      </DemoSection>
    </DemoPage>
  );
}
