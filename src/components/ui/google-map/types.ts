/**
 * Google Maps JavaScript API 중 이 프로젝트에서 쓰는 부분만 타입으로 정의.
 * 공식 타입(@types/google.maps)을 쓰면 더 정확하지만, 의존성을 늘리지 않으려고 필요한 것만 적음.
 * 문서: https://developers.google.com/maps/documentation/javascript/reference
 */

export interface GoogleLatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleLatLngLiteral {
  lat: number;
  lng: number;
}

export interface GoogleMapsEventListener {
  remove(): void;
}

export interface GoogleMapInstance {
  getCenter(): GoogleLatLng | undefined;
  getZoom(): number | undefined;
  panTo(latLng: GoogleLatLngLiteral): void;
  setZoom(zoom: number): void;
  addListener(type: "click", handler: (e: { latLng: GoogleLatLng | null }) => void): GoogleMapsEventListener;
  addListener(type: "idle", handler: () => void): GoogleMapsEventListener;
}

export interface GoogleAdvancedMarker extends EventTarget {
  map: GoogleMapInstance | null;
}

export interface GoogleInfoWindow {
  open(options: { map: GoogleMapInstance; anchor?: GoogleAdvancedMarker }): void;
  close(): void;
}

export interface GoogleMapOptions {
  center: GoogleLatLngLiteral;
  zoom: number;
  /** 고급 마커(AdvancedMarkerElement)를 쓰려면 필요. 테스트는 "DEMO_MAP_ID" */
  mapId: string;
  disableDefaultUI?: boolean;
  clickableIcons?: boolean;
}

export interface GoogleMapsApi {
  Map: new (el: HTMLElement, options: GoogleMapOptions) => GoogleMapInstance;
  InfoWindow: new (options: { content: string | Node }) => GoogleInfoWindow;
  AdvancedMarkerElement: new (options: {
    map?: GoogleMapInstance;
    position: GoogleLatLngLiteral;
    title?: string;
    gmpClickable?: boolean;
  }) => GoogleAdvancedMarker;
}

declare global {
  interface Window {
    google?: {
      maps: {
        importLibrary(name: "maps"): Promise<Pick<GoogleMapsApi, "Map" | "InfoWindow">>;
        importLibrary(name: "marker"): Promise<Pick<GoogleMapsApi, "AdvancedMarkerElement">>;
      };
    };
  }
}
