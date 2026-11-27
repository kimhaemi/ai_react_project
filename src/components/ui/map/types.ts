import type { CSSProperties } from "react";

/** 카카오·구글·네이버 지도가 같이 쓰는 타입 */

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MapMarker extends MapPosition {
  id: string | number;
  /** 마우스를 올렸을 때 보이는 글 */
  title?: string;
  /** 클릭하면 열리는 정보창 글 (없으면 정보창 없음). 일반 글로만 넣음 (HTML 해석 안 함) */
  info?: string;
}

/** 세 지도의 공통 props. 확대 단위는 지도마다 달라서 각 컴포넌트에서 따로 받음 */
export interface BaseMapProps {
  /** 지도 중심. 바꾸면 부드럽게 이동 */
  center: MapPosition;
  markers?: MapMarker[];
  /** 기본 컨트롤(확대/축소, 지도 종류) 표시 (기본 true) */
  controls?: boolean;
  /** 지도 높이 (기본 400) */
  height?: CSSProperties["height"];
  className?: string;
  onClick?: (position: MapPosition) => void;
  onMarkerClick?: (marker: MapMarker) => void;
}

/** 정보창 안에 넣을 요소. 글은 textContent 로만 넣어 HTML 주입을 막음 */
export function infoContent(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "px-3 py-2 text-sm whitespace-nowrap text-gray-800";
  el.textContent = text;
  return el;
}

export const DEFAULT_MAP_HEIGHT = 400;
export const MAP_BOX_CLASS = "w-full overflow-hidden rounded-lg border border-gray-200";
