"use client";

import { useState } from "react";
import { Button, useUI } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function UseUIDemo() {
  const ui = useUI();
  const [last, setLast] = useState<unknown>(null);

  return (
    <DemoPage
      title="useUI()"
      description="화면에서 공통 UI(토스트, 알림/확인 팝업, 버튼 직접 구성 팝업, 화면 전체 로딩)를 훅 하나로 불러옵니다. import 도 한 줄입니다."
    >
      <DemoSection
        title="기본 사용"
        code={`import { useUI } from "@/components/ui";

const ui = useUI();

ui.toast.success("저장했습니다.");                          // 토스트
await ui.alert("저장되었습니다.");                           // 알림 팝업
if (await ui.confirm("삭제할까요?", { danger: true })) {}    // 확인 팝업 → true / false
await ui.loading.wrap(api.save(data));                     // 끝날 때까지 화면 전체 로딩`}
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => ui.toast.success("저장했습니다.")}>
            ui.toast
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await ui.alert("저장되었습니다.", { tone: "success" });
              setLast("alert 닫힘");
            }}
          >
            ui.alert
          </Button>
          <Button
            variant="secondary"
            onClick={async () => setLast({ confirm: await ui.confirm("삭제할까요?", { danger: true, okText: "삭제" }) })}
          >
            ui.confirm
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await ui.loading.wrap(wait(1500), "불러오는 중입니다...");
              setLast("loading 끝");
            }}
          >
            ui.loading (1.5초)
          </Button>
        </div>
        <ValueView value={last} />
      </DemoSection>

      <DemoSection
        title="ui.run — 확인 → 로딩 → 실행 → 결과 토스트"
        description="저장·삭제처럼 자주 반복되는 흐름을 한 줄로 씁니다. 취소하거나 실패하면 undefined 를 돌려주고, 실패 시 오류 토스트가 자동으로 뜹니다. 공지사항 게시판의 삭제도 이 방식입니다."
        code={`const result = await ui.run(() => noticeApi.remove(ids), {
  confirm: { message: "삭제할까요?", danger: true, okText: "삭제" },
  loading: "삭제 중입니다...",
  success: "삭제했습니다.",
  // error: "삭제에 실패했습니다."   // 기본은 서버가 보낸 오류 메시지
});
if (result) refresh();`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () =>
              setLast({
                run: await ui.run(() => wait(1200).then(() => "OK"), {
                  confirm: { message: "변경 내용을 저장할까요?" },
                  loading: "저장 중입니다...",
                  success: "저장했습니다.",
                }),
              })
            }
          >
            저장 (성공)
          </Button>
          <Button
            variant="danger"
            onClick={async () =>
              setLast({
                run: await ui.run(
                  async () => {
                    await wait(800);
                    throw new Error("서버에 연결할 수 없습니다.");
                  },
                  { loading: true, success: "삭제했습니다." },
                ),
              })
            }
          >
            삭제 (실패)
          </Button>
        </div>
        <ValueView value={last} />
      </DemoSection>

      <DemoSection
        title="ui.dialog — 버튼 직접 구성"
        description="버튼 목록을 주면 누른 버튼의 value 를 돌려줍니다. Esc·바깥 클릭은 'cancel'."
        code={`const choice = await ui.dialog({
  title: "저장하지 않은 변경 사항",
  content: "페이지를 나가기 전에 저장할까요?",
  tone: "warning",
  buttons: [
    { label: "취소", value: "cancel" },
    { label: "저장 안 함", value: "discard", variant: "danger" },
    { label: "저장", value: "save", variant: "primary", autoFocus: true },
  ],
});`}
      >
        <Button
          variant="secondary"
          onClick={async () =>
            setLast({
              dialog: await ui.dialog({
                title: "저장하지 않은 변경 사항",
                content: "페이지를 나가기 전에 변경 내용을 저장할까요?",
                tone: "warning",
                buttons: [
                  { label: "취소", value: "cancel" },
                  { label: "저장 안 함", value: "discard", variant: "danger" },
                  { label: "저장", value: "save", variant: "primary", autoFocus: true },
                ],
              }),
            })
          }
        >
          ui.dialog
        </Button>
        <ValueView value={last} />
      </DemoSection>
    </DemoPage>
  );
}
