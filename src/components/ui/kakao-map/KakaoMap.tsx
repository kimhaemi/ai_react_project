"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { KAKAO_MAP_KEY, useKakaoLoader } from "./loader";
import type { KakaoInfoWindow, KakaoMapInstance, KakaoMapsNamespace, KakaoMouseEvent } from "./types";

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

export interface KakaoMapProps {
  /** 지도 중심. 바꾸면 부드럽게 이동 */
  center: MapPosition;
  /** 확대 수준 1(가까이) ~ 14(멀리). 기본 3 */
  level?: number;
  markers?: MapMarker[];
  /** 확대/축소, 지도/스카이뷰 버튼 표시 (기본 true) */
  controls?: boolean;
  /** 지도 높이 (기본 400) */
  height?: CSSProperties["height"];
  className?: string;
  onClick?: (position: MapPosition) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  /** 이동·확대가 끝났을 때 */
  onIdle?: (view: { center: MapPosition; level: number }) => void;
}

/** 키 없음 / 로딩 / 오류일 때 지도 자리에 보이는 안내 */
function MapNotice({ tone, height, children }: { tone: "info" | "warn" | "error"; height: KakaoMapProps["height"]; children: ReactNode }) {
  return (
    <div
      style={{ height }}
      className={cn(
        "flex items-center justify-center rounded-lg border px-4 text-center text-sm",
        tone === "info" && "border-gray-200 bg-gray-50 text-gray-500",
        tone === "warn" && "border-amber-300 bg-amber-50 text-amber-800",
        tone === "error" && "border-red-300 bg-red-50 text-red-800",
      )}
    >
      <p>{children}</p>
    </div>
  );
}

/**
 * 카카오맵. NEXT_PUBLIC_KAKAO_MAP_KEY 가 없으면 지도 대신 안내를 보여 줌.
 * SDK 는 이 컴포넌트가 처음 화면에 나올 때 한 번만 불러옴.
 */
export function KakaoMap(props: KakaoMapProps) {
  const height = props.height ?? 400;
  const loader = useKakaoLoader(KAKAO_MAP_KEY);

  if (loader.status === "no-key") {
    return (
      <MapNotice tone="warn" height={height}>
        카카오맵 키가 없어 지도를 표시하지 않습니다. https://developers.kakao.com 에서 JavaScript 키를 받아
        .env.local 의 NEXT_PUBLIC_KAKAO_MAP_KEY 에 넣고 서버를 다시 실행하세요.
      </MapNotice>
    );
  }
  if (loader.status === "error") {
    return (
      <MapNotice tone="error" height={height}>
        {loader.error.message}
      </MapNotice>
    );
  }
  if (loader.status === "loading") {
    return (
      <MapNotice tone="info" height={height}>
        지도를 불러오는 중…
      </MapNotice>
    );
  }
  return <MapView {...props} height={height} maps={loader.maps} />;
}

function MapView({
  maps,
  center,
  level = 3,
  markers,
  controls = true,
  height,
  className,
  onClick,
  onMarkerClick,
  onIdle,
}: KakaoMapProps & { maps: KakaoMapsNamespace }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<KakaoMapInstance | null>(null);

  // 콜백은 최신 값만 쓰도록 ref 에 보관 (바뀔 때마다 이벤트를 다시 걸지 않기 위함)
  const handlers = useRef({ onClick, onMarkerClick, onIdle });
  useEffect(() => {
    handlers.current = { onClick, onMarkerClick, onIdle };
  });

  // 처음 위치·확대값은 생성 때만 쓰고, 이후 변경은 아래 effect 에서 반영
  const initial = useRef({ center, level, controls });

  // 지도 생성 (한 번)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const { center: c, level: l, controls: withControls } = initial.current;
    const instance = new maps.Map(container, { center: new maps.LatLng(c.lat, c.lng), level: l });
    if (withControls) {
      instance.addControl(new maps.MapTypeControl(), maps.ControlPosition.TOPRIGHT);
      instance.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
    }

    const handleClick = (e?: KakaoMouseEvent) => {
      if (e) handlers.current.onClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() });
    };
    const handleIdle = () => {
      const pos = instance.getCenter();
      handlers.current.onIdle?.({ center: { lat: pos.getLat(), lng: pos.getLng() }, level: instance.getLevel() });
    };
    maps.event.addListener(instance, "click", handleClick);
    maps.event.addListener(instance, "idle", handleIdle);

    // 컨테이너 크기가 바뀌면(메뉴 접기 등) 지도를 다시 그림
    const observer = new ResizeObserver(() => instance.relayout());
    observer.observe(container);

    setMap(instance);
    return () => {
      observer.disconnect();
      maps.event.removeListener(instance, "click", handleClick);
      maps.event.removeListener(instance, "idle", handleIdle);
      setMap(null);
    };
  }, [maps]);

  // 중심 이동
  useEffect(() => {
    map?.panTo(new maps.LatLng(center.lat, center.lng));
  }, [map, maps, center.lat, center.lng]);

  // 확대 수준
  useEffect(() => {
    if (map && map.getLevel() !== level) map.setLevel(level, { animate: true });
  }, [map, level]);

  // 마커 + 정보창 (목록이 바뀌면 모두 다시 만듦)
  useEffect(() => {
    if (!map || !markers?.length) return;
    let opened: KakaoInfoWindow | null = null;
    const cleanups = markers.map((m) => {
      const marker = new maps.Marker({ position: new maps.LatLng(m.lat, m.lng), map, title: m.title });
      let infoWindow: KakaoInfoWindow | null = null;
      if (m.info) {
        const content = document.createElement("div");
        content.className = "px-3 py-2 text-sm whitespace-nowrap";
        content.textContent = m.info;
        infoWindow = new maps.InfoWindow({ content, removable: true });
      }
      const handleClick = () => {
        if (infoWindow) {
          opened?.close();
          infoWindow.open(map, marker);
          opened = infoWindow;
        }
        handlers.current.onMarkerClick?.(m);
      };
      maps.event.addListener(marker, "click", handleClick);
      return () => {
        maps.event.removeListener(marker, "click", handleClick);
        infoWindow?.close();
        marker.setMap(null);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [map, maps, markers]);

  return <div ref={containerRef} style={{ height }} className={cn("w-full overflow-hidden rounded-lg border border-gray-200", className)} />;
}
