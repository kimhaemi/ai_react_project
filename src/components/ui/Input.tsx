import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { Field, describedBy, type FieldBaseProps } from "./Field";
import { controlClass, controlSize, type ControlSize } from "./styles";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, FieldBaseProps {
  ref?: Ref<HTMLInputElement>;
  size?: ControlSize;
  /** 입력창 안 왼쪽 아이콘 */
  icon?: ReactNode;
  /** 바깥 영역(라벨 포함) className */
  containerClassName?: string;
}

export function Input({
  ref,
  id,
  label,
  hint,
  error,
  required,
  size = "md",
  icon,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, { hint, error })}
          className={cn(controlClass(!!error), controlSize[size], !!icon && "pl-9", className)}
          {...props}
        />
      </div>
    </Field>
  );
}
