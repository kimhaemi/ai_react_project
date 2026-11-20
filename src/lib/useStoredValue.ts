"use client";

import { useCallback, useSyncExternalStore } from "react";

// localStorage 값을 React 상태처럼 쓰기 위한 훅 (탭 간 동기화 포함)
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useStoredValue(key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const setValue = useCallback(
    (next: string | null) => {
      try {
        if (next == null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, next);
      } catch {
        // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 무시
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  return [value, setValue];
}
