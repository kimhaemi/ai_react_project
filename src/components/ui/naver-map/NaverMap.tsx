"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DEFAULT_MAP_HEIGHT, MAP_BOX_CLASS, infoContent, loaderNotice, type BaseMapProps, type MapPosition } from "@/components/ui/map";
import { NAVER_MAP_KEY, useNaverLoader } from "./loader";
import type { NaverInfoWindow, NaverMapInstance, NaverMapsNamespace, NaverPointerEvent } from "./types";

export interface NaverMapProps extends BaseMapProps {
  /** 확대 수준 (숫자가 클수록 가까이, 대략 6 ~ 21). 기본 15 */
  zoom?: number;
  /** 이동·확대가 끝났을 때 */
  onIdle?: (view: { center: MapPosition; zoom: number }) => void;
}

/** 네이버 지도. NEXT_PUBLIC_NAVER_MAP_KEY 가 없으면 지도 대신 안내를 보여 줌 */
export function NaverMap(props: NaverMapProps) {
  const height = props.height ?? DEFAULT_MAP_HEIGHT;
  const loader = useNaverLoader(NAVER_MAP_KEY);
  if (loader.status !== "ready") {
    return loaderNotice(
      loader,
      height,
      "네이버 지도 Client ID 가 없어 지도를 표시하지 않습니다. 네이버 클라우드 플랫폼 콘솔 Maps 에서 애플리케이션을 만들고 Client ID 를 .env.local 의 NEXT_PUBLIC_NAVER_MAP_KEY 에 넣고 서버를 다시 실행하세요.",
    );
  }
  return <MapView {...props} height={height} maps={loader.api} />;
}

function MapView({
  maps,
  center,
  zoom = 15,
  markers,
  controls = true,
  height,
  className,
  onClick,
  onMarkerClick,
  onIdle,
}: NaverMapProps & { maps: NaverMapsNamespace }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<NaverMapInstance | null>(null);

  const handlers = useRef({ onClick, onMarkerClick, onIdle });
  useEffect(() => {
    handlers.current = { onClick, onMarkerClick, onIdle };
  });

  const initial = useRef({ center, zoom, controls });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const { center: c, zoom: z, controls: withControls } = initial.current;
    const instance = new maps.Map(container, {
      center: new maps.LatLng(c.lat, c.lng),
      zoom: z,
      zoomControl: withControls,
      zoomControlOptions: { position: maps.Position.RIGHT_CENTER },
      mapTypeControl: withControls,
    });
    const listeners = [
      maps.Event.addListener(instance, "click", (e?: NaverPointerEvent) => {
        if (e) handlers.current.onClick?.({ lat: e.coord.lat(), lng: e.coord.lng() });
      }),
      maps.Event.addListener(instance, "idle", () => {
        const pos = instance.getCenter();
        handlers.current.onIdle?.({ center: { lat: pos.lat(), lng: pos.lng() }, zoom: instance.getZoom() });
      }),
    ];

    // 컨테이너 크기가 바뀌면(메뉴 접기 등) 지도 크기를 맞춤
    const observer = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      if (width && h) instance.setSize(new maps.Size(width, h));
    });
    observer.observe(container);

    setMap(instance);
    return () => {
      observer.disconnect();
      listeners.forEach((l) => maps.Event.removeListener(l));
      setMap(null);
    };
  }, [maps]);

  useEffect(() => {
    map?.panTo(new maps.LatLng(center.lat, center.lng));
  }, [map, maps, center.lat, center.lng]);

  useEffect(() => {
    if (map && map.getZoom() !== zoom) map.setZoom(zoom, true);
  }, [map, zoom]);

  useEffect(() => {
    if (!map || !markers?.length) return;
    let opened: NaverInfoWindow | null = null;
    const cleanups = markers.map((m) => {
      const marker = new maps.Marker({ position: new maps.LatLng(m.lat, m.lng), map, title: m.title });
      const infoWindow = m.info ? new maps.InfoWindow({ content: infoContent(m.info) }) : null;
      const listener = maps.Event.addListener(marker, "click", () => {
        if (infoWindow) {
          // 같은 마커를 다시 누르면 닫기
          if (infoWindow.getMap()) {
            infoWindow.close();
            opened = null;
          } else {
            opened?.close();
            infoWindow.open(map, marker);
            opened = infoWindow;
          }
        }
        handlers.current.onMarkerClick?.(m);
      });
      return () => {
        maps.Event.removeListener(listener);
        infoWindow?.close();
        marker.setMap(null);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [map, maps, markers]);

  return <div ref={containerRef} style={{ height }} className={cn(MAP_BOX_CLASS, className)} />;
}
