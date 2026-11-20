/**
 * 날짜는 "YYYY-MM-DD" 문자열로 다룸 (시간대 문제 없이 비교/저장 가능, 문자열 비교 = 날짜 비교)
 */
export type DateString = string;

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateString(d: Date): DateString {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s: DateString): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isDateString(s: unknown): s is DateString {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && toDateString(parseDate(s)) === s;
}

export const today = (): DateString => toDateString(new Date());

export function addDays(s: DateString, days: number): DateString {
  const d = parseDate(s);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

export function addMonths(s: DateString, months: number): DateString {
  const d = parseDate(s);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  // 31일 → 다음 달에 31일이 없으면 말일로
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toDateString(d);
}

export const startOfMonth = (s: DateString): DateString => `${s.slice(0, 7)}-01`;

/** 달력 한 장에 표시할 날짜 (앞뒤 달 포함, 항상 6주 = 42칸) */
export function monthGrid(month: DateString): DateString[] {
  const first = parseDate(startOfMonth(month));
  const start = addDays(toDateString(first), -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function clampDate(s: DateString, min?: DateString, max?: DateString): DateString {
  if (min && s < min) return min;
  if (max && s > max) return max;
  return s;
}
