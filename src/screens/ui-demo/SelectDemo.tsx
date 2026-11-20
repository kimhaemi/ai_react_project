"use client";

import { useState } from "react";
import { Button, Select, useToast, type SelectOption } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

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

const USERS: SelectOption[] = [
  { label: "김민준", value: "u1", description: "개발팀", searchText: "김민준 개발팀 minjun" },
  { label: "이서연", value: "u2", description: "디자인팀", searchText: "이서연 디자인팀 seoyeon" },
  { label: "박지훈", value: "u3", description: "개발팀", searchText: "박지훈 개발팀 jihoon" },
  { label: "최수아", value: "u4", description: "기획팀", searchText: "최수아 기획팀 sua" },
  { label: "정도윤", value: "u5", description: "영업팀", searchText: "정도윤 영업팀 doyun" },
  { label: "강하은", value: "u6", description: "인사팀", searchText: "강하은 인사팀 haeun" },
  { label: "조예준", value: "u7", description: "개발팀", searchText: "조예준 개발팀 yejun" },
  { label: "윤지우", value: "u8", description: "마케팅팀", searchText: "윤지우 마케팅팀 jiwoo" },
];

export default function SelectDemo() {
  const toast = useToast();
  const [city, setCity] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>("active");
  const [user, setUser] = useState<string | null>(null);
  const [categories, setCategories] = useState<SelectOption[]>([
    { label: "공지", value: "공지" },
    { label: "이벤트", value: "이벤트" },
    { label: "점검", value: "점검" },
  ]);
  const [category, setCategory] = useState<string | null>(null);

  return (
    <DemoPage
      title="Select"
      description="드롭다운 셀렉트 박스입니다. 키보드(↑↓ 이동, Enter 선택, Esc 닫기)를 지원하고, 검색창과 목록 안 버튼을 넣을 수 있습니다."
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

      <DemoSection
        title="검색 (searchable)"
        description="목록 위 검색창에서 바로 걸러냅니다. 검색창에서도 ↑↓, Enter 가 동작합니다. searchText 로 화면에 안 보이는 글자(영문 이름, 부서)로도 찾을 수 있습니다."
        code={`<Select label="담당자" searchable clearable options={[
  { label: "김민준", value: "u1", description: "개발팀", searchText: "김민준 개발팀 minjun" }, ...
]} value={user} onChange={setUser} />`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="담당자" searchable clearable placeholder="담당자 검색" options={USERS} value={user} onChange={setUser} searchPlaceholder="이름, 부서, 영문 이름" />
          <Select label="지역 (검색)" searchable options={CITIES} defaultValue="seoul" />
        </div>
        <ValueView value={user} />
      </DemoSection>

      <DemoSection
        title="목록 안 버튼 (actions)"
        description="목록 아래에 버튼을 넣습니다. 함수로 넘기면 현재 검색어(query), 선택(select), 닫기(close)를 쓸 수 있어서 '검색어로 새 항목 추가' 같은 기능을 만들 수 있습니다."
        code={`<Select searchable options={categories} value={category} onChange={setCategory}
  actions={({ query, select, close }) => (
    <>
      <Button size="sm" variant="ghost" disabled={!query.trim()}
        onClick={() => { addCategory(query); select(query); }}>+ '{query}' 추가</Button>
      <Button size="sm" variant="ghost" onClick={() => { close(); openManage(); }}>분류 관리</Button>
    </>
  )} />`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="분류"
            searchable
            clearable
            searchPlaceholder="분류 검색 또는 새로 입력"
            options={categories}
            value={category}
            onChange={setCategory}
            actions={({ query, select, close }) => {
              const q = query.trim();
              const exists = categories.some((c) => c.value === q);
              return (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 justify-start text-blue-600"
                    disabled={!q || exists}
                    onClick={() => {
                      setCategories((list) => [...list, { label: q, value: q }]);
                      select(q);
                      toast.success(`'${q}' 분류를 추가했습니다.`);
                    }}
                  >
                    + {q ? `'${q}' 추가` : "검색어를 입력하면 추가"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      close();
                      toast.info("분류 관리 화면으로 이동합니다. (예시)");
                    }}
                  >
                    분류 관리
                  </Button>
                </>
              );
            }}
          />
          <Select
            label="상태 (버튼만)"
            options={[
              { label: "사용", value: "active" },
              { label: "미사용", value: "inactive" },
            ]}
            defaultValue="active"
            actions={({ select }) => (
              <Button size="sm" variant="secondary" block onClick={() => select(null)}>
                선택 안 함
              </Button>
            )}
          />
        </div>
        <ValueView value={{ category, categories: categories.map((c) => c.value) }} />
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
