import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 처리 중 표시 (자동으로 비활성화) */
  loading?: boolean;
  /** 왼쪽 아이콘 */
  icon?: ReactNode;
  /** 가로 전체 너비 */
  block?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  outline: "border-blue-500 bg-white text-blue-600 hover:bg-blue-50",
  danger: "border-transparent bg-red-600 text-white hover:bg-red-700",
  ghost: "border-transparent bg-transparent text-gray-700 hover:bg-gray-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-9 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-base",
};

export function Button({
  ref,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  block,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border font-medium whitespace-nowrap transition",
        "focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
