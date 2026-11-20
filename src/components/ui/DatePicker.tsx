"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { addDays, addMonths, today, type DateString } from "@/lib/date";
import { useToday } from "@/hooks/useToday";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "./Button";
import { Calendar, RangeCalendar, type DateRange } from "./Calendar";
import { Field, describedBy, type FieldBaseProps } from "./Field";
import { controlClass, controlSize, type ControlSize } from "./styles";
import { useDismiss } from "@/hooks/useDismiss";

interface PickerBase extends FieldBaseProps {
  min?: DateString;
  max?: DateString;
  isDateDisabled?: (d: DateString) => boolean;
  placeholder?: ReactNode;
  disabled?: boolean;
  size?: ControlSize;
  /** 선택 해제(X) 버튼 */
  clearable?: boolean;
  /** form 전송용 hidden input 이름 */
  name?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
  containerClassName?: string;
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

function ClearButton({ onClear, label }: { onClear: () => void; label: string }) {
  return (
    <span
      role="button"
      tabIndex={-1}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClear();
      }}
      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </span>
  );
}

/** 입력창 모양 버튼 + 팝업 (DatePicker / DateRangePicker 공통) */
function PickerShell({
  props,
  display,
  hasValue,
  onClear,
  children,
  hidden,
  wide,
  onOpen,
}: {
  onOpen?: () => void;
  props: PickerBase;
  display: ReactNode;
  hasValue: boolean;
  onClear: () => void;
  children: (close: () => void) => ReactNode;
  hidden?: ReactNode;
  wide?: boolean;
}) {
  const { t } = useI18n();
  const { id, label, hint, error, required, disabled, size = "md", clearable, placeholder, className, containerClassName } = props;
  const autoId = useId();
  const triggerId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 선택 후 닫을 때는 입력창으로 포커스를 돌려줌 (바깥 클릭으로 닫을 때는 제외)
  const [focusReturn, setFocusReturn] = useState(0);
  useEffect(() => {
    if (focusReturn) triggerRef.current?.focus();
  }, [focusReturn]);
  const close = useCallback(() => {
    setOpen(false);
    setFocusReturn((n) => n + 1);
  }, []);
  useDismiss(open, rootRef, () => setOpen(false));

  return (
    <Field id={triggerId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div ref={rootRef} className="relative">
        {hidden}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={props["aria-label"]}
          aria-describedby={describedBy(triggerId, { hint, error })}
          disabled={disabled}
          onClick={() => {
            if (!open) onOpen?.();
            setOpen(!open);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && !open) {
              e.preventDefault();
              onOpen?.();
              setOpen(true);
            }
          }}
          className={cn(
            controlClass(!!error),
            controlSize[size],
            "flex items-center gap-2 text-left",
            open && !error && "border-blue-500 ring-2 ring-blue-100",
            className,
          )}
        >
          <CalendarIcon />
          <span className={cn("flex-1 truncate", !hasValue && "text-gray-400")}>
            {hasValue ? display : (placeholder ?? t("ui.calendar.placeholder"))}
          </span>
          {clearable && hasValue && !disabled && <ClearButton onClear={onClear} label={t("ui.calendar.clear")} />}
        </button>

        {open && (
          <div
            role="dialog"
            aria-modal="false"
            aria-label={typeof label === "string" ? label : t("ui.calendar.placeholder")}
            className={cn(
              "absolute top-full left-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow-xl",
              wide && "md:w-max",
            )}
          >
            {children(close)}
          </div>
        )}
      </div>
    </Field>
  );
}

export interface DatePickerProps extends PickerBase {
  value: DateString | null;
  onChange: (value: DateString | null) => void;
}

/** 날짜 선택 (달력 팝업) */
export function DatePicker(props: DatePickerProps) {
  const { t, lang } = useI18n();
  const { value, onChange, min, max, isDateDisabled, name } = props;
  const fmt = new Intl.DateTimeFormat(lang, { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
  const todayStr = useToday();
  const todayDisabled = !todayStr || (!!min && todayStr < min) || (!!max && todayStr > max) || !!isDateDisabled?.(todayStr);

  return (
    <PickerShell
      props={props}
      hasValue={!!value}
      display={value ? fmt.format(new Date(`${value}T00:00:00`)) : null}
      onClear={() => onChange(null)}
      hidden={name && <input type="hidden" name={name} value={value ?? ""} />}
    >
      {(close) => (
        <>
          <Calendar
            value={value}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            onChange={(d) => {
              onChange(d);
              close();
            }}
          />
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-2">
            <Button size="sm" variant="ghost" onClick={() => (onChange(null), close())}>
              {t("ui.calendar.clear")}
            </Button>
            <Button size="sm" variant="secondary" disabled={todayDisabled} onClick={() => todayStr && (onChange(todayStr), close())}>
              {t("ui.calendar.today")}
            </Button>
          </div>
        </>
      )}
    </PickerShell>
  );
}

export interface RangePreset {
  label: ReactNode;
  range: () => DateRange;
}

export interface DateRangePickerProps extends PickerBase {
  value: DateRange;
  onChange: (value: DateRange) => void;
  /** 빠른 선택 버튼 (기본: 오늘/7일/1개월/3개월). false 면 숨김 */
  presets?: RangePreset[] | false;
  /** form 전송용 hidden input 이름 (시작일/종료일) */
  names?: [string, string];
}

/** 기간 선택 (두 달 달력 팝업 + 빠른 선택) */
export function DateRangePicker(props: DateRangePickerProps) {
  const { t, lang } = useI18n();
  const { value, onChange, min, max, isDateDisabled, presets, names } = props;
  const [draft, setDraft] = useState<DateRange>(value);
  const fmt = new Intl.DateTimeFormat(lang, { year: "numeric", month: "2-digit", day: "2-digit" });
  const show = (d: DateString | null) => (d ? fmt.format(new Date(`${d}T00:00:00`)) : "");

  const defaultPresets: RangePreset[] = [
    { label: t("ui.calendar.preset.today"), range: () => ({ from: today(), to: today() }) },
    { label: t("ui.calendar.preset.week"), range: () => ({ from: addDays(today(), -6), to: today() }) },
    { label: t("ui.calendar.preset.month"), range: () => ({ from: addDays(addMonths(today(), -1), 1), to: today() }) },
    { label: t("ui.calendar.preset.3months"), range: () => ({ from: addDays(addMonths(today(), -3), 1), to: today() }) },
  ];
  const list = presets === false ? [] : (presets ?? defaultPresets);

  return (
    <PickerShell
      props={props}
      wide
      onOpen={() => setDraft(value)}
      hasValue={!!(value.from || value.to)}
      display={`${show(value.from)} ~ ${show(value.to)}`}
      onClear={() => onChange({ from: null, to: null })}
      hidden={
        names && (
          <>
            <input type="hidden" name={names[0]} value={value.from ?? ""} />
            <input type="hidden" name={names[1]} value={value.to ?? ""} />
          </>
        )
      }
    >
      {(close) => (
        <>
          {list.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5 border-b border-gray-100 pb-3">
              {list.map((p, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onChange(p.range());
                    close();
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          )}
          <RangeCalendar
            value={draft}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            onChange={(r) => {
              setDraft(r);
              if (r.from && r.to) {
                onChange(r);
                close();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
            <span className="text-xs text-gray-500">
              {draft.from && !draft.to ? t("ui.calendar.pickEnd") : t("ui.calendar.pickStart")}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onChange({ from: null, to: null });
                close();
              }}
            >
              {t("ui.calendar.clear")}
            </Button>
          </div>
        </>
      )}
    </PickerShell>
  );
}
