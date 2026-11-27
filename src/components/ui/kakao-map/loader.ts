"use client";

import { useEffect, useState } from "react";
import type { KakaoMapsNamespace } from "./types";

/** 카카오 개발자 콘솔의 JavaScript 키 (브라우저에 노출되며, 등록한 도메인에서만 동작) */
export const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";

const SCRIPT_ID = "kakao-map-sdk";
let loading: Promise<KakaoMapsNamespace> | null = null;

/**
 * SDK 스크립트를 한 번만 넣고 kakao.maps.load() 까지 끝난 뒤 resolve.
 * autoload=false 로 불러와야 스크립트를 나중에 넣어도 동작함 (기본값은 document.write 사용).
 */
export function loadKakaoMap(appKey: string = KAKAO_MAP_KEY): Promise<KakaoMapsNamespace> {
  if (loading) return loading;
  loading = new Promise<KakaoMapsNamespace>((resolve, reject) => {
    const done = () => {
      const maps = window.kakao?.maps;
      if (!maps) return reject(new Error("카카오맵 SDK 를 찾을 수 없습니다."));
      maps.load(() => resolve(maps));
    };
    if (window.kakao?.maps) return done();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.onload = done;
    script.onerror = () => {
      script.remove();
      reject(new Error("카카오맵 SDK 를 불러오지 못했습니다. 키와 사이트 도메인 등록을 확인하세요."));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = null; // 다음 시도에서 다시 불러올 수 있게
    throw error;
  });
  return loading;
}

export type KakaoLoaderState =
  | { status: "no-key" }
  | { status: "loading" }
  | { status: "ready"; maps: KakaoMapsNamespace }
  | { status: "error"; error: Error };

/** SDK 로딩 상태. 키가 없으면 스크립트를 넣지 않고 no-key 를 돌려줌 */
export function useKakaoLoader(appKey: string = KAKAO_MAP_KEY): KakaoLoaderState {
  const [state, setState] = useState<KakaoLoaderState>(appKey ? { status: "loading" } : { status: "no-key" });

  useEffect(() => {
    if (!appKey) return;
    let alive = true;
    loadKakaoMap(appKey).then(
      (maps) => alive && setState({ status: "ready", maps }),
      (error: Error) => alive && setState({ status: "error", error }),
    );
    return () => {
      alive = false;
    };
  }, [appKey]);

  return state;
}
