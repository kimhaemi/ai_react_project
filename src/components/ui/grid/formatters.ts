import type { ValueFormatterParams } from "ag-grid-community";

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value == null || value === "") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(value: string | number | Date | null | undefined): string {
  return formatDateTime(value).slice(0, 10);
}

/** colDef.valueFormatter 에 바로 넣어 쓰는 포맷터 */
export const dateTimeFormatter = (p: ValueFormatterParams) => formatDateTime(p.value);
export const dateFormatter = (p: ValueFormatterParams) => formatDate(p.value);
export const numberFormatter = (p: ValueFormatterParams) =>
  typeof p.value === "number" ? p.value.toLocaleString("ko-KR") : (p.value ?? "");
