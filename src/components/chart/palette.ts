/**
 * 차트 색상 (dataviz 기준 팔레트, 흰 배경에서 색약 구분 검증 완료)
 * - 시리즈 색은 이 순서대로 "고정" 배정 (순위/필터에 따라 바꾸지 않음)
 * - 한 차트에 4개 이하 권장. 그 이상은 "기타"로 묶거나 차트를 나눔
 * - 3·4번(초록·노랑)은 배경 대비가 낮아 범례 + 표 보기를 항상 함께 제공
 */
export const SERIES_COLORS = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#6250d6", // 7 violet
  "#e34948", // 8 red
] as const;

export const CHART_TOKENS = {
  surface: "#ffffff",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  muted: "#898781",
  textPrimary: "#111827",
  textSecondary: "#52514e",
  hover: "rgba(17, 24, 39, 0.04)",
} as const;
