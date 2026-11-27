"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DEFAULT_MAP_HEIGHT, MAP_BOX_CLASS, infoContent, loaderNotice, type BaseMapProps, type MapPosition } from "@/components/ui/map";
import { KAKAO_MAP_KEY, useKakaoLoader } from "./loader";
import type { KakaoInfoWindow, KakaoMapInstance, KakaoMapsNamespace, KakaoMouseEvent } from "./types";

export type { MapMarker, MapPosition } from "@/components/ui/map";

export interface KakaoMapProps extends BaseMapProps {
  /** 확대 수준 1(가까이) ~ 14(멀리). 기본 3 */
  level?: number;
  /** 이동·확대가 끝났을 때 */
  onIdle?: (view: { center: MapPosition; level: number }) => void;
}

/**
 * 카카오맵. NEXT_PUBLIC_KAKAO_MAP_KEY 가 없으면 지도 대신 안내를 보여 줌.
 * SDK 는 이 컴포넌트가 처음 화면에 나올 때 한 번만 불러옴.
 */
export function KakaoMap(props: KakaoMapProps) {
  const height = props.height ?? DEFAULT_MAP_HEIGHT;
  const loader = useKakaoLoader(KAKAO_MAP_KEY);
  if (loader.status !== "ready") {
    return loaderNotice(
      loader,
      height,
      "카카오맵 키가 없어 지도를 표시하지 않습니다. https://developers.kakao.com 에서 JavaScript 키를 받아 .env.local 의 NEXT_PUBLIC_KAKAO_MAP_KEY 에 넣고 서버를 다시 실행하세요.",
    );
  }
  return <MapView {...props} height={height} maps={loader.api} />;
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
        infoWindow = new maps.InfoWindow({ content: infoContent(m.info), removable: true });
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

  return <div ref={containerRef} style={{ height }} className={cn(MAP_BOX_CLASS, className)} />;
}
