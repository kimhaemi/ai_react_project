"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { DemoPage, DemoSection } from "../_shared/Demo";

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  const save = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1500);
  };

  return (
    <DemoPage title="Button" description="종류(variant), 크기, 아이콘, 처리 중(loading) 상태를 지원하는 버튼입니다. 기본 type 은 button 입니다.">
      <DemoSection title="종류" code={`<Button variant="primary" | "secondary" | "outline" | "danger" | "ghost">저장</Button>`}>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </DemoSection>

      <DemoSection title="크기" code={`<Button size="sm" />  <Button size="md" />  <Button size="lg" />`}>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </DemoSection>

      <DemoSection title="아이콘 / 처리 중 / 전체 너비" code={`<Button icon={<PlusIcon />}>등록</Button>\n<Button loading={loading} onClick={save}>저장</Button>\n<Button block>전체 너비</Button>`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button icon={<PlusIcon />}>등록</Button>
            <Button loading={loading} onClick={save}>
              {loading ? "저장 중..." : "저장 (클릭)"}
            </Button>
          </div>
          <Button block variant="secondary">
            전체 너비
          </Button>
        </div>
      </DemoSection>
    </DemoPage>
  );
}
