"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";
import { Field, describedBy, type FieldBaseProps } from "./Field";
import { controlClass, controlSize, type ControlSize } from "./styles";

export interface SelectOption<V extends string = string> {
  label: ReactNode;
  value: V;
  disabled?: boolean;
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

/** 드롭다운 셀렉트 박스 (키보드: ↑↓ 이동, Enter/Space 선택, Esc 닫기, 글자 입력으로 찾기) */
export function Select<V extends string = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  placeholder,
  clearable,
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
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const selectedIndex = options.findIndex((o) => o.value === selected);
  const selectedOption = options[selectedIndex];

  const enabledIndexes = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const commit = (v: V | null) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  const openList = () => {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
    setOpen(true);
  };
  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };
  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    commit(o.value);
    close();
  };

  const move = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(active);
    const next = pos < 0 ? (dir === 1 ? 0 : enabledIndexes.length - 1) : Math.min(Math.max(pos + dir, 0), enabledIndexes.length - 1);
    setActive(enabledIndexes[next]);
  };

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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else move(e.key === "ArrowDown" ? 1 : -1);
        return;
      case "Home":
      case "End":
        if (open) {
          e.preventDefault();
          setActive(e.key === "Home" ? (enabledIndexes[0] ?? -1) : (enabledIndexes.at(-1) ?? -1));
        }
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else openList();
        return;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        return;
      case "Tab":
        if (open) close(false);
        return;
    }
    // 글자를 입력하면 해당 글자로 시작하는 항목으로 이동
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const ta = typeahead.current;
      window.clearTimeout(ta.timer);
      ta.text += e.key.toLowerCase();
      ta.timer = window.setTimeout(() => (ta.text = ""), 600);
      const found = enabledIndexes.find((i) => String(textOf(options[i].label)).toLowerCase().startsWith(ta.text));
      if (found !== undefined) {
        if (open) setActive(found);
        else commit(options[found].value);
      }
    }
  };

  return (
    <Field id={triggerId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div ref={rootRef} className="relative">
        {name && <input type="hidden" name={name} value={selected ?? ""} />}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(triggerId, { hint, error })}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
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
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={triggerId}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
          >
            {options.length === 0 && <li className="px-3 py-2 text-gray-400">{t("ui.select.empty")}</li>}
            {options.map((o, i) => {
              const isSelected = o.value === selected;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={o.disabled || undefined}
                  onMouseDown={(e) => e.preventDefault()}
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
                  {isSelected && (
                    <svg viewBox="0 0 24 24" className="size-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Field>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return "";
}
