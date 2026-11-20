"use client";

import { useState } from "react";
import { Checkbox, CheckboxGroup } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

const FRUITS = [
  { label: "사과", value: "apple" },
  { label: "바나나", value: "banana" },
  { label: "포도", value: "grape" },
  { label: "수박 (품절)", value: "melon", disabled: true },
];

export default function CheckboxDemo() {
  const [agree, setAgree] = useState(false);
  const [fruits, setFruits] = useState<string[]>(["apple"]);
  const [notify, setNotify] = useState<string[]>([]);

  return (
    <DemoPage title="Checkbox" description="단일 체크박스와 여러 개를 묶은 체크박스 그룹입니다. 그룹에는 '전체 선택'을 넣을 수 있습니다.">
      <DemoSection title="단일" code={`<Checkbox label="약관에 동의합니다" description="..." checked={agree} onChange={(e) => setAgree(e.target.checked)} />`}>
        <div className="flex flex-col gap-3">
          <Checkbox label="약관에 동의합니다" description="서비스 이용약관 및 개인정보 처리방침" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <Checkbox label="비활성" disabled />
          <Checkbox label="일부 선택 (indeterminate)" indeterminate readOnly />
        </div>
        <ValueView value={{ agree }} />
      </DemoSection>

      <DemoSection
        title="그룹 + 전체 선택"
        code={`<CheckboxGroup label="좋아하는 과일" options={options} value={fruits} onChange={setFruits} selectAllLabel="전체" />`}
      >
        <CheckboxGroup label="좋아하는 과일" options={FRUITS} value={fruits} onChange={setFruits} selectAllLabel="전체" />
        <ValueView value={fruits} />
      </DemoSection>

      <DemoSection title="세로 배치 / 오류" code={`<CheckboxGroup direction="column" required error="하나 이상 선택하세요." ... />`}>
        <CheckboxGroup
          label="알림 수신"
          required
          direction="column"
          options={[
            { label: "이메일", value: "email", description: "주 1회 소식지" },
            { label: "SMS", value: "sms" },
            { label: "앱 푸시", value: "push" },
          ]}
          value={notify}
          onChange={setNotify}
          error={notify.length === 0 ? "하나 이상 선택하세요." : undefined}
        />
      </DemoSection>
    </DemoPage>
  );
}
