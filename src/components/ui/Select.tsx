"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";
import { Field, describedBy, type FieldBaseProps } from "./Field";
import { controlClass, controlSize, type ControlSize } from "./styles";

export interface SelectOption<V extends string = string> {
  label: ReactNode;
  value: V;
  disabled?: boolean;
  /** 오른쪽에 흐리게 표시할 보조 정보 */
  description?: ReactNode;
  /** 검색에 쓸 글자 (label 이 문자열이 아닐 때 지정) */
  searchText?: string;
}

/** actions 영역에서 쓸 수 있는 기능 */
export interface SelectActionContext<V extends string = string> {
  /** 목록 닫기 */
  close: () => void;
  /** 현재 검색어 */
  query: string;
  /** 값 선택 후 닫기 */
  select: (value: V | null) => void;
}

export interface SelectProps<V extends string = string> extends FieldBaseProps {
  options: SelectOption<V>[];
  /** 선택 값 (null = 선택 안 함). 지정하지 않으면 내부에서 상태 관리 */
  value?: V | null;
  defaultValue?: V | null;
  onChange?: (value: V | null) => void;
  placeholder?: ReactNode;
  /** 선택 해제(X) 버튼 표시 */
  clearable?: boolean;
  /** 목록 위에 검색창 표시 */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** 검색 방식 직접 지정 (기본: 글자 포함, 대소문자 무시) */
  filterOption?: (option: SelectOption<V>, query: string) => boolean;
  /**
   * 목록 아래 버튼 영역. 예) "+ 새 항목 추가", "관리 페이지로"
   * 함수로 넘기면 close / query / select 를 쓸 수 있음
   */
  actions?: ReactNode | ((ctx: SelectActionContext<V>) => ReactNode);
  disabled?: boolean;
  size?: ControlSize;
  /** form 전송용 hidden input 이름 */
  name?: string;
  id?: string;
  /** 라벨 없이 쓸 때 스크린리더용 이름 */
  "aria-label"?: string;
  className?: string;
  containerClassName?: string;
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return "";
}

const defaultFilter = <V extends string>(o: SelectOption<V>, q: string) =>
  (o.searchText ?? textOf(o.label)).toLowerCase().includes(q.toLowerCase());

/**
 * 드롭다운 셀렉트 박스
 * - 키보드: ↑↓ 이동, Enter 선택, Esc 닫기, (검색창 없을 때) 글자 입력으로 찾기
 * - searchable: 목록 위 검색창 / actions: 목록 아래 버튼 영역
 */
export function Select<V extends string = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  placeholder,
  clearable,
  searchable,
  searchPlaceholder,
  filterOption = defaultFilter,
  actions,
  disabled,
  size = "md",
  name,
  id,
  label,
  hint,
  error,
  required,
  "aria-label": ariaLabel,
  className,
  containerClassName,
}: SelectProps<V>) {
  const { t } = useI18n();
  const autoId = useId();
  const triggerId = id ?? autoId;
  const listId = `${triggerId}-list`;

  const [inner, setInner] = useState<V | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  // 선택 후 닫을 때 버튼으로 포커스 돌려주기 (바깥 클릭으로 닫을 때는 제외)
  const [focusReturn, setFocusReturn] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const selectedOption = options.find((o) => o.value === selected);
  const visible = useMemo(
    () => (searchable && query.trim() ? options.filter((o) => filterOption(o, query.trim())) : options),
    [options, searchable, query, filterOption],
  );
  const enabled = visible.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const commit = (v: V | null) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  const openList = () => {
    if (disabled) return;
    setQuery("");
    const idx = options.findIndex((o) => o.value === selected && !o.disabled);
    setActive(idx >= 0 ? idx : options.findIndex((o) => !o.disabled));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setFocusReturn((n) => n + 1);
  };
  const choose = (i: number) => {
    const o = visible[i];
    if (!o || o.disabled) return;
    commit(o.value);
    close();
  };
  const move = (dir: 1 | -1) => {
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(active);
    const next = pos < 0 ? (dir === 1 ? 0 : enabled.length - 1) : Math.min(Math.max(pos + dir, 0), enabled.length - 1);
    setActive(enabled[next]);
  };

  useEffect(() => {
    if (focusReturn) triggerRef.current?.focus();
  }, [focusReturn]);

  // 열리면 검색창에 포커스
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // 활성 항목이 보이도록 스크롤
  useEffect(() => {
    if (open && active >= 0) {
      listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  /** 목록 이동/선택 키 (버튼과 검색창 공통) */
  const navKeys = (e: React.KeyboardEvent, fromSearch: boolean) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else move(e.key === "ArrowDown" ? 1 : -1);
        return true;
      case "Enter":
        e.preventDefault();
        if (open) choose(active);
        else openList();
        return true;
      case "Escape":
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        return true;
      case "Home":
      case "End":
        if (open && !fromSearch) {
          e.preventDefault();
          setActive(e.key === "Home" ? (enabled[0] ?? -1) : (enabled.at(-1) ?? -1));
          return true;
        }
        return false;
    }
    return false;
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || navKeys(e, false)) return;
    if (e.key === " ") {
      e.preventDefault();
      if (open) choose(active);
      else openList();
      return;
    }
    // 검색창이 없으면: 글자를 입력하면 해당 글자로 시작하는 항목으로 이동
    if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const ta = typeahead.current;
      window.clearTimeout(ta.timer);
      ta.text += e.key.toLowerCase();
      ta.timer = window.setTimeout(() => (ta.text = ""), 600);
      const found = enabled.find((i) => (visible[i].searchText ?? textOf(visible[i].label)).toLowerCase().startsWith(ta.text));
      if (found !== undefined) {
        if (open) setActive(found);
        else commit(visible[found].value);
      }
    }
  };

  const actionContent =
    typeof actions === "function"
      ? actions({ close, query, select: (v) => (commit(v), close()) })
      : actions;

  const activeId = open && active >= 0 && visible[active] ? `${listId}-${active}` : undefined;

  return (
    <Field id={triggerId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div
        ref={rootRef}
        className="relative"
        // 포커스가 셀렉트 밖으로 나가면(Tab 등) 닫기
        onBlur={(e) => {
          if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        {name && <input type="hidden" name={name} value={selected ?? ""} />}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role={searchable ? undefined : "combobox"}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={searchable ? undefined : activeId}
          aria-invalid={!searchable && error ? true : undefined}
          aria-describedby={describedBy(triggerId, { hint, error })}
          aria-required={!searchable && required ? true : undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            controlClass(!!error),
            controlSize[size],
            "flex items-center gap-2 text-left",
            open && !error && "border-blue-500 ring-2 ring-blue-100",
            className,
          )}
        >
          <span className={cn("flex-1 truncate", !selectedOption && "text-gray-400")}>
            {selectedOption ? selectedOption.label : (placeholder ?? t("ui.select.placeholder"))}
          </span>
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label={t("ui.select.clear")}
              onClick={(e) => {
                e.stopPropagation();
                commit(null);
              }}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </span>
          )}
          <svg
            viewBox="0 0 24 24"
            className={cn("size-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute top-full right-0 left-0 z-50 mt-1 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white text-sm shadow-lg"
            // 빈 곳을 눌러도 포커스가 빠져 목록이 닫히지 않도록 (입력창/버튼은 정상 동작)
            onMouseDown={(e) => {
              if (!(e.target as HTMLElement).closest("input, button, a, textarea, select, [tabindex]")) e.preventDefault();
            }}
          >
            {searchable && (
              <div className="border-b border-gray-100 p-2">
                <div className="relative">
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    role="combobox"
                    aria-expanded
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeId}
                    aria-label={searchPlaceholder ?? t("ui.select.search")}
                    placeholder={searchPlaceholder ?? t("ui.select.search")}
                    value={query}
                    onChange={(e) => {
                      const q = e.target.value;
                      setQuery(q);
                      const next = q.trim() ? options.filter((o) => filterOption(o, q.trim())) : options;
                      setActive(next.findIndex((o) => !o.disabled));
                    }}
                    onKeyDown={(e) => navKeys(e, true)}
                    className="h-8 w-full rounded-md border border-gray-300 pr-2 pl-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            <ul ref={listRef} id={listId} role="listbox" aria-labelledby={triggerId} className="max-h-60 overflow-auto py-1">
              {visible.length === 0 && (
                <li className="px-3 py-2 text-gray-400">{query ? t("ui.select.noResults") : t("ui.select.empty")}</li>
              )}
              {visible.map((o, i) => {
                const isSelected = o.value === selected;
                return (
                  <li
                    key={o.value}
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={o.disabled || undefined}
                    onClick={() => choose(i)}
                    onMouseEnter={() => !o.disabled && setActive(i)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2",
                      o.disabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-gray-700",
                      i === active && !o.disabled && "bg-blue-50",
                      isSelected && "font-semibold text-blue-700",
                    )}
                  >
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.description && <span className="shrink-0 text-xs font-normal text-gray-400">{o.description}</span>}
                    {isSelected && (
                      <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m5 12 5 5 9-10" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>

            {actionContent && <div className="flex flex-wrap gap-2 border-t border-gray-100 p-2">{actionContent}</div>}
          </div>
        )}
      </div>
    </Field>
  );
}
