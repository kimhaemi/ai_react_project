"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/download";
import { useI18n } from "@/i18n/I18nProvider";
import { CHART_TOKENS as T, SERIES_COLORS } from "./palette";

export interface ChartSeries {
  /** data 의 값 키 */
  key: string;
  /** 범례/툴팁에 표시할 이름 */
  name: string;
  /** 색상 순번 (0부터). 지정하지 않으면 series 배열 순서 */
  colorIndex?: number;
}

export type ChartRow = Record<string, string | number | null>;

export interface ChartProps {
  type: "line" | "area" | "bar";
  title: ReactNode;
  description?: ReactNode;
  data: ChartRow[];
  /** x축(분류) 키 */
  xKey: string;
  /** x축 이름 (표 보기/CSV 머리글, 기본 xKey) */
  xLabel?: string;
  series: ChartSeries[];
  height?: number;
  /** 값 단위 (툴팁/표에 붙음, 예: "명", "원") */
  unit?: string;
  /** 막대: 누적 */
  stacked?: boolean;
  /** 막대: 가로 막대 */
  horizontal?: boolean;
  /** 막대 끝에 값 표시 (막대 수가 적을 때만 권장) */
  showValues?: boolean;
  /** 선: 마지막 지점에 값 표시 */
  endLabels?: boolean;
  /** CSV 저장 파일 이름 (지정하면 CSV 버튼 표시) */
  csvFileName?: string;
  className?: string;
}

const colorOf = (s: ChartSeries, i: number) => SERIES_COLORS[(s.colorIndex ?? i) % SERIES_COLORS.length];

function useFormatters(unit?: string) {
  const { lang } = useI18n();
  return useMemo(() => {
    const full = new Intl.NumberFormat(lang);
    const compact = new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 });
    return {
      value: (v: unknown) => (typeof v === "number" ? `${full.format(v)}${unit ?? ""}` : "-"),
      /** 축 눈금: 10,000 이상이 있으면 축약 (10K / 1만) */
      tick: (max: number) => (v: number) => (max >= 10000 ? compact.format(v) : full.format(v)),
    };
  }, [lang, unit]);
}

/** 공통 차트 (선 / 면적 / 막대). 범례, 툴팁, 표 보기, CSV 저장 포함 */
export function Chart({
  type,
  title,
  description,
  data,
  xKey,
  xLabel,
  series,
  height = 300,
  unit,
  stacked,
  horizontal,
  showValues,
  endLabels,
  csvFileName,
  className,
}: ChartProps) {
  const { t } = useI18n();
  const titleId = useId();
  const [view, setView] = useState<"chart" | "table">("chart");
  const fmt = useFormatters(unit);

  const max = useMemo(() => {
    let m = 0;
    for (const row of data) {
      const vals = series.map((s) => Number(row[s.key]) || 0);
      m = Math.max(m, stacked ? vals.reduce((a, b) => a + b, 0) : Math.max(0, ...vals));
    }
    return m;
  }, [data, series, stacked]);

  const exportCsv = () =>
    downloadCsv(csvFileName!, [[xLabel ?? xKey, ...series.map((s) => s.name)], ...data.map((r) => [r[xKey], ...series.map((s) => r[s.key])])]);

  const axisTick = { fill: T.muted, fontSize: 12 };
  const valueAxis = {
    tickFormatter: fmt.tick(max),
    tick: axisTick,
    tickLine: false,
    axisLine: false,
    width: 48,
    allowDecimals: false,
  } as const;
  const categoryAxis = {
    dataKey: xKey,
    tick: axisTick,
    tickLine: false,
    axisLine: { stroke: T.axis },
    interval: "preserveStartEnd",
    minTickGap: 12,
  } as const;

  const tooltip = (
    <Tooltip
      cursor={type === "bar" ? { fill: T.hover } : { stroke: T.axis, strokeWidth: 1 }}
      content={(p: TooltipContentProps) => (
        <ChartTooltip {...p} series={series} type={type} format={fmt.value} total={stacked ? t("ui.chart.total") : undefined} />
      )}
      isAnimationActive={false}
    />
  );

  return (
    <figure aria-labelledby={titleId} className={cn("flex flex-col rounded-lg border border-gray-200 bg-white", className)}>
      <figcaption className="flex flex-wrap items-start gap-3 px-5 pt-4">
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="font-semibold text-gray-900">
            {title}
          </h3>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setView(view === "chart" ? "table" : "chart")}
            aria-pressed={view === "table"}
            className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            {view === "chart" ? t("ui.chart.showTable") : t("ui.chart.showChart")}
          </button>
          {csvFileName && (
            <button type="button" onClick={exportCsv} className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
              CSV
            </button>
          )}
        </div>
      </figcaption>

      {/* 범례: 시리즈가 2개 이상일 때만 */}
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-5 pt-2 text-xs text-gray-600">
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5">
              {type === "bar" ? (
                <span className="size-2.5 rounded-sm" style={{ background: colorOf(s, i) }} />
              ) : (
                <span className="h-0.5 w-3 rounded-full" style={{ background: colorOf(s, i) }} />
              )}
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div className="px-2 pt-3 pb-3">
        {view === "table" ? (
          <ChartTable data={data} xKey={xKey} xLabel={xLabel ?? xKey} series={series} format={fmt.value} height={height} />
        ) : (
          <div style={{ height }} role="img" aria-label={typeof title === "string" ? title : undefined}>
            <ResponsiveContainer width="100%" height="100%">
              {type === "bar" ? (
                <BarChart
                  data={data}
                  layout={horizontal ? "vertical" : "horizontal"}
                  margin={{ top: showValues ? 20 : 8, right: showValues && horizontal ? 48 : 16, bottom: 0, left: 0 }}
                  barGap={2}
                  barCategoryGap="24%"
                >
                  <CartesianGrid stroke={T.grid} vertical={!!horizontal} horizontal={!horizontal} />
                  {horizontal ? (
                    <>
                      <XAxis type="number" {...valueAxis} />
                      <YAxis type="category" {...categoryAxis} axisLine={{ stroke: T.axis }} width={80} />
                    </>
                  ) : (
                    <>
                      <XAxis {...categoryAxis} />
                      <YAxis {...valueAxis} />
                    </>
                  )}
                  {tooltip}
                  {series.map((s, i) => {
                    // 둥근 모서리는 데이터 끝(바깥쪽)에만. 누적이면 맨 위 조각만
                    const isEnd = !stacked || i === series.length - 1;
                    const r = 4;
                    const radius: [number, number, number, number] = !isEnd ? [0, 0, 0, 0] : horizontal ? [0, r, r, 0] : [r, r, 0, 0];
                    return (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.name}
                        fill={colorOf(s, i)}
                        radius={radius}
                        maxBarSize={24}
                        stackId={stacked ? "stack" : undefined}
                        // 누적 조각 사이 2px 간격 (배경색)
                        stroke={stacked ? T.surface : undefined}
                        strokeWidth={stacked ? 2 : 0}
                        isAnimationActive={false}
                      >
                        {showValues && isEnd && (
                          <LabelList
                            dataKey={stacked ? undefined : s.key}
                            position={horizontal ? "right" : "top"}
                            fill={T.textSecondary}
                            fontSize={12}
                            formatter={(v: unknown) => (typeof v === "number" ? fmt.tick(max)(v) : "")}
                            valueAccessor={
                              stacked
                                ? (entry: { payload?: ChartRow }) =>
                                    series.reduce((sum, x) => sum + (Number(entry.payload?.[x.key]) || 0), 0)
                                : undefined
                            }
                          />
                        )}
                      </Bar>
                    );
                  })}
                </BarChart>
              ) : (
                <ComposedChart data={data} margin={{ top: 8, right: endLabels ? 56 : 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={T.grid} vertical={false} />
                  <XAxis {...categoryAxis} />
                  <YAxis {...valueAxis} />
                  {tooltip}
                  {series.map((s, i) => {
                    const color = colorOf(s, i);
                    const common = {
                      key: s.key,
                      dataKey: s.key,
                      name: s.name,
                      stroke: color,
                      strokeWidth: 2,
                      strokeLinecap: "round" as const,
                      strokeLinejoin: "round" as const,
                      dot: false,
                      // 마우스를 올린 지점: 8px 이상 점 + 배경색 테두리
                      activeDot: { r: 5, fill: color, stroke: T.surface, strokeWidth: 2 },
                      isAnimationActive: false,
                      type: "monotone" as const,
                    };
                    const label = endLabels && (
                      <LabelList
                        dataKey={s.key}
                        content={(p) => {
                          const { x, y, value, index } = p as { x?: number; y?: number; value?: unknown; index?: number };
                          if (index !== data.length - 1 || x == null || y == null) return null;
                          return (
                            <g>
                              <circle cx={x} cy={y} r={4} fill={color} stroke={T.surface} strokeWidth={2} />
                              <text x={x + 8} y={y} dy={4} fontSize={12} fill={T.textSecondary}>
                                {fmt.tick(max)(Number(value))}
                              </text>
                            </g>
                          );
                        }}
                      />
                    );
                    return type === "area" ? (
                      <Area {...common} key={s.key} fill={color} fillOpacity={0.1} stackId={stacked ? "stack" : undefined}>
                        {label}
                      </Area>
                    ) : (
                      <Line {...common} key={s.key}>
                        {label}
                      </Line>
                    );
                  })}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </figure>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  series,
  type,
  format,
  total,
}: TooltipContentProps & {
  series: ChartSeries[];
  type: ChartProps["type"];
  format: (v: unknown) => string;
  total?: string;
}) {
  if (!active || !payload?.length) return null;
  const byKey = new Map(payload.map((p) => [String(p.dataKey), p.value]));
  const sum = series.reduce((acc, s) => acc + (Number(byKey.get(s.key)) || 0), 0);
  return (
    <div className="min-w-36 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-gray-500">{String(label ?? "")}</p>
      <ul className="flex flex-col gap-1">
        {series.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            {type === "bar" ? (
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: colorOf(s, i) }} />
            ) : (
              <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: colorOf(s, i) }} />
            )}
            <b className="text-sm font-semibold text-gray-900">{format(byKey.get(s.key))}</b>
            <span className="text-gray-500">{s.name}</span>
          </li>
        ))}
      </ul>
      {total && series.length > 1 && (
        <p className="mt-1.5 border-t border-gray-100 pt-1.5 text-gray-500">
          {total} <b className="text-gray-900">{format(sum)}</b>
        </p>
      )}
    </div>
  );
}

function ChartTable({
  data,
  xKey,
  xLabel,
  series,
  format,
  height,
}: {
  data: ChartRow[];
  xKey: string;
  xLabel: string;
  series: ChartSeries[];
  format: (v: unknown) => string;
  height: number;
}) {
  return (
    <div className="overflow-auto px-3" style={{ maxHeight: height }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2 pr-4 font-medium">{xLabel}</th>
            {series.map((s) => (
              <th key={s.key} className="py-2 pr-4 text-right font-medium">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              <td className="py-1.5 pr-4 text-gray-700">{row[xKey]}</td>
              {series.map((s) => (
                <td key={s.key} className="py-1.5 pr-4 text-right text-gray-900 tabular-nums">
                  {format(row[s.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
