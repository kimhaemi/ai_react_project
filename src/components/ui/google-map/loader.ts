"use client";

import { loadScriptOnce, useMapLoader, type MapLoaderState } from "@/components/ui/map";
import type { GoogleMapsApi } from "./types";

/** Google Cloud 콘솔의 API 키 (Maps JavaScript API 사용 설정, HTTP 리퍼러 제한 권장) */
export const GOOGLE_MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? "";
/** 고급 마커용 지도 ID. 비우면 구글이 제공하는 테스트용 DEMO_MAP_ID 사용 */
export const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID";

const CALLBACK = "__googleMapsInit";

/** loading=async + callback 으로 불러온 뒤 필요한 라이브러리(maps, marker)를 가져옴 */
export async function loadGoogleMap(apiKey: string = GOOGLE_MAP_KEY): Promise<GoogleMapsApi> {
  const params = new URLSearchParams({ key: apiKey, v: "weekly", loading: "async", language: "ko", region: "KR", callback: CALLBACK });
  await loadScriptOnce("google-maps-sdk", `https://maps.googleapis.com/maps/api/js?${params}`, CALLBACK);
  const gm = window.google?.maps;
  if (!gm) throw new Error("Google Maps SDK 를 찾을 수 없습니다.");
  const [{ Map, InfoWindow }, { AdvancedMarkerElement }] = await Promise.all([gm.importLibrary("maps"), gm.importLibrary("marker")]);
  return { Map, InfoWindow, AdvancedMarkerElement };
}

export function useGoogleLoader(apiKey: string = GOOGLE_MAP_KEY): MapLoaderState<GoogleMapsApi> {
  return useMapLoader(apiKey, () => loadGoogleMap(apiKey), {
    authFailureGlobal: "gm_authFailure",
    authFailureMessage:
      "Google Maps 인증에 실패했습니다. API 키, Maps JavaScript API 사용 설정, 결제 계정 연결, HTTP 리퍼러 제한(이 사이트 주소 포함)을 확인하세요.",
  });
}
