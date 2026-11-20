"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { ChoiceOption } from "./Checkbox";
import { FieldMessage, type FieldBaseProps } from "./Field";

export interface RadioGroupProps<V extends string = string> extends FieldBaseProps {
  options: ChoiceOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  direction?: "row" | "column";
  /** 버튼 모양(세그먼트)으로 표시 */
  variant?: "default" | "button";
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function RadioGroup<V extends string = string>({
  options,
  value,
  onChange,
  direction = "row",
  variant = "default",
  label,
  hint,
  error,
  required,
  disabled,
  name,
  className,
}: RadioGroupProps<V>) {
  const id = useId();
  const groupName = name ?? id;

  return (
    <fieldset
      role="radiogroup"
      className={cn("flex flex-col gap-1.5", className)}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    >
      {label && (
        <legend className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </legend>
      )}

      {variant === "button" ? (
        <div className="inline-flex w-fit overflow-hidden rounded-md border border-gray-300">
          {options.map((o, i) => {
            const checked = value === o.value;
            const off = disabled || o.disabled;
            return (
              <label
                key={o.value}
                className={cn(
                  "relative flex h-9 items-center px-4 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-300",
                  i > 0 && "border-l border-gray-300",
                  checked ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50",
                  off ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={o.value}
                  checked={checked}
                  disabled={off}
                  onChange={() => onChange(o.value)}
                  className="sr-only"
                />
                {o.label}
              </label>
            );
          })}
        </div>
      ) : (
        <div className={cn("flex gap-x-5 gap-y-2", direction === "column" ? "flex-col" : "flex-wrap")}>
          {options.map((o) => {
            const off = disabled || o.disabled;
            return (
              <label
                key={o.value}
                className={cn("inline-flex items-start gap-2 text-sm", off ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={o.value}
                  checked={value === o.value}
                  disabled={off}
                  onChange={() => onChange(o.value)}
                  className="mt-0.5 size-4 shrink-0 cursor-[inherit] accent-blue-600"
                />
                <span className="flex flex-col">
                  <span className="text-gray-800">{o.label}</span>
                  {o.description && <span className="text-xs text-gray-500">{o.description}</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <FieldMessage id={id} hint={hint} error={error} />
    </fieldset>
  );
}
