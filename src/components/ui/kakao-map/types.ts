/**
 * 카카오맵 JavaScript SDK 중 이 프로젝트에서 쓰는 부분만 타입으로 정의.
 * 공식 타입 패키지가 없어서 필요한 것만 직접 적음 (더 쓰려면 여기에 추가).
 * 문서: https://apis.map.kakao.com/web/documentation/
 */

export interface LatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMapInstance {
  setCenter(latlng: LatLng): void;
  getCenter(): LatLng;
  panTo(latlng: LatLng): void;
  setLevel(level: number, options?: { animate?: boolean }): void;
  getLevel(): number;
  addControl(control: unknown, position: number): void;
  relayout(): void;
}

export interface KakaoMarker {
  setMap(map: KakaoMapInstance | null): void;
  getPosition(): LatLng;
}

export interface KakaoInfoWindow {
  open(map: KakaoMapInstance, marker?: KakaoMarker): void;
  close(): void;
}

export interface KakaoMouseEvent {
  latLng: LatLng;
}

export interface KakaoMapsNamespace {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  Map: new (container: HTMLElement, options: { center: LatLng; level?: number }) => KakaoMapInstance;
  Marker: new (options: { position: LatLng; map?: KakaoMapInstance; title?: string }) => KakaoMarker;
  InfoWindow: new (options: { content: string | HTMLElement; removable?: boolean }) => KakaoInfoWindow;
  ZoomControl: new () => unknown;
  MapTypeControl: new () => unknown;
  ControlPosition: { RIGHT: number; TOPRIGHT: number };
  event: {
    addListener(target: unknown, type: string, handler: (event?: KakaoMouseEvent) => void): void;
    removeListener(target: unknown, type: string, handler: (event?: KakaoMouseEvent) => void): void;
  };
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsNamespace };
  }
}
