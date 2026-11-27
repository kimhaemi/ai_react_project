"use client";

import type { ReactNode } from "react";
import type { MapMarker, MapPosition } from "@/components/ui/map";
import { GoogleMap } from "@/components/ui/google-map";
import { KakaoMap } from "@/components/ui/kakao-map";
import { NaverMap } from "@/components/ui/naver-map";

/** 서울시청 */
export const CITY_HALL: MapPosition = { lat: 37.566535, lng: 126.977969 };

/** 지도 데모 공통 마커 (세 지도 비교용으로 같은 데이터) */
export const PLACES: MapMarker[] = [
  { id: "city-hall", lat: 37.566535, lng: 126.977969, title: "서울시청", info: "서울시청" },
  { id: "gyeongbokgung", lat: 37.579617, lng: 126.977041, title: "경복궁", info: "경복궁" },
  { id: "namsan", lat: 37.551169, lng: 126.988227, title: "N서울타워", info: "N서울타워" },
  { id: "dongdaemun", lat: 37.566295, lng: 127.009356, title: "동대문디자인플라자", info: "동대문디자인플라자 (DDP)" },
];

export const roundCoord = (n: number) => Math.round(n * 1e6) / 1e6;

export interface ProviderMapProps {
  center: MapPosition;
  zoom: number;
  markers?: MapMarker[];
  height?: number;
  onClick?: (pos: MapPosition) => void;
  onMarkerClick?: (m: MapMarker) => void;
  onIdle?: (view: { center: MapPosition; zoom: number }) => void;
}

/** 지도마다 다른 확대 단위·사용법을 데모 화면이 같은 방식으로 쓰도록 맞춘 설정 */
export interface MapProvider {
  id: "kakao" | "google" | "naver";
  name: string;
  description: string;
  /** 기본 확대값 (세 지도가 비슷한 범위를 보이도록 맞춤) */
  zoom: number;
  minZoom: number;
  maxZoom: number;
  /** 가까이 보기(확대) 할 때 zoom 이 바뀌는 방향. 카카오는 level 이 작을수록 가까움 */
  zoomInStep: 1 | -1;
  /** 기본 지도 섹션 아래 코드 예시 */
  code: string;
  render: (props: ProviderMapProps) => ReactNode;
}

export const KAKAO: MapProvider = {
  id: "kakao",
  name: "카카오맵",
  description: "카카오맵 JavaScript SDK 를 감싼 공통 KakaoMap 컴포넌트입니다. 키가 없으면 지도 자리에 안내만 표시합니다.",
  zoom: 5,
  minZoom: 1,
  maxZoom: 14,
  zoomInStep: -1,
  code: `import { KakaoMap } from "@/components/ui/kakao-map";

<KakaoMap
  center={{ lat: 37.566535, lng: 126.977969 }}
  level={5}                 // 1(가까이) ~ 14(멀리)
  markers={[{ id: "city-hall", lat: 37.566535, lng: 126.977969, title: "서울시청", info: "서울시청" }]}
  onMarkerClick={(m) => setSelected(m.id)}
  onIdle={({ center, level }) => setView({ center, level })}
/>`,
  render: ({ zoom, onIdle, ...p }) => <KakaoMap {...p} level={zoom} onIdle={onIdle && ((v) => onIdle({ center: v.center, zoom: v.level }))} />,
};

export const GOOGLE: MapProvider = {
  id: "google",
  name: "Google 지도",
  description: "Google Maps JavaScript API 를 감싼 공통 GoogleMap 컴포넌트입니다. 마커는 AdvancedMarkerElement 를 씁니다. 키가 없으면 안내만 표시합니다.",
  zoom: 14,
  minZoom: 3,
  maxZoom: 21,
  zoomInStep: 1,
  code: `import { GoogleMap } from "@/components/ui/google-map";

<GoogleMap
  center={{ lat: 37.566535, lng: 126.977969 }}
  zoom={14}                 // 0(세계) ~ 22(가까이)
  markers={[{ id: "city-hall", lat: 37.566535, lng: 126.977969, title: "서울시청", info: "서울시청" }]}
  onMarkerClick={(m) => setSelected(m.id)}
  onIdle={({ center, zoom }) => setView({ center, zoom })}
/>`,
  render: (p) => <GoogleMap {...p} />,
};

export const NAVER: MapProvider = {
  id: "naver",
  name: "네이버 지도",
  description: "네이버 지도 API v3 를 감싼 공통 NaverMap 컴포넌트입니다. 키가 없으면 지도 자리에 안내만 표시합니다.",
  zoom: 14,
  minZoom: 6,
  maxZoom: 21,
  zoomInStep: 1,
  code: `import { NaverMap } from "@/components/ui/naver-map";

<NaverMap
  center={{ lat: 37.566535, lng: 126.977969 }}
  zoom={14}                 // 숫자가 클수록 가까이
  markers={[{ id: "city-hall", lat: 37.566535, lng: 126.977969, title: "서울시청", info: "서울시청" }]}
  onMarkerClick={(m) => setSelected(m.id)}
  onIdle={({ center, zoom }) => setView({ center, zoom })}
/>`,
  render: (p) => <NaverMap {...p} />,
};

export const MAP_PROVIDERS = [KAKAO, GOOGLE, NAVER];
