"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { MapMarker, MapPosition } from "@/components/ui/map";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { CITY_HALL, GOOGLE, KAKAO, NAVER, PLACES, roundCoord, type MapProvider } from "./map-sample";

/** 카카오·구글·네이버 지도 데모 공통 화면 (같은 데이터, 같은 조작) */
function MapDemo({ provider }: { provider: MapProvider }) {
  const [center, setCenter] = useState<MapPosition>(CITY_HALL);
  const [zoom, setZoom] = useState(provider.zoom);
  const [view, setView] = useState<{ center: MapPosition; zoom: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pins, setPins] = useState<MapMarker[]>([]);

  const clamp = (z: number) => Math.min(provider.maxZoom, Math.max(provider.minZoom, z));
  const zoomKey = provider.id === "kakao" ? "level" : "zoom";

  return (
    <DemoPage title={provider.name} description={provider.description}>
      <DemoSection
        title="지도 + 마커 + 정보창"
        description="마커 클릭: 정보창 열기 / 버튼: 해당 장소로 이동 / 지도를 끌거나 확대하면 아래 값이 바뀝니다."
        code={provider.code}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
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
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setZoom((z) => clamp(z + provider.zoomInStep))}>
              확대
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setZoom((z) => clamp(z - provider.zoomInStep))}>
              축소
            </Button>
          </div>
        </div>
        {provider.render({
          center,
          zoom,
          markers: PLACES,
          onMarkerClick: (m) => setSelected(String(m.id)),
          onIdle: (v) => {
            // 끌어서 옮긴 위치도 상태에 반영해야 같은 장소 버튼을 다시 눌렀을 때 이동함
            setCenter(v.center);
            setZoom(v.zoom);
            setView({ center: { lat: roundCoord(v.center.lat), lng: roundCoord(v.center.lng) }, zoom: v.zoom });
          },
        })}
        <ValueView value={{ selected, center: view?.center, [zoomKey]: view?.zoom }} />
      </DemoSection>

      <DemoSection
        title="지도 클릭으로 마커 추가"
        description="지도를 클릭한 위치에 마커를 추가합니다. 마커를 클릭하면 좌표가 보입니다."
        code={`onClick={(pos) => setPins((p) => [...p, { id: ..., ...pos, info: \`\${pos.lat}, \${pos.lng}\` }])}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">마커 {pins.length}개</span>
          <Button size="sm" variant="secondary" className="ml-auto" disabled={!pins.length} onClick={() => setPins([])}>
            모두 지우기
          </Button>
        </div>
        {provider.render({
          center: CITY_HALL,
          zoom: clamp(provider.zoom + provider.zoomInStep),
          height: 320,
          markers: pins,
          onClick: (pos) => {
            const lat = roundCoord(pos.lat);
            const lng = roundCoord(pos.lng);
            setPins((p) => [...p, { id: `${lat},${lng},${p.length}`, lat, lng, title: `${p.length + 1}번`, info: `${p.length + 1}번 · ${lat}, ${lng}` }]);
          },
        })}
        <ValueView value={pins.map(({ lat, lng }) => [lat, lng])} />
      </DemoSection>
    </DemoPage>
  );
}

export const KakaoMapDemo = () => <MapDemo provider={KAKAO} />;
export const GoogleMapDemo = () => <MapDemo provider={GOOGLE} />;
export const NaverMapDemo = () => <MapDemo provider={NAVER} />;
