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
├── app/            라우터 페이지 (주소 = 폴더). page.tsx 는 메타데이터 + 화면 하나만 불러옴
│   ├── (main)/     헤더·왼쪽 메뉴가 있는 페이지
│   └── (auth)/     단독 페이지 (로그인)
├── screens/        화면. 페이지별 실제 UI 와 동작
│   ├── dashboard/  notice/  auth/  error/
│   └── ui-demo/    공통 컴포넌트 예시 화면
├── components/     공통 컴포넌트 (여러 화면에서 재사용)
│   ├── ui/         Button, Input, Select, Calendar, Dialog, Toast, FileUpload ...
│   ├── grid/       DataGrid (AG Grid 공통)
│   ├── chart/      Chart
│   ├── layout/     헤더, 왼쪽 메뉴
│   └── auth/       로그인 상태
├── config/         메뉴 정의 (menu.ts)
├── i18n/           다국어 (ko / en)
├── lib/            API 클라이언트(axios), 날짜·다운로드 등 헬퍼
└── types/          공용 타입
server/             API 서버 (Express, /api/*)
data/, uploads/     로컬 저장 데이터 (git 제외)
```

### 새 페이지 추가 순서

1. 화면 만들기: `src/screens/<기능>/<이름>Screen.tsx`
2. 라우터 연결: `src/app/(main)/<주소>/page.tsx`
   ```tsx
   import type { Metadata } from "next";
   import OrderScreen from "@/screens/order/OrderScreen";

   export const metadata: Metadata = { title: "주문 관리" };

   export default function Page() {
     return <OrderScreen />;
   }
   ```
3. 메뉴 등록: `src/config/menu.ts` + 메뉴 이름 `src/i18n/dictionaries.ts`

### 규칙

- `app/` 에는 라우팅 파일(page, layout, not-found 등)만 둡니다. UI 는 `screens/` 로.
- 한 화면에서만 쓰는 부품은 그 화면 폴더(`screens/<기능>/`)에, 여러 화면에서 쓰면 `components/` 로 옮깁니다.
- `components/` 는 `screens/` 를 import 하지 않습니다 (공통 → 화면 방향 의존 금지).
