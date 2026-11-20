"use client";

import { useState } from "react";
import { RadioGroup } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

export default function RadioDemo() {
  const [gender, setGender] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("basic");
  const [period, setPeriod] = useState<string>("1m");

  return (
    <DemoPage title="Radio" description="여러 항목 중 하나만 고르는 라디오 그룹입니다. 기본 모양과 버튼(세그먼트) 모양을 지원합니다.">
      <DemoSection title="기본" code={`<RadioGroup label="성별" options={options} value={gender} onChange={setGender} />`}>
        <RadioGroup
          label="성별"
          required
          options={[
            { label: "남성", value: "m" },
            { label: "여성", value: "f" },
            { label: "선택 안 함", value: "none" },
          ]}
          value={gender}
          onChange={setGender}
          hint="선택 사항입니다."
        />
        <ValueView value={gender} />
      </DemoSection>

      <DemoSection title="세로 배치 + 설명" code={`<RadioGroup direction="column" options={[{ label, value, description }]} ... />`}>
        <RadioGroup
          label="요금제"
          direction="column"
          options={[
            { label: "Basic", value: "basic", description: "월 9,900원" },
            { label: "Pro", value: "pro", description: "월 19,900원" },
            { label: "Enterprise", value: "ent", description: "문의 필요", disabled: true },
          ]}
          value={plan}
          onChange={setPlan}
        />
        <ValueView value={plan} />
      </DemoSection>

      <DemoSection title="버튼 모양" code={`<RadioGroup variant="button" options={options} value={period} onChange={setPeriod} />`}>
        <RadioGroup
          label="조회 기간"
          variant="button"
          options={[
            { label: "오늘", value: "1d" },
            { label: "1주일", value: "1w" },
            { label: "1개월", value: "1m" },
            { label: "3개월", value: "3m" },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <ValueView value={period} />
      </DemoSection>
    </DemoPage>
  );
}
