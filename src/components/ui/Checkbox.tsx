"use client";

import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { FieldMessage, type FieldBaseProps } from "./Field";
import { mergeRefs } from "./styles";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  ref?: Ref<HTMLInputElement>;
  label?: ReactNode;
  /** 라벨 아래 설명 */
  description?: ReactNode;
  /** 일부만 선택된 상태(-) 표시 */
  indeterminate?: boolean;
}

export function Checkbox({ ref, id, label, description, indeterminate = false, className, disabled, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inner = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      htmlFor={inputId}
      className={cn("inline-flex items-start gap-2 text-sm", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer", className)}
    >
      <input
        ref={mergeRefs(inner, ref)}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        aria-checked={indeterminate ? "mixed" : undefined}
        className="mt-0.5 size-4 shrink-0 cursor-[inherit] accent-blue-600"
        {...props}
      />
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-gray-800">{label}</span>}
          {description && <span className="text-xs text-gray-500">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface ChoiceOption<V extends string = string> {
  label: ReactNode;
  value: V;
  disabled?: boolean;
  description?: ReactNode;
}

export interface CheckboxGroupProps<V extends string = string> extends FieldBaseProps {
  options: ChoiceOption<V>[];
  value: V[];
  onChange: (value: V[]) => void;
  /** 가로(기본) / 세로 배치 */
  direction?: "row" | "column";
  /** 맨 앞에 "전체" 체크박스 추가 (라벨 지정) */
  selectAllLabel?: ReactNode;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function CheckboxGroup<V extends string = string>({
  options,
  value,
  onChange,
  direction = "row",
  selectAllLabel,
  label,
  hint,
  error,
  required,
  disabled,
  name,
  className,
}: CheckboxGroupProps<V>) {
  const id = useId();
  const enabled = options.filter((o) => !o.disabled && !disabled);
  const checkedCount = enabled.filter((o) => value.includes(o.value)).length;
  const all = enabled.length > 0 && checkedCount === enabled.length;

  const toggle = (v: V, checked: boolean) =>
    onChange(checked ? [...value, v] : value.filter((x) => x !== v));
  const toggleAll = (checked: boolean) => {
    const enabledValues = enabled.map((o) => o.value);
    onChange(checked ? [...new Set([...value, ...enabledValues])] : value.filter((v) => !enabledValues.includes(v)));
  };

  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
      {label && (
        <legend className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </legend>
      )}
      <div className={cn("flex gap-x-5 gap-y-2", direction === "column" ? "flex-col" : "flex-wrap")}>
        {selectAllLabel && (
          <Checkbox
            label={selectAllLabel}
            checked={all}
            indeterminate={checkedCount > 0 && !all}
            disabled={disabled || enabled.length === 0}
            onChange={(e) => toggleAll(e.target.checked)}
          />
        )}
        {options.map((o) => (
          <Checkbox
            key={o.value}
            name={name}
            value={o.value}
            label={o.label}
            description={o.description}
            checked={value.includes(o.value)}
            disabled={disabled || o.disabled}
            onChange={(e) => toggle(o.value, e.target.checked)}
          />
        ))}
      </div>
      <FieldMessage id={id} hint={hint} error={error} />
    </fieldset>
  );
}
