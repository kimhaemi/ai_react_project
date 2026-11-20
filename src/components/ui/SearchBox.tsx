"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "./Button";
import { CheckboxGroup, type ChoiceOption } from "./Checkbox";
import { Input } from "./Input";
import { RadioGroup } from "./Radio";
import { Select, type SelectOption } from "./Select";

export type SearchValues = Record<string, string | string[]>;

type FieldBase = {
  /** 값이 저장될 키 */
  name: string;
  label: ReactNode;
  /** 차지할 칸 수 (기본 1) */
  colSpan?: 1 | 2 | 3;
};

export type SearchField =
  | (FieldBase & { type: "text"; placeholder?: string })
  /** 검색 구분(셀렉트) + 검색어 입력. 구분 값은 typeName 키에 저장 */
  | (FieldBase & { type: "keyword"; typeName: string; options: SelectOption[]; placeholder?: string })
  | (FieldBase & { type: "select"; options: SelectOption[]; placeholder?: string })
  | (FieldBase & { type: "radio"; options: ChoiceOption[] })
  | (FieldBase & { type: "checkbox"; options: ChoiceOption[]; selectAllLabel?: ReactNode })
  /** 기간 (시작일은 name, 종료일은 toName 키에 저장. 값 형식 YYYY-MM-DD) */
  | (FieldBase & { type: "dateRange"; toName: string });

export interface SearchBoxProps {
  fields: SearchField[];
  /** 처음 값이자 "초기화" 시 돌아갈 값 */
  initialValues: SearchValues;
  onSearch: (values: SearchValues) => void;
  /** 초기화 후 호출 (기본: 초기값으로 onSearch 호출) */
  onReset?: (values: SearchValues) => void;
  /** 한 줄에 놓을 항목 수 (PC 기준, 기본 2) */
  columns?: 1 | 2 | 3;
  /** 버튼 영역에 추가할 요소 */
  actions?: ReactNode;
  loading?: boolean;
  className?: string;
}

const gridCols = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;
const colSpanClass = { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3" } as const;

/**
 * 게시판 상단 검색 영역.
 * fields 설정만으로 검색 조건(검색어, 셀렉트, 라디오, 체크박스, 기간)을 구성.
 */
export function SearchBox({
  fields,
  initialValues,
  onSearch,
  onReset,
  columns = 2,
  actions,
  loading,
  className,
}: SearchBoxProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<SearchValues>(initialValues);

  const str = (key: string) => (typeof values[key] === "string" ? (values[key] as string) : "");
  const arr = (key: string) => (Array.isArray(values[key]) ? (values[key] as string[]) : []);
  const set = (key: string, v: string | string[]) => setValues((prev) => ({ ...prev, [key]: v }));

  const normalize = (v: SearchValues): SearchValues => {
    const out: SearchValues = { ...v };
    for (const f of fields) {
      if (f.type === "text" || f.type === "keyword") out[f.name] = String(out[f.name] ?? "").trim();
      // 기간이 거꾸로 입력되면 바꿔서 전달
      if (f.type === "dateRange") {
        const from = String(out[f.name] ?? "");
        const to = String(out[f.toName] ?? "");
        if (from && to && from > to) {
          out[f.name] = to;
          out[f.toName] = from;
        }
      }
    }
    return out;
  };

  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = normalize(values);
    setValues(next);
    onSearch(next);
  };

  const reset = () => {
    setValues(initialValues);
    if (onReset) onReset(initialValues);
    else onSearch(initialValues);
  };

  // 마지막 줄이 비지 않도록 남는 칸 계산
  const used = fields.reduce((sum, f) => sum + Math.min(f.colSpan ?? 1, columns), 0);
  const filler = (columns - (used % columns)) % columns;

  const renderControl = (f: SearchField) => {
    switch (f.type) {
      case "text":
        return (
          <Input aria-label={labelText(f.label)} value={str(f.name)} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
        );
      case "keyword":
        return (
          <div className="flex gap-2">
            <Select
              containerClassName="w-32 shrink-0"
              aria-label={labelText(f.label)}
              options={f.options}
              value={str(f.typeName) || null}
              onChange={(v) => set(f.typeName, v ?? "")}
            />
            <Input
              containerClassName="flex-1"
              aria-label={labelText(f.label)}
              value={str(f.name)}
              placeholder={f.placeholder ?? t("ui.search.keywordPlaceholder")}
              onChange={(e) => set(f.name, e.target.value)}
            />
          </div>
        );
      case "select":
        return (
          <Select
            options={f.options}
            value={str(f.name) || null}
            placeholder={f.placeholder}
            clearable
            onChange={(v) => set(f.name, v ?? "")}
          />
        );
      case "radio":
        return <RadioGroup options={f.options} value={str(f.name) || null} onChange={(v) => set(f.name, v)} />;
      case "checkbox":
        return (
          <CheckboxGroup options={f.options} value={arr(f.name)} selectAllLabel={f.selectAllLabel} onChange={(v) => set(f.name, v)} />
        );
      case "dateRange":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label={`${labelText(f.label)} ${t("ui.search.from")}`}
              containerClassName="flex-1"
              value={str(f.name)}
              max={str(f.toName) || undefined}
              onChange={(e) => set(f.name, e.target.value)}
            />
            <span className="text-gray-400">~</span>
            <Input
              type="date"
              aria-label={`${labelText(f.label)} ${t("ui.search.to")}`}
              containerClassName="flex-1"
              value={str(f.toName)}
              min={str(f.name) || undefined}
              onChange={(e) => set(f.toName, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <form role="search" onSubmit={submit} className={cn("rounded-lg border border-gray-200 bg-white", className)}>
      <div className={cn("grid grid-cols-1 gap-px overflow-hidden rounded-t-lg bg-gray-200", gridCols[columns])}>
        {fields.map((f) => (
          <div key={f.name} className={cn("flex bg-white", colSpanClass[Math.min(f.colSpan ?? 1, columns) as 1 | 2 | 3])}>
            <div className="flex w-24 shrink-0 items-center bg-gray-50 px-3 text-sm font-medium text-gray-700 sm:w-28">{f.label}</div>
            <div className="flex min-h-12 min-w-0 flex-1 items-center px-3 py-2">
              <div className="w-full">{renderControl(f)}</div>
            </div>
          </div>
        ))}
        {filler > 0 && <div className={cn("hidden bg-white md:block", colSpanClass[filler as 1 | 2])} />}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-3 py-2.5">
        {actions}
        <Button variant="secondary" onClick={reset} disabled={loading}>
          {t("ui.search.reset")}
        </Button>
        <Button type="submit" loading={loading} icon={<SearchIcon />}>
          {t("ui.search.submit")}
        </Button>
      </div>
    </form>
  );
}

const labelText = (label: ReactNode) => (typeof label === "string" ? label : undefined);

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
