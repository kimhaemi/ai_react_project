export type ControlSize = "sm" | "md" | "lg";

/** 입력 계열(Input, Select) 공통 높이/글자 크기 */
export const controlSize: Record<ControlSize, string> = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
  lg: "h-11 text-base",
};

/** 입력 계열 공통 테두리/포커스/비활성 스타일 */
export function controlClass(invalid?: boolean) {
  return [
    "w-full rounded-md border bg-white px-3 text-gray-900 outline-none transition",
    "placeholder:text-gray-400 focus:ring-2",
    "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
    invalid
      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
  ].join(" ");
}

/** 여러 ref 를 하나로 합치기 */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (el: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.RefObject<T | null>).current = el;
    }
  };
}
