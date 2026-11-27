/**
 * 네이버 지도 API v3 중 이 프로젝트에서 쓰는 부분만 타입으로 정의.
 * 문서: https://navermaps.github.io/maps.js.ncp/docs/
 */

export interface NaverLatLng {
  lat(): number;
  lng(): number;
}

export interface NaverMapInstance {
  getCenter(): NaverLatLng;
  getZoom(): number;
  panTo(latlng: NaverLatLng): void;
  setZoom(zoom: number, effect?: boolean): void;
  setSize(size: unknown): void;
}

export interface NaverMarker {
  setMap(map: NaverMapInstance | null): void;
}

export interface NaverInfoWindow {
  open(map: NaverMapInstance, anchor?: NaverMarker): void;
  close(): void;
  getMap(): NaverMapInstance | null;
}

export interface NaverPointerEvent {
  coord: NaverLatLng;
}

/** Event.addListener 가 돌려주는 값 (removeListener 에 넘김) */
export type NaverListener = object;

export interface NaverMapsNamespace {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Size: new (width: number, height: number) => unknown;
  Map: new (
    el: HTMLElement,
    options: {
      center: NaverLatLng;
      zoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: { position: number };
      mapTypeControl?: boolean;
    },
  ) => NaverMapInstance;
  Marker: new (options: { position: NaverLatLng; map?: NaverMapInstance; title?: string }) => NaverMarker;
  InfoWindow: new (options: { content: string | HTMLElement }) => NaverInfoWindow;
  Position: { TOP_RIGHT: number; RIGHT_CENTER: number };
  Event: {
    addListener(target: unknown, type: string, handler: (e?: NaverPointerEvent) => void): NaverListener;
    removeListener(listener: NaverListener): void;
  };
}

declare global {
  interface Window {
    naver?: { maps: NaverMapsNamespace };
  }
}
