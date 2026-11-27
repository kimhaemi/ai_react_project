"use client";

import { loadScriptOnce, useMapLoader, type MapLoaderState } from "@/components/ui/map";
import type { KakaoMapsNamespace } from "./types";

/** 카카오 개발자 콘솔의 JavaScript 키 (브라우저에 노출되며, 등록한 도메인에서만 동작) */
export const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";

/**
 * SDK 스크립트를 한 번만 넣고 kakao.maps.load() 까지 끝난 뒤 resolve.
 * autoload=false 로 불러와야 스크립트를 나중에 넣어도 동작함 (기본값은 document.write 사용).
 * 등록하지 않은 도메인이면 스크립트 요청 자체가 실패함.
 */
export async function loadKakaoMap(appKey: string = KAKAO_MAP_KEY): Promise<KakaoMapsNamespace> {
  try {
    await loadScriptOnce("kakao-map-sdk", `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`);
  } catch {
    throw new Error("카카오맵 SDK 를 불러오지 못했습니다. 키와 사이트 도메인 등록, 카카오맵 사용 설정을 확인하세요.");
  }
  const maps = window.kakao?.maps;
  if (!maps) throw new Error("카카오맵 SDK 를 찾을 수 없습니다.");
  await new Promise<void>((resolve) => maps.load(resolve));
  return maps;
}

export type KakaoLoaderState = MapLoaderState<KakaoMapsNamespace>;

/** SDK 로딩 상태. 키가 없으면 스크립트를 넣지 않고 no-key 를 돌려줌 */
export function useKakaoLoader(appKey: string = KAKAO_MAP_KEY): KakaoLoaderState {
  return useMapLoader(appKey, () => loadKakaoMap(appKey));
}
