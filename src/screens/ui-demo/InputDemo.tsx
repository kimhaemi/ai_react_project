"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function InputDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("wrong-email");
  const emailError = email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "이메일 형식이 올바르지 않습니다." : undefined;

  return (
    <DemoPage title="Input" description="라벨, 도움말, 오류 메시지, 아이콘, 크기를 지원하는 입력창입니다. 기본 input 속성을 모두 쓸 수 있습니다.">
      <DemoSection
        title="기본"
        code={`<Input label="이름" required placeholder="이름을 입력하세요" hint="실명을 입력해 주세요."
       value={name} onChange={(e) => setName(e.target.value)} />`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="이름" required placeholder="이름을 입력하세요" hint="실명을 입력해 주세요." value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
        </div>
        <ValueView value={{ name, email }} />
      </DemoSection>

      <DemoSection title="아이콘 / 비활성 / 읽기 전용" code={`<Input icon={<SearchIcon />} placeholder="검색" />\n<Input disabled />\n<Input readOnly />`}>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="아이콘" icon={<SearchIcon />} placeholder="검색어" />
          <Input label="비활성" disabled defaultValue="수정할 수 없음" />
          <Input label="읽기 전용" readOnly defaultValue="읽기 전용 값" />
        </div>
      </DemoSection>

      <DemoSection title="크기" code={`<Input size="sm" />  <Input size="md" />  <Input size="lg" />`}>
        <div className="grid gap-4 md:grid-cols-3">
          <Input size="sm" placeholder="sm" aria-label="small" />
          <Input size="md" placeholder="md (기본)" aria-label="medium" />
          <Input size="lg" placeholder="lg" aria-label="large" />
        </div>
      </DemoSection>
    </DemoPage>
  );
}
