"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { addDays, addMonths, monthGrid, parseDate, startOfMonth, type DateString } from "@/lib/date";
import { useToday } from "@/hooks/useToday";
import { useI18n } from "@/i18n/I18nProvider";

export interface DateRange {
  from: DateString | null;
  to: DateString | null;
}

interface MonthProps {
  month: DateString;
  /** 키보드 포커스 날짜 */
  focused: DateString;
  /** 키보드로 다른 날짜로 이동 */
  onMoveFocus: (d: DateString) => void;
  /** 클릭/탭으로 포커스가 들어옴 */
  onFocusSync: (d: DateString) => void;
  onPick: (d: DateString) => void;
  onHover?: (d: DateString | null) => void;
  isDisabled: (d: DateString) => boolean;
  dayState: (d: DateString) => { selected?: boolean; rangeStart?: boolean; rangeEnd?: boolean; inRange?: boolean };
  /** 이 달력에 포커스가 있는지 (두 달 보기에서 한쪽만) */
  ownsFocus: boolean;
  focusRequest: number;
}

/** 한 달 달력 (내부용) */
function MonthGrid({ month, focused, onMoveFocus, onFocusSync, onPick, onHover, isDisabled, dayState, ownsFocus, focusRequest }: MonthProps) {
  const { lang } = useI18n();
  const days = useMemo(() => monthGrid(month), [month]);
  const gridRef = useRef<HTMLDivElement>(null);
  const todayStr = useToday();
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i))); // 2024-01-07 = 일요일
  }, [lang]);
  const labelFmt = useMemo(() => new Intl.DateTimeFormat(lang, { dateStyle: "full" }), [lang]);

  // 키보드로 이동했을 때 해당 날짜에 포커스
  useEffect(() => {
    if (!focusRequest || !ownsFocus) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focusRequest, focused, ownsFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, () => DateString> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
      Home: () => addDays(focused, -parseDate(focused).getDay()),
      End: () => addDays(focused, 6 - parseDate(focused).getDay()),
    };
    if (moves[e.key]) {
      e.preventDefault();
      onMoveFocus(moves[e.key]());
    }
  };

  return (
    <div ref={gridRef} role="grid" onKeyDown={onKeyDown} onMouseLeave={() => onHover?.(null)} className="w-[17.5rem]">
      <div role="row" className="mb-1 grid grid-cols-7">
        {weekdays.map((w, i) => (
          <div
            key={i}
            role="columnheader"
            className={cn("py-1 text-center text-xs font-medium", i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500")}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((d) => {
          const outside = d.slice(0, 7) !== month.slice(0, 7);
          const disabled = isDisabled(d);
          const s = dayState(d);
          const dow = parseDate(d).getDay();
          const active = s.selected || s.rangeStart || s.rangeEnd;
          return (
            <div
              key={d}
              role="gridcell"
              aria-selected={!!active}
              className={cn(
                "flex justify-center",
                s.inRange && !outside && "bg-blue-50",
                s.rangeStart && !outside && s.inRange && "rounded-l-full",
                s.rangeEnd && !outside && s.inRange && "rounded-r-full",
              )}
            >
              <button
                type="button"
                data-date={d}
                tabIndex={ownsFocus && d === focused ? 0 : -1}
                disabled={disabled}
                aria-label={labelFmt.format(parseDate(d))}
                aria-current={d === todayStr ? "date" : undefined}
                onClick={() => onPick(d)}
                onMouseEnter={() => !disabled && onHover?.(d)}
                onFocus={() => d !== focused && onFocusSync(d)}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-full text-sm transition outline-none",
                  "focus-visible:ring-2 focus-visible:ring-blue-400",
                  outside && !active && "opacity-40",
                  disabled
                    ? "cursor-not-allowed text-gray-300 line-through"
                    : active
                      ? "bg-blue-600 font-semibold text-white"
                      : cn("hover:bg-gray-100", dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-600" : "text-gray-800"),
                  d === todayStr && !active && "font-bold ring-1 ring-blue-300",
                )}
              >
                {Number(d.slice(8))}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chevron({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function MonthHeader({
  months,
  onMove,
}: {
  months: DateString[];
  onMove: (delta: number) => void;
}) {
  const { t, lang } = useI18n();
  const fmt = new Intl.DateTimeFormat(lang, { year: "numeric", month: "long" });
  const nav = "flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100";
  return (
    <div className="mb-2 flex items-center gap-1">
      <button type="button" className={nav} onClick={() => onMove(-12)} aria-label={t("ui.calendar.prevYear")}>
        <Chevron d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
      </button>
      <button type="button" className={nav} onClick={() => onMove(-1)} aria-label={t("ui.calendar.prevMonth")}>
        <Chevron d="m15 18-6-6 6-6" />
      </button>
      <div className="flex flex-1 justify-around text-sm font-semibold text-gray-900" aria-live="polite">
        {months.map((m, i) => (
          <span key={m} className={cn(i > 0 && "hidden md:inline")}>
            {fmt.format(parseDate(m))}
          </span>
        ))}
      </div>
      <button type="button" className={nav} onClick={() => onMove(1)} aria-label={t("ui.calendar.nextMonth")}>
        <Chevron d="m9 18 6-6-6-6" />
      </button>
      <button type="button" className={nav} onClick={() => onMove(12)} aria-label={t("ui.calendar.nextYear")}>
        <Chevron d="m13 17 5-5-5-5M6 17l5-5-5-5" />
      </button>
    </div>
  );
}

interface CommonProps {
  min?: DateString;
  max?: DateString;
  /** 선택 불가 날짜 (예: 주말) */
  isDateDisabled?: (d: DateString) => boolean;
  className?: string;
}

function useCalendarNav(anchor: DateString | null, min?: DateString, max?: DateString, isDateDisabled?: (d: DateString) => boolean) {
  const todayStr = useToday();
  // 사용자가 달을 넘기기 전까지는 선택값(없으면 오늘)이 있는 달을 보여줌
  const [viewState, setView] = useState<DateString | null>(null);
  const [focusedState, setFocused] = useState<DateString | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const base = anchor ?? todayStr;
  const view = viewState ?? (base ? startOfMonth(base) : null);
  const focused = focusedState ?? base ?? view;
  const isDisabled = (d: DateString) => (!!min && d < min) || (!!max && d > max) || !!isDateDisabled?.(d);
  return { view, setView, focused, setFocused, focusRequest, setFocusRequest, isDisabled };
}

/** 오늘 날짜를 알기 전(서버 렌더링 중) 자리 표시 */
function CalendarPlaceholder({ className }: { className?: string }) {
  return <div className={cn("h-[19rem] w-[17.5rem]", className)} aria-hidden />;
}

/** 단일 날짜 달력 */
export function Calendar({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  className,
}: CommonProps & { value: DateString | null; onChange: (d: DateString) => void }) {
  const nav = useCalendarNav(value, min, max, isDateDisabled);
  if (!nav.view || !nav.focused) return <CalendarPlaceholder className={className} />;
  const view = nav.view;
  const focused = nav.focused;

  const focusDate = (d: DateString) => {
    nav.setFocused(d);
    if (startOfMonth(d) !== view) nav.setView(startOfMonth(d));
    nav.setFocusRequest((n) => n + 1);
  };

  return (
    <div className={cn("inline-block", className)}>
      <MonthHeader months={[view]} onMove={(delta) => nav.setView(addMonths(view, delta))} />
      <MonthGrid
        month={view}
        focused={focused.slice(0, 7) === view.slice(0, 7) ? focused : view}
        onMoveFocus={focusDate}
        onFocusSync={nav.setFocused}
        onPick={(d) => !nav.isDisabled(d) && onChange(d)}
        isDisabled={nav.isDisabled}
        dayState={(d) => ({ selected: d === value })}
        ownsFocus
        focusRequest={nav.focusRequest}
      />
    </div>
  );
}

/** 기간 달력 (PC 에서는 두 달 표시). 첫 클릭 = 시작일, 두 번째 클릭 = 종료일 */
export function RangeCalendar({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  className,
}: CommonProps & { value: DateRange; onChange: (range: DateRange) => void }) {
  const nav = useCalendarNav(value.from, min, max, isDateDisabled);
  const [hover, setHover] = useState<DateString | null>(null);
  if (!nav.view || !nav.focused) return <CalendarPlaceholder className={className} />;
  const view = nav.view;
  const focused = nav.focused;
  const second = addMonths(view, 1);

  const picking = !!value.from && !value.to;
  const end = picking ? hover : value.to;
  const [lo, hi] = value.from && end ? (value.from <= end ? [value.from, end] : [end, value.from]) : [value.from, null];

  const pick = (d: DateString) => {
    if (nav.isDisabled(d)) return;
    if (!value.from || value.to) onChange({ from: d, to: null });
    else onChange(d < value.from ? { from: d, to: value.from } : { from: value.from, to: d });
  };

  const focusDate = (d: DateString) => {
    nav.setFocused(d);
    const m = startOfMonth(d);
    // 모바일에서는 두 번째 달이 숨겨져 있으므로 항상 첫 번째 달로 이동
    const twoMonths = window.matchMedia("(min-width: 768px)").matches;
    if (m !== view && !(twoMonths && m === second)) nav.setView(m < view || !twoMonths ? m : addMonths(m, -1));
    nav.setFocusRequest((n) => n + 1);
    if (picking) setHover(d);
  };

  const dayState = (d: DateString) => ({
    rangeStart: d === lo,
    rangeEnd: d === (hi ?? lo),
    inRange: !!lo && !!hi && d >= lo && d <= hi,
  });

  const grid = (month: DateString) => (
    <MonthGrid
      month={month}
      focused={focused.slice(0, 7) === month.slice(0, 7) ? focused : month}
      onMoveFocus={focusDate}
      onFocusSync={(d) => {
        nav.setFocused(d);
        if (picking) setHover(d);
      }}
      onPick={pick}
      onHover={picking ? setHover : undefined}
      isDisabled={nav.isDisabled}
      dayState={dayState}
      ownsFocus={
        focused.slice(0, 7) === month.slice(0, 7) ||
        (month === view && ![view, second].some((m) => m.slice(0, 7) === focused.slice(0, 7)))
      }
      focusRequest={nav.focusRequest}
    />
  );

  return (
    <div className={cn("inline-block", className)}>
      <MonthHeader months={[view, second]} onMove={(delta) => nav.setView(addMonths(view, delta))} />
      <div className="flex gap-6">
        {grid(view)}
        <div className="hidden md:block">{grid(second)}</div>
      </div>
    </div>
  );
}
