# react_test

Next.js(App Router) + React + TypeScript 관리 화면. 화면과 API 서버(Express)가 한 서버, 한 포트(3200)에서 실행됩니다.

## 실행

```bash
pnpm install
pnpm makeenv          # .env.local 생성 (처음 한 번)
pnpm dev              # 개발 서버 http://localhost:3200 (화면 + /api)
pnpm build && pnpm start   # 운영 모드
```

## 모바일 (웹앱 · 안드로이드 · iOS)

같은 화면을 모바일 웹앱(홈 화면 설치)과 안드로이드·iOS 앱으로도 씁니다. 설정·실행·롤백 방법은 [mobile/README.md](mobile/README.md) 참고.

## 폴더 구조

```
src/
├── app/                라우터 페이지 (주소 = 폴더). page.tsx 는 메타데이터 + 화면(view) 하나만 불러옴
│   ├── (main)/         헤더·왼쪽 메뉴가 있는 페이지
│   └── (auth)/         단독 페이지 (로그인)
├── components/
│   ├── ui/             공통 UI — 화면에서 가져다 씀
│   │   ├── Button, Input, Select, Checkbox, Radio, Tree, Calendar, DatePicker,
│   │   │   SearchBox, FileUpload, DownloadButton, Dialog, Toast, Loading, Skeleton ...
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
├── mobile/             모바일 웹앱(PWA) — 앱 이름·색, 서비스 워커 등록
└── types/              공용 타입
server/                 API 서버 (Express, /api/*)
mobile/                 안드로이드·iOS 앱 (Capacitor, 별도 pnpm 프로젝트) → mobile/README.md
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

### 로딩 스켈레톤

- 화면별 스켈레톤은 `components/view/<기능>/<이름>Skeleton.tsx` 에 만들고, 라우터 폴더의 `loading.tsx` 에서 불러옵니다. (예: `app/(main)/notice/loading.tsx` → `NoticeSkeleton`)
- 부품: `Skeleton`(블록), `SkeletonText`(여러 줄), `SkeletonCard`, `SkeletonGrid`(표), `SkeletonList`(목록), `SkeletonScreen`(화면 전체 틀, 화면 읽기 프로그램용 "불러오는 중" 안내 포함) — `@/components/ui`
- UI 예시 화면은 `DemoSkeleton` 에 `page` 를 넘기면 그 화면 구성대로 그려집니다. 새 예시 화면은 `DEMO_LAYOUTS` 에 섹션 모양을 추가하세요.
- 화면 안에서 데이터를 처음 불러올 때(공지사항 목록, 파일 목록)도 같은 부품으로 자리를 표시합니다.
- 쉬머 효과는 `globals.css` 의 `.skeleton` 클래스. 움직임 줄이기 설정이면 은은한 깜빡임으로 바뀝니다.

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
