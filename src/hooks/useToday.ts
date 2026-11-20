"use client";

import { useSyncExternalStore } from "react";
import { today, type DateString } from "@/lib/date";

// 1분마다 확인해서 자정이 지나면 갱신
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};

/**
 * 오늘 날짜 (브라우저 기준). 서버 렌더링/정적 생성 중에는 null.
 * (빌드 시점의 날짜가 화면에 고정되지 않도록 렌더링 중에는 today() 대신 이 훅을 사용)
 */
export function useToday(): DateString | null {
  return useSyncExternalStore(subscribe, today, () => null);
}
