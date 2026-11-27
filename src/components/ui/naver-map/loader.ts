"use client";

import { loadScriptOnce, useMapLoader, type MapLoaderState } from "@/components/ui/map";
import type { NaverMapsNamespace } from "./types";

/** 네이버 클라우드 플랫폼 Maps 애플리케이션의 Client ID (브라우저에 노출되며, 등록한 서비스 URL 에서만 동작) */
export const NAVER_MAP_KEY = process.env.NEXT_PUBLIC_NAVER_MAP_KEY ?? "";

const CALLBACK = "__naverMapsInit";

/**
 * 키 파라미터는 ncpKeyId (예전 ncpClientId 는 신규 Maps 서비스에서 바뀜).
 * 인증 실패는 스크립트 로드 후 navermap_authFailure 전역 함수로 알려 줌.
 */
export async function loadNaverMap(clientId: string = NAVER_MAP_KEY): Promise<NaverMapsNamespace> {
  const params = new URLSearchParams({ ncpKeyId: clientId, callback: CALLBACK });
  await loadScriptOnce("naver-maps-sdk", `https://oapi.map.naver.com/openapi/v3/maps.js?${params}`, CALLBACK);
  const maps = window.naver?.maps;
  if (!maps) throw new Error("네이버 지도 SDK 를 찾을 수 없습니다.");
  return maps;
}

export function useNaverLoader(clientId: string = NAVER_MAP_KEY): MapLoaderState<NaverMapsNamespace> {
  return useMapLoader(clientId, () => loadNaverMap(clientId), {
    authFailureGlobal: "navermap_authFailure",
    authFailureMessage:
      "네이버 지도 인증에 실패했습니다. Client ID, Dynamic Map 사용 설정, Web 서비스 URL(이 사이트 주소) 등록을 확인하세요.",
  });
}
