"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { MapPosition } from "@/components/ui/map";
import { DemoPage, DemoSection } from "./Demo";
import { CITY_HALL, MAP_PROVIDERS, PLACES } from "./map-sample";

/** 붙이면서 확인한 설정 차이 (2026-11 기준). 요금은 자주 바뀌어서 적지 않음 — 각 콘솔에서 확인 */
const ROWS: { label: string; kakao: string; google: string; naver: string }[] = [
  { label: "키 발급", kakao: "Kakao Developers", google: "Google Cloud 콘솔", naver: "네이버 클라우드 플랫폼 콘솔 › Maps" },
  { label: "쓰는 키", kakao: "JavaScript 키", google: "API 키", naver: "Client ID (ncpKeyId 파라미터)" },
  { label: "환경 변수", kakao: "NEXT_PUBLIC_KAKAO_MAP_KEY", google: "NEXT_PUBLIC_GOOGLE_MAP_KEY (+ 선택 NEXT_PUBLIC_GOOGLE_MAP_ID)", naver: "NEXT_PUBLIC_NAVER_MAP_KEY" },
  { label: "추가 설정", kakao: "카카오맵 사용 설정 ON", google: "Maps JavaScript API 사용 설정", naver: "Dynamic Map 사용 설정" },
  { label: "도메인 제한", kakao: "사이트 도메인 등록 (필수)", google: "HTTP 리퍼러 제한 (선택, 권장)", naver: "Web 서비스 URL 등록 (필수)" },
  { label: "결제 정보 등록", kakao: "필요 없음", google: "필요 (결제 계정 연결)", naver: "필요 (결제 수단 등록)" },
  { label: "확대 단위", kakao: "level 1(가까이) ~ 14", google: "zoom 0 ~ 22(가까이)", naver: "zoom 클수록 가까이" },
  { label: "마커", kakao: "Marker", google: "AdvancedMarkerElement (지도 ID 필요)", naver: "Marker" },
  { label: "거리 사진", kakao: "로드뷰", google: "스트리트 뷰", naver: "거리뷰 (panorama 서브모듈)" },
  { label: "주소·장소 검색", kakao: "services 라이브러리 (주소·키워드)", google: "Places API, Geocoding (별도 사용 설정)", naver: "geocoder 서브모듈 (주소↔좌표만)" },
  { label: "인증 실패 감지", kakao: "스크립트 요청이 실패함", google: "gm_authFailure 전역 함수", naver: "navermap_authFailure 전역 함수" },
];

export default function MapCompare() {
  const [center, setCenter] = useState<MapPosition>(CITY_HALL);
  const [selected, setSelected] = useState<string>("city-hall");

  return (
    <DemoPage wide title="지도 비교" description="카카오맵 · Google 지도 · 네이버 지도를 같은 마커로 나란히 띄워 비교합니다. 키가 없는 지도는 안내만 표시합니다.">
      <DemoSection title="같은 위치 나란히 보기" description="버튼을 누르면 세 지도가 같은 장소로 이동합니다.">
        <div className="mb-3 flex flex-wrap gap-2">
          {PLACES.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={selected === p.id ? "primary" : "secondary"}
              onClick={() => {
                setCenter({ lat: p.lat, lng: p.lng });
                setSelected(String(p.id));
              }}
            >
              {p.title}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {MAP_PROVIDERS.map((provider) => (
            <div key={provider.id} className="min-w-0">
              <h3 className="mb-2 text-sm font-semibold">{provider.name}</h3>
              {provider.render({ center, zoom: provider.zoom, markers: PLACES, height: 360 })}
            </div>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="설정 · 기능 차이" description="2026-11 기준. 무료 사용량과 요금은 자주 바뀌므로 각 콘솔에서 확인하세요.">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="w-36 py-2 pr-3 font-medium">항목</th>
              {MAP_PROVIDERS.map((p) => (
                <th key={p.id} className="py-2 pr-3 font-medium">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-gray-100 align-top">
                <th className="py-2 pr-3 font-medium text-gray-700">{row.label}</th>
                <td className="py-2 pr-3 break-words">{row.kakao}</td>
                <td className="py-2 pr-3 break-words">{row.google}</td>
                <td className="py-2 pr-3 break-words">{row.naver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DemoSection>
    </DemoPage>
  );
}
