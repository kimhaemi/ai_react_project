"use client";

import { useState } from "react";
import { Select } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "../_shared/Demo";

const CITIES = [
  { label: "서울", value: "seoul" },
  { label: "부산", value: "busan" },
  { label: "대구", value: "daegu" },
  { label: "인천", value: "incheon" },
  { label: "광주", value: "gwangju" },
  { label: "대전", value: "daejeon" },
  { label: "울산", value: "ulsan" },
  { label: "세종 (준비 중)", value: "sejong", disabled: true },
  { label: "제주", value: "jeju" },
];

export default function SelectDemo() {
  const [city, setCity] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>("active");

  return (
    <DemoPage
      title="Select"
      description="드롭다운 셀렉트 박스입니다. 키보드(↑↓ 이동, Enter 선택, Esc 닫기, 글자 입력으로 찾기)를 지원합니다."
    >
      <DemoSection
        title="기본 / 선택 해제"
        code={`<Select label="지역" options={options} value={city} onChange={setCity} placeholder="지역을 선택하세요" clearable />`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="지역" options={CITIES} value={city} onChange={setCity} placeholder="지역을 선택하세요" clearable hint="세종은 선택할 수 없습니다." />
          <Select
            label="상태"
            options={[
              { label: "사용", value: "active" },
              { label: "미사용", value: "inactive" },
            ]}
            value={status}
            onChange={setStatus}
          />
        </div>
        <ValueView value={{ city, status }} />
      </DemoSection>

      <DemoSection title="오류 / 비활성 / 크기" code={`<Select error="필수 항목입니다." />  <Select disabled />  <Select size="sm" />`}>
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="필수" required options={CITIES} error="필수 항목입니다." />
          <Select label="비활성" options={CITIES} defaultValue="seoul" disabled />
          <Select label="작은 크기" size="sm" options={CITIES} />
        </div>
      </DemoSection>
    </DemoPage>
  );
}
