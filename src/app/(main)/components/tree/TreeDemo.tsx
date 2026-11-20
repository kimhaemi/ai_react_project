"use client";

import { useState } from "react";
import { Button, Tree, getBranchIds, getLeafIds, type TreeNode } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "../_shared/Demo";

const ORG: TreeNode[] = [
  {
    id: "hq",
    label: "본사",
    children: [
      {
        id: "dev",
        label: "개발본부",
        children: [
          { id: "fe", label: "프론트엔드팀" },
          { id: "be", label: "백엔드팀" },
          { id: "qa", label: "QA팀", disabled: true },
        ],
      },
      {
        id: "biz",
        label: "사업본부",
        children: [
          { id: "sales", label: "영업팀" },
          { id: "mkt", label: "마케팅팀" },
        ],
      },
      { id: "hr", label: "인사팀" },
    ],
  },
  { id: "branch", label: "지사", children: [{ id: "busan", label: "부산지사" }, { id: "daegu", label: "대구지사" }] },
];

export default function TreeDemo() {
  const [selected, setSelected] = useState<string | null>("fe");
  const [expanded, setExpanded] = useState<string[]>(["hq", "dev"]);
  const [checked, setChecked] = useState<string[]>(["fe", "sales"]);

  return (
    <DemoPage title="Tree" description="계층 구조 데이터를 펼치고 접고, 선택하거나 체크할 수 있는 트리입니다.">
      <DemoSection
        title="기본 (선택)"
        description="행을 클릭하면 선택됩니다. 화살표로 펼치고 접습니다."
        code={`<Tree nodes={nodes} selectedId={selected} onSelect={(n) => setSelected(n.id)} defaultExpandedIds={["hq"]} />`}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-gray-200 p-2">
            <Tree nodes={ORG} selectedId={selected} onSelect={(n) => setSelected(n.id)} defaultExpandedIds={["hq", "dev"]} />
          </div>
          <ValueView value={{ selectedId: selected }} />
        </div>
      </DemoSection>

      <DemoSection
        title="체크박스 + 모두 펼치기/접기"
        description="상위 항목을 체크하면 하위 항목이 모두 체크됩니다. 일부만 체크되면 '-' 로 표시됩니다. 비활성(QA팀)은 제외됩니다."
        code={`<Tree nodes={nodes} checkable checkedIds={checked} onCheckedChange={setChecked}
      expandedIds={expanded} onExpandedChange={setExpanded} />
<Button onClick={() => setExpanded(getBranchIds(nodes))}>모두 펼치기</Button>`}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setExpanded(getBranchIds(ORG))}>모두 펼치기</Button>
          <Button size="sm" variant="secondary" onClick={() => setExpanded([])}>모두 접기</Button>
          <Button size="sm" variant="secondary" onClick={() => setChecked(getLeafIds(ORG).filter((id) => id !== "qa"))}>모두 선택</Button>
          <Button size="sm" variant="secondary" onClick={() => setChecked([])}>선택 해제</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-gray-200 p-2">
            <Tree nodes={ORG} checkable checkedIds={checked} onCheckedChange={setChecked} expandedIds={expanded} onExpandedChange={setExpanded} />
          </div>
          <ValueView value={{ checkedIds: checked }} />
        </div>
      </DemoSection>
    </DemoPage>
  );
}
