"use client";

import { useState } from "react";
import { Button, Dialog, useDialog, useToast } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "../_shared/Demo";

export default function DialogDemo() {
  const dialog = useDialog();
  const toast = useToast();
  const [last, setLast] = useState<unknown>(null);
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <DemoPage
      title="Alert / Confirm"
      description="알림 팝업과 확인 팝업은 같은 팝업(Dialog)이고 내용과 버튼만 다릅니다. await 로 결과를 받아 window.alert / window.confirm 처럼 씁니다. Esc 나 바깥을 누르면 닫힙니다."
    >
      <DemoSection
        title="알림 팝업 (alert)"
        description="버튼은 [확인] 하나. 닫힐 때까지 기다립니다."
        code={`const dialog = useDialog();

await dialog.alert("저장되었습니다.");
await dialog.alert("필수 항목을 입력해 주세요.", { title: "입력 확인", tone: "warning" });`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await dialog.alert("저장되었습니다.");
              setLast("alert 닫힘");
            }}
          >
            기본
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await dialog.alert("제목과 작성자는 필수 항목입니다.\n입력 후 다시 저장해 주세요.", { title: "입력 확인", tone: "warning" });
              setLast("alert 닫힘");
            }}
          >
            제목 + 주의
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await dialog.alert("결제가 완료되었습니다.", { title: "결제 완료", tone: "success" });
              setLast("alert 닫힘");
            }}
          >
            성공
          </Button>
        </div>
        <ValueView value={last} />
      </DemoSection>

      <DemoSection
        title="확인 팝업 (confirm)"
        description="[취소] [확인] 두 버튼. 확인이면 true, 취소·Esc·바깥 클릭이면 false. danger 는 빨간 버튼이고 실수 방지를 위해 [취소]에 먼저 포커스가 갑니다."
        code={`if (await dialog.confirm("변경 내용을 저장할까요?")) save();

const ok = await dialog.confirm("삭제한 글은 되돌릴 수 없습니다.", {
  title: "게시글 삭제", okText: "삭제", danger: true,
});`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              const ok = await dialog.confirm("변경 내용을 저장할까요?");
              setLast({ confirm: ok });
              if (ok) toast.success("저장했습니다.");
            }}
          >
            저장 확인
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await dialog.confirm("선택한 게시글 3건을 삭제합니다.\n삭제한 글은 되돌릴 수 없습니다.", {
                title: "게시글 삭제",
                okText: "삭제",
                danger: true,
              });
              setLast({ confirm: ok });
              if (ok) toast.success("3건을 삭제했습니다.");
            }}
          >
            삭제 확인
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const a = await dialog.confirm("첫 번째 질문: 계속할까요?");
              const b = a && (await dialog.confirm("두 번째 질문: 정말 계속할까요?", { okText: "계속" }));
              setLast({ first: a, second: b });
            }}
          >
            연속 질문
          </Button>
        </div>
        <ValueView value={last} />
      </DemoSection>

      <DemoSection
        title="버튼 직접 구성"
        description="Dialog 컴포넌트를 직접 쓰면 버튼 개수와 글자를 자유롭게 정할 수 있습니다."
        code={`<Dialog open={open} title="저장하지 않은 변경 사항" tone="warning"
  buttons={[
    { label: "취소", value: "cancel" },
    { label: "저장 안 함", value: "discard", variant: "danger" },
    { label: "저장", value: "save", variant: "primary", autoFocus: true },
  ]}
  onClose={(value) => { setOpen(false); handle(value); }}>
  페이지를 나가기 전에 저장할까요?
</Dialog>`}
      >
        <Button variant="secondary" onClick={() => setCustomOpen(true)}>
          버튼 3개 팝업
        </Button>
        <Dialog
          open={customOpen}
          title="저장하지 않은 변경 사항"
          tone="warning"
          buttons={[
            { label: "취소", value: "cancel" },
            { label: "저장 안 함", value: "discard", variant: "danger" },
            { label: "저장", value: "save", variant: "primary", autoFocus: true },
          ]}
          onClose={(value) => {
            setCustomOpen(false);
            setLast({ custom: value });
          }}
        >
          페이지를 나가기 전에 변경 내용을 저장할까요?
        </Dialog>
        <ValueView value={last} />
      </DemoSection>
    </DemoPage>
  );
}
