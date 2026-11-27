"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DEFAULT_MAP_HEIGHT, MAP_BOX_CLASS, infoContent, loaderNotice, type BaseMapProps, type MapPosition } from "@/components/ui/map";
import { GOOGLE_MAP_ID, GOOGLE_MAP_KEY, useGoogleLoader } from "./loader";
import type { GoogleInfoWindow, GoogleMapInstance, GoogleMapsApi } from "./types";

export interface GoogleMapProps extends BaseMapProps {
  /** 확대 수준 0(세계) ~ 22(가까이). 기본 15 */
  zoom?: number;
  /** 이동·확대가 끝났을 때 */
  onIdle?: (view: { center: MapPosition; zoom: number }) => void;
}

/**
 * Google 지도. NEXT_PUBLIC_GOOGLE_MAP_KEY 가 없으면 지도 대신 안내를 보여 줌.
 * 마커는 권장 방식인 AdvancedMarkerElement 를 씀 (지도 ID 필요, 기본 DEMO_MAP_ID).
 */
export function GoogleMap(props: GoogleMapProps) {
  const height = props.height ?? DEFAULT_MAP_HEIGHT;
  const loader = useGoogleLoader(GOOGLE_MAP_KEY);
  if (loader.status !== "ready") {
    return loaderNotice(
      loader,
      height,
      "Google Maps API 키가 없어 지도를 표시하지 않습니다. Google Cloud 콘솔에서 Maps JavaScript API 를 사용 설정하고 키를 받아 .env.local 의 NEXT_PUBLIC_GOOGLE_MAP_KEY 에 넣고 서버를 다시 실행하세요.",
    );
  }
  return <MapView {...props} height={height} api={loader.api} />;
}

function MapView({
  api,
  center,
  zoom = 15,
  markers,
  controls = true,
  height,
  className,
  onClick,
  onMarkerClick,
  onIdle,
}: GoogleMapProps & { api: GoogleMapsApi }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMapInstance | null>(null);

  const handlers = useRef({ onClick, onMarkerClick, onIdle });
  useEffect(() => {
    handlers.current = { onClick, onMarkerClick, onIdle };
  });

  const initial = useRef({ center, zoom, controls });

  // 지도 생성 (한 번). 구글 지도는 컨테이너 크기 변화를 스스로 반영함
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const { center: c, zoom: z, controls: withControls } = initial.current;
    const instance = new api.Map(container, {
      center: c,
      zoom: z,
      mapId: GOOGLE_MAP_ID,
      disableDefaultUI: !withControls,
      clickableIcons: false,
    });
    const listeners = [
      instance.addListener("click", (e) => {
        if (e.latLng) handlers.current.onClick?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }),
      instance.addListener("idle", () => {
        const pos = instance.getCenter();
        if (pos) handlers.current.onIdle?.({ center: { lat: pos.lat(), lng: pos.lng() }, zoom: instance.getZoom() ?? z });
      }),
    ];
    setMap(instance);
    return () => {
      listeners.forEach((l) => l.remove());
      setMap(null);
    };
  }, [api]);

  useEffect(() => {
    map?.panTo({ lat: center.lat, lng: center.lng });
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (map && map.getZoom() !== zoom) map.setZoom(zoom);
  }, [map, zoom]);

  // 마커 + 정보창
  useEffect(() => {
    if (!map || !markers?.length) return;
    let opened: GoogleInfoWindow | null = null;
    const cleanups = markers.map((m) => {
      const marker = new api.AdvancedMarkerElement({ map, position: { lat: m.lat, lng: m.lng }, title: m.title, gmpClickable: true });
      const infoWindow = m.info ? new api.InfoWindow({ content: infoContent(m.info) }) : null;
      const handleClick = () => {
        if (infoWindow) {
          opened?.close();
          infoWindow.open({ map, anchor: marker });
          opened = infoWindow;
        }
        handlers.current.onMarkerClick?.(m);
      };
      // 고급 마커는 click 대신 gmp-click 이벤트를 씀
      marker.addEventListener("gmp-click", handleClick);
      return () => {
        marker.removeEventListener("gmp-click", handleClick);
        infoWindow?.close();
        marker.map = null;
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [map, api, markers]);

  return <div ref={containerRef} style={{ height }} className={cn(MAP_BOX_CLASS, className)} />;
}
