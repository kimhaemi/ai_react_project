import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 키 없음 / 로딩 / 오류일 때 지도 자리에 보이는 안내 */
export function MapNotice({
  tone,
  height,
  children,
}: {
  tone: "info" | "warn" | "error";
  height: CSSProperties["height"];
  children: ReactNode;
}) {
  return (
    <div
      style={{ height }}
      className={cn(
        "flex items-center justify-center rounded-lg border px-4 text-center text-sm",
        tone === "info" && "border-gray-200 bg-gray-50 text-gray-500",
        tone === "warn" && "border-amber-300 bg-amber-50 text-amber-800",
        tone === "error" && "border-red-300 bg-red-50 text-red-800",
      )}
    >
      <p>{children}</p>
    </div>
  );
}

/** 로더 상태에 맞는 안내. ready 가 아니면 안내 요소, ready 면 null */
export function loaderNotice(
  state: { status: "no-key" } | { status: "loading" } | { status: "error"; error: Error } | { status: "ready" },
  height: CSSProperties["height"],
  noKeyMessage: ReactNode,
): ReactNode | null {
  switch (state.status) {
    case "no-key":
      return (
        <MapNotice tone="warn" height={height}>
          {noKeyMessage}
        </MapNotice>
      );
    case "error":
      return (
        <MapNotice tone="error" height={height}>
          {state.error.message}
        </MapNotice>
      );
    case "loading":
      return (
        <MapNotice tone="info" height={height}>
          지도를 불러오는 중…
        </MapNotice>
      );
    default:
      return null;
  }
}
