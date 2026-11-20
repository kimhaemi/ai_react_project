"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchBox, type SearchField, type SearchValues } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "../_shared/Demo";

const FIELDS: SearchField[] = [
  {
    type: "keyword",
    name: "keyword",
    typeName: "searchType",
    label: "검색어",
    options: [
      { label: "전체", value: "all" },
      { label: "제목", value: "title" },
      { label: "작성자", value: "author" },
      { label: "내용", value: "content" },
    ],
  },
  { type: "dateRange", name: "from", toName: "to", label: "작성일" },
  {
    type: "select",
    name: "category",
    label: "분류",
    placeholder: "전체",
    options: [
      { label: "공지", value: "notice" },
      { label: "이벤트", value: "event" },
      { label: "점검", value: "maintenance" },
    ],
  },
  {
    type: "radio",
    name: "status",
    label: "상태",
    options: [
      { label: "전체", value: "" },
      { label: "게시", value: "published" },
      { label: "숨김", value: "hidden" },
    ],
  },
  {
    type: "checkbox",
    name: "target",
    label: "대상",
    colSpan: 2,
    selectAllLabel: "전체",
    options: [
      { label: "일반 회원", value: "member" },
      { label: "기업 회원", value: "company" },
      { label: "관리자", value: "admin" },
    ],
  },
];

const INITIAL: SearchValues = { searchType: "all", keyword: "", from: "", to: "", category: "", status: "", target: [] };

export default function SearchBoxDemo() {
  const [applied, setApplied] = useState<SearchValues>(INITIAL);

  return (
    <DemoPage
      title="SearchBox"
      description="게시판 상단 검색 영역입니다. 공통 컴포넌트(Input, Select, Radio, Checkbox, Button)로 만들었고, fields 설정만으로 검색 조건을 구성합니다."
    >
      <DemoSection
        title="모든 항목 사용 예시"
        description="검색어 입력 후 Enter 또는 [검색]을 누르면 onSearch 가 호출됩니다. [초기화]는 처음 값으로 되돌립니다."
        code={`const fields: SearchField[] = [
  { type: "keyword", name: "keyword", typeName: "searchType", label: "검색어", options },
  { type: "dateRange", name: "from", toName: "to", label: "작성일" },
  { type: "select", name: "category", label: "분류", options },
  { type: "radio", name: "status", label: "상태", options },
  { type: "checkbox", name: "target", label: "대상", options, colSpan: 2 },
];

<SearchBox fields={fields} initialValues={initial} onSearch={(values) => setApplied(values)} />`}
      >
        <SearchBox fields={FIELDS} initialValues={INITIAL} onSearch={setApplied} />
        <ValueView value={applied} />
      </DemoSection>

      <DemoSection title="실제 적용" description="공지사항 게시판(/notice) 상단 검색 영역도 이 컴포넌트로 만들었습니다.">
        <Link href="/notice" className="text-sm text-blue-600 hover:underline">
          공지사항 게시판으로 이동 →
        </Link>
      </DemoSection>
    </DemoPage>
  );
}
