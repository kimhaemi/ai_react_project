import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldBaseProps {
  label?: ReactNode;
  /** 아래에 표시할 도움말 */
  hint?: ReactNode;
  /** 오류 메시지 (있으면 빨간 테두리) */
  error?: ReactNode;
  required?: boolean;
}

/** 라벨 + 입력 요소 + 도움말/오류 메시지 묶음 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldBaseProps & { id: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function FieldMessage({ id, hint, error }: { id: string; hint?: ReactNode; error?: ReactNode }) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
        {error}
      </p>
    );
  }
  return hint ? (
    <p id={`${id}-hint`} className="text-xs text-gray-500">
      {hint}
    </p>
  ) : null;
}

/** aria-describedby 값 */
export const describedBy = (id: string, { hint, error }: FieldBaseProps) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
