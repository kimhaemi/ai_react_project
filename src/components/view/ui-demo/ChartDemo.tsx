"use client";

import { Chart, type ChartRow } from "@/components/ui/chart";
import { DemoPage, DemoSection } from "./Demo";

const MONTHLY: ChartRow[] = [
  { month: "1월", pc: 4200, mobile: 6100 },
  { month: "2월", pc: 3900, mobile: 6600 },
  { month: "3월", pc: 4600, mobile: 7400 },
  { month: "4월", pc: 4400, mobile: 8100 },
  { month: "5월", pc: 4800, mobile: 8900 },
  { month: "6월", pc: 5100, mobile: 9800 },
  { month: "7월", pc: 4700, mobile: 10400 },
  { month: "8월", pc: 4500, mobile: 11200 },
  { month: "9월", pc: 5200, mobile: 11900 },
  { month: "10월", pc: 5600, mobile: 12700 },
  { month: "11월", pc: 5900, mobile: 13500 },
  { month: "12월", pc: 6300, mobile: 14800 },
];

const QUARTER: ChartRow[] = [
  { quarter: "1분기", y2025: 320, y2026: 410 },
  { quarter: "2분기", y2025: 380, y2026: 455 },
  { quarter: "3분기", y2025: 350, y2026: 498 },
  { quarter: "4분기", y2025: 420, y2026: 530 },
];

const CHANNEL: ChartRow[] = [
  { month: "7월", search: 520, sns: 310, direct: 180 },
  { month: "8월", search: 560, sns: 340, direct: 190 },
  { month: "9월", search: 590, sns: 420, direct: 205 },
  { month: "10월", search: 610, sns: 460, direct: 220 },
  { month: "11월", search: 640, sns: 510, direct: 240 },
];

const TOP_MENU: ChartRow[] = [
  { menu: "공지사항", views: 1820 },
  { menu: "자료실", views: 1240 },
  { menu: "사용자 목록", views: 860 },
  { menu: "권한 관리", views: 420 },
  { menu: "환경 설정", views: 260 },
];

export default function ChartDemo() {
  return (
    <DemoPage
      title="Chart"
      description="선, 면적, 막대(묶음/누적/가로) 차트입니다. 마우스를 올리면 툴팁이 나오고, 모든 차트는 '표로 보기'와 CSV 저장을 지원합니다."
    >
      <DemoSection
        title="선 차트"
        description="시리즈 2개 이상이면 범례가 자동으로 표시됩니다. endLabels 로 마지막 값을 표시합니다."
        code={`<Chart type="line" title="월별 방문자" data={rows} xKey="month" xLabel="월"
  series={[{ key: "pc", name: "PC" }, { key: "mobile", name: "모바일" }]} unit="명" endLabels csvFileName="방문자" />`}
      >
        <Chart
          type="line"
          title="월별 방문자 수"
          description="2026년, 기기별"
          data={MONTHLY}
          xKey="month"
          xLabel="월"
          series={[
            { key: "pc", name: "PC" },
            { key: "mobile", name: "모바일" },
          ]}
          unit="명"
          endLabels
          csvFileName="월별-방문자"
        />
      </DemoSection>

      <DemoSection title="면적 차트 (단일 시리즈)" description="시리즈가 하나면 범례 없이 제목으로 설명합니다." code={`<Chart type="area" ... series={[{ key: "mobile", name: "모바일" }]} />`}>
        <Chart type="area" title="모바일 방문자 추이" data={MONTHLY} xKey="month" xLabel="월" series={[{ key: "mobile", name: "모바일" }]} unit="명" height={240} />
      </DemoSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DemoSection title="막대 차트 (묶음)" code={`<Chart type="bar" ... showValues />`}>
          <Chart
            type="bar"
            title="분기별 매출 비교"
            description="단위: 백만 원"
            data={QUARTER}
            xKey="quarter"
            xLabel="분기"
            series={[
              { key: "y2025", name: "2025년" },
              { key: "y2026", name: "2026년" },
            ]}
            showValues
            height={260}
          />
        </DemoSection>

        <DemoSection title="막대 차트 (누적)" code={`<Chart type="bar" stacked ... />`}>
          <Chart
            type="bar"
            stacked
            title="유입 경로별 방문"
            data={CHANNEL}
            xKey="month"
            xLabel="월"
            series={[
              { key: "search", name: "검색" },
              { key: "sns", name: "SNS" },
              { key: "direct", name: "직접 방문" },
            ]}
            unit="명"
            showValues
            height={260}
          />
        </DemoSection>
      </div>

      <DemoSection title="가로 막대 (순위)" code={`<Chart type="bar" horizontal showValues ... />`}>
        <Chart
          type="bar"
          horizontal
          title="메뉴별 조회수 TOP 5"
          data={TOP_MENU}
          xKey="menu"
          xLabel="메뉴"
          series={[{ key: "views", name: "조회수" }]}
          unit="회"
          showValues
          height={240}
          csvFileName="메뉴별-조회수"
        />
      </DemoSection>
    </DemoPage>
  );
}
