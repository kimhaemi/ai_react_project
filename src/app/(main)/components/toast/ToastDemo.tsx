"use client";

import { Button, useToast } from "@/components/ui";
import { DemoPage, DemoSection } from "../_shared/Demo";

export default function ToastDemo() {
  const toast = useToast();

  return (
    <DemoPage
      title="Toast"
      description="화면 오른쪽 아래에 잠깐 나타났다 사라지는 알림입니다. 마우스를 올리면 멈추고, 최대 5개까지 쌓입니다. 앱 어디서든 useToast() 로 띄웁니다."
    >
      <DemoSection
        title="종류"
        description="상태 색은 아이콘·제목과 함께 표시되어 색만으로 구분하지 않습니다. 오류는 6초, 나머지는 4초 뒤 사라집니다."
        code={`const toast = useToast();

toast.success("저장했습니다.");
toast.info("새 공지가 있습니다.");
toast.warning("저장 공간이 부족합니다.");
toast.error("서버에 연결할 수 없습니다.");`}
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success("저장했습니다.")}>성공</Button>
          <Button variant="secondary" onClick={() => toast.info("새 공지사항이 등록되었습니다.")}>
            안내
          </Button>
          <Button variant="secondary" onClick={() => toast.warning("저장 공간이 10% 남았습니다.")}>
            주의
          </Button>
          <Button variant="danger" onClick={() => toast.error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.")}>
            오류
          </Button>
        </div>
      </DemoSection>

      <DemoSection
        title="제목 / 버튼 / 계속 표시"
        code={`toast.success("게시글 1건을 삭제했습니다.", {
  title: "삭제 완료",
  action: { label: "실행 취소", onClick: undo },
});

toast.info("직접 닫을 때까지 남아 있습니다.", { duration: 0 });`}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              toast.success("게시글 1건을 삭제했습니다.", {
                title: "삭제 완료",
                action: { label: "실행 취소", onClick: () => toast.info("삭제를 취소했습니다.") },
              })
            }
          >
            실행 취소 버튼
          </Button>
          <Button variant="secondary" onClick={() => toast.info("직접 닫을 때까지 남아 있습니다.", { title: "계속 표시", duration: 0 })}>
            계속 표시
          </Button>
        </div>
      </DemoSection>
    </DemoPage>
  );
}
