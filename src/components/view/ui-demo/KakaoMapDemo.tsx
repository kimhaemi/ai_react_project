"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { KakaoMap, type MapMarker, type MapPosition } from "@/components/ui/kakao-map";
import { DemoPage, DemoSection, ValueView } from "./Demo";

/** 서울시청 */
const CITY_HALL: MapPosition = { lat: 37.566535, lng: 126.977969 };

const PLACES: MapMarker[] = [
  { id: "city-hall", lat: 37.566535, lng: 126.977969, title: "서울시청", info: "서울시청" },
  { id: "gyeongbokgung", lat: 37.579617, lng: 126.977041, title: "경복궁", info: "경복궁" },
  { id: "namsan", lat: 37.551169, lng: 126.988227, title: "N서울타워", info: "N서울타워" },
  { id: "dongdaemun", lat: 37.566295, lng: 127.009356, title: "동대문디자인플라자", info: "동대문디자인플라자 (DDP)" },
];

const round = (n: number) => Math.round(n * 1e6) / 1e6;

export default function KakaoMapDemo() {
  const [center, setCenter] = useState<MapPosition>(CITY_HALL);
  const [level, setLevel] = useState(5);
  const [view, setView] = useState<{ center: MapPosition; level: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const [pins, setPins] = useState<MapMarker[]>([]);

  return (
    <DemoPage title="카카오맵" description="카카오맵 JavaScript SDK 를 감싼 공통 KakaoMap 컴포넌트입니다. 키가 없으면 지도 자리에 안내만 표시합니다.">
      <DemoSection
        title="지도 + 마커 + 정보창"
        description="마커 클릭: 정보창 열기 / 버튼: 해당 장소로 이동 / 지도를 끌거나 확대하면 아래 값이 바뀝니다."
        code={`<KakaoMap
  center={{ lat: 37.566535, lng: 126.977969 }}
  level={5}
  markers={[{ id: "city-hall", lat: 37.566535, lng: 126.977969, title: "서울시청", info: "서울시청" }]}
  onMarkerClick={(m) => setSelected(m.id)}
  onIdle={({ center, level }) => setView({ center, level })}
/>`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {PLACES.map((p) => (
            <Button key={p.id} size="sm" variant={selected === p.id ? "primary" : "secondary"} onClick={() => {
              setCenter({ lat: p.lat, lng: p.lng });
              setSelected(String(p.id));
            }}>
              {p.title}
            </Button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setLevel((l) => Math.max(1, l - 1))}>
              확대
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setLevel((l) => Math.min(14, l + 1))}>
              축소
            </Button>
          </div>
        </div>
        <KakaoMap
          center={center}
          level={level}
          markers={PLACES}
          onMarkerClick={(m) => setSelected(String(m.id))}
          onIdle={(v) => {
            // 끌어서 옮긴 위치도 상태에 반영해야 같은 장소 버튼을 다시 눌렀을 때 이동함
            setCenter(v.center);
            setView({ center: { lat: round(v.center.lat), lng: round(v.center.lng) }, level: v.level });
            setLevel(v.level);
          }}
        />
        <ValueView value={{ selected, view }} />
      </DemoSection>

      <DemoSection
        title="지도 클릭으로 마커 추가"
        description="지도를 클릭한 위치에 마커를 추가합니다. 마커를 클릭하면 좌표가 보입니다."
        code={`<KakaoMap
  center={CITY_HALL}
  markers={pins}
  onClick={(pos) => setPins((p) => [...p, { id: Date.now(), ...pos, info: \`\${pos.lat}, \${pos.lng}\` }])}
/>`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">마커 {pins.length}개</span>
          <Button size="sm" variant="secondary" className="ml-auto" disabled={!pins.length} onClick={() => setPins([])}>
            모두 지우기
          </Button>
        </div>
        <KakaoMap
          center={CITY_HALL}
          level={4}
          height={320}
          markers={pins}
          onClick={(pos) => {
            const lat = round(pos.lat);
            const lng = round(pos.lng);
            setPins((p) => [...p, { id: `${lat},${lng},${p.length}`, lat, lng, title: `${p.length + 1}번`, info: `${p.length + 1}번 · ${lat}, ${lng}` }]);
          }}
        />
        <ValueView value={pins.map(({ lat, lng }) => [lat, lng])} />
      </DemoSection>
    </DemoPage>
  );
}
