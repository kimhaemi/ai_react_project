"use client";

import { useEffect, useState } from "react";

/** 지도 SDK 로딩 상태 (카카오·구글·네이버 공통) */
export type MapLoaderState<T> =
  | { status: "no-key" }
  | { status: "loading" }
  | { status: "ready"; api: T }
  | { status: "error"; error: Error };

const scripts = new Map<string, Promise<void>>();

/**
 * 스크립트를 id 당 한 번만 넣음. callbackName 을 주면 SDK 가 그 전역 함수를 부를 때 완료로 봄
 * (src 에 callback 파라미터를 직접 넣어야 함). 실패하면 다음에 다시 시도할 수 있게 캐시를 지움.
 */
export function loadScriptOnce(id: string, src: string, callbackName?: string): Promise<void> {
  const cached = scripts.get(id);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    if (callbackName) {
      (window as unknown as Record<string, unknown>)[callbackName] = () => resolve();
    } else {
      script.onload = () => resolve();
    }
    script.onerror = () => {
      script.remove();
      scripts.delete(id);
      reject(new Error("지도 SDK 를 불러오지 못했습니다. 네트워크와 키를 확인하세요."));
    };
    document.head.appendChild(script);
  });
  scripts.set(id, promise);
  return promise;
}

const authListeners = new Map<string, Set<() => void>>();
const authFailed = new Set<string>();

/**
 * SDK 가 인증 실패 때 부르는 전역 함수(구글 gm_authFailure, 네이버 navermap_authFailure)를 구독.
 * 스크립트 자체는 정상으로 받아지고 나중에 이 함수만 불리므로 따로 감지해야 함.
 */
export function onAuthFailure(globalName: string, listener: () => void): () => void {
  if (authFailed.has(globalName)) {
    listener();
    return () => {};
  }
  let set = authListeners.get(globalName);
  if (!set) {
    const listeners = new Set<() => void>();
    authListeners.set(globalName, listeners);
    (window as unknown as Record<string, unknown>)[globalName] = () => {
      authFailed.add(globalName);
      listeners.forEach((fn) => fn());
    };
    set = listeners;
  }
  set.add(listener);
  return () => set.delete(listener);
}

/**
 * load() 로 SDK 를 불러와 상태를 돌려주는 훅. 키가 없으면 아무것도 불러오지 않고 no-key.
 * authFailureGlobal 을 주면 인증 실패도 error 로 바꿈.
 */
export function useMapLoader<T>(
  appKey: string,
  load: () => Promise<T>,
  options: { authFailureGlobal?: string; authFailureMessage?: string } = {},
): MapLoaderState<T> {
  const [state, setState] = useState<MapLoaderState<T>>(appKey ? { status: "loading" } : { status: "no-key" });
  const { authFailureGlobal, authFailureMessage = "지도 인증에 실패했습니다. 키와 등록한 도메인을 확인하세요." } = options;

  useEffect(() => {
    if (!appKey) return;
    let alive = true;
    const fail = (error: Error) => alive && setState({ status: "error", error });
    const unsubscribe = authFailureGlobal ? onAuthFailure(authFailureGlobal, () => fail(new Error(authFailureMessage))) : undefined;
    load().then(
      (api) => alive && setState((s) => (s.status === "error" ? s : { status: "ready", api })),
      (error: Error) => fail(error),
    );
    return () => {
      alive = false;
      unsubscribe?.();
    };
    // load 는 모듈 함수라 바뀌지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appKey, authFailureGlobal, authFailureMessage]);

  return state;
}
