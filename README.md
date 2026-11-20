# react_test

Next.js(App Router) + React + TypeScript 관리 화면. 화면과 API 서버(Express)가 한 서버, 한 포트(3200)에서 실행됩니다.

## 실행

```bash
pnpm install
pnpm makeenv          # .env.local 생성 (처음 한 번)
pnpm dev              # 개발 서버 http://localhost:3200 (화면 + /api)
pnpm build && pnpm start   # 운영 모드
```

## 폴더 구조

```
src/
├── app/                라우터 페이지 (주소 = 폴더). page.tsx 는 메타데이터 + 화면(view) 하나만 불러옴
│   ├── (main)/         헤더·왼쪽 메뉴가 있는 페이지
│   └── (auth)/         단독 페이지 (로그인)
├── components/
│   ├── ui/             공통 UI — 화면에서 가져다 씀
│   │   ├── Button, Input, Select, Checkbox, Radio, Tree, Calendar, DatePicker,
│   │   │   SearchBox, FileUpload, DownloadButton, Dialog, Toast, Loading ...
│   │   ├── grid/       DataGrid (AG Grid)      ← import "@/components/ui/grid"
│   │   └── chart/      Chart (recharts)        ← import "@/components/ui/chart"
│   ├── view/           화면 (페이지별 실제 UI 와 동작)
│   │   ├── dashboard/  notice/  auth/  error/
│   │   └── ui-demo/    공통 UI 예시 화면
│   ├── layout/         헤더, 왼쪽 메뉴 (앱 틀)
│   ├── auth/           로그인 상태
│   └── Providers.tsx   언어·로그인·토스트·팝업·로딩 Provider
├── hooks/              공통 훅 — 화면에서는 import { ... } from "@/hooks"
│   ├── useUI.ts        토스트·팝업·로딩을 한 번에 쓰는 훅
│   ├── useToday.ts     오늘 날짜 (서버 렌더링 중에는 null)
│   ├── useStoredValue.ts  localStorage 값을 상태처럼
│   ├── useDismiss.ts   바깥 클릭 / Esc 로 팝업 닫기
│   └── index.ts        위 훅 + useToast, useDialog, useLoading, useI18n, useAuth 를 한곳에서 내보냄
├── config/             메뉴 정의 (menu.ts)
├── i18n/               다국어 (ko / en)
├── lib/                API 클라이언트(axios), 날짜·다운로드 등 헬퍼
└── types/              공용 타입
server/                 API 서버 (Express, /api/*)
data/, uploads/         로컬 저장 데이터 (git 제외)
```

### 화면에서 공통 UI 쓰기

```tsx
"use client";
import { Button, Input, Select } from "@/components/ui";
import { useUI } from "@/hooks";
import { DataGrid } from "@/components/ui/grid";   // 그리드·차트는 쓰는 화면에서만 따로 import

export default function OrderScreen() {
  const ui = useUI();

  const save = async () => {
    const saved = await ui.run(() => orderApi.save(form), {
      confirm: "저장할까요?",      // 확인 팝업
      loading: true,              // 화면 전체 로딩
      success: "저장했습니다.",    // 성공 토스트 (실패하면 오류 토스트 자동)
    });
    if (saved) router.push("/orders");
  };
  // ui.toast.success(...) / await ui.alert(...) / await ui.confirm(...) / await ui.dialog({...}) / ui.loading.wrap(...)
}
```

### 새 페이지 추가 순서

1. 화면 만들기: `src/components/view/<기능>/<이름>Screen.tsx`
2. 라우터 연결: `src/app/(main)/<주소>/page.tsx`
   ```tsx
   import type { Metadata } from "next";
   import OrderScreen from "@/components/view/order/OrderScreen";

   export const metadata: Metadata = { title: "주문 관리" };

   export default function Page() {
     return <OrderScreen />;
   }
   ```
3. 메뉴 등록: `src/config/menu.ts` + 메뉴 이름 `src/i18n/dictionaries.ts`

### 규칙

- `app/` 에는 라우팅 파일(page, layout, not-found 등)만 둡니다. UI 는 `components/view/` 로.
- 한 화면에서만 쓰는 부품은 그 화면 폴더(`components/view/<기능>/`)에, 여러 화면에서 쓰면 `components/ui/` 로 옮깁니다.
- `components/ui/` 는 `components/view/` 를 import 하지 않습니다 (공통 → 화면 방향 의존 금지).
- 훅은 `src/hooks/` 에서 관리합니다. 화면·레이아웃은 `@/hooks` 에서 import 합니다.
  - 독립 훅은 `hooks/` 에 파일로, Provider 의 context 를 쓰는 훅(useToast, useDialog, useLoading, useI18n, useAuth)은 Provider 옆에 두고 `hooks/index.ts` 에서 다시 내보냅니다.
  - `components/ui`, `lib` 안에서는 순환 참조를 피하려고 `@/hooks` 대신 개별 파일(`@/hooks/useDismiss` 등)을 import 합니다.
- 그리드·차트는 용량이 커서 `@/components/ui` 에서 한꺼번에 내보내지 않습니다. 필요한 화면에서만 `@/components/ui/grid`, `@/components/ui/chart` 로 불러옵니다.
