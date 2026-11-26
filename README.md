# react_test

Next.js(App Router) + React + TypeScript 로 만든 관리 화면입니다. 화면과 API 서버(Express)가 **한 서버, 한 포트(3200)** 에서 실행됩니다.
공통 UI 컴포넌트 예시 화면과, 여러 데이터 그리드를 직접 붙여 비교한 화면을 함께 담고 있습니다.

- [기술 스택](#기술-스택)
- [실행](#실행)
- [환경 변수](#환경-변수)
- [화면 목록](#화면-목록)
- [그리드 비교](#그리드-비교)
- [API](#api)
- [모바일](#모바일-웹앱--안드로이드--ios)
- [폴더 구조](#폴더-구조)
- [개발 가이드](#개발-가이드)

## 기술 스택

| 구분 | 사용 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| 스타일 | Tailwind CSS 4 |
| API 서버 | Express 5 (`server/`, tsx 로 실행), multer (파일 업로드) |
| 데이터 요청 | axios |
| 공통 그리드 / 차트 | AG Grid Community, recharts |
| 비교용 그리드 | TOAST UI Grid, RealGrid2, Glide Data Grid, RevoGrid, Tabulator, TanStack Table, MUI X DataGrid |
| 모바일 | PWA, Capacitor (안드로이드·iOS) |
| 패키지 매니저 | pnpm |

> 이 프로젝트의 Next.js 는 학습 데이터와 API·규칙이 다를 수 있습니다. 코드를 쓰기 전에 `node_modules/next/dist/docs/` 의 해당 문서를 확인하세요 ([AGENTS.md](AGENTS.md)).

## 실행

```bash
pnpm install
pnpm makeenv               # .env.local 생성 (처음 한 번)
pnpm dev                   # 개발 서버 http://localhost:3200 (화면 + /api)
pnpm build && pnpm start   # 운영 모드
pnpm lint
```

| 스크립트 | 하는 일 |
|---|---|
| `pnpm dev` | `server/index.ts` 를 tsx watch 로 실행 (Next 개발 서버 + API) |
| `pnpm build` / `pnpm start` | 운영 빌드 / 운영 서버 실행 |
| `pnpm makeenv [local\|development\|production]` | `.env.example` 로 `.env.*.local` 생성 (기존 값 유지, 새 항목만 추가) |
| `node scripts/tui-grid-css.mjs` | TOAST UI Grid CSS 정리본 다시 만들기 (tui-grid 업그레이드 후 실행, [아래](#그리드-비교) 참고) |

## 환경 변수

`.env.example` 이 템플릿입니다. 직접 고치지 말고 `pnpm makeenv` 로 만든 `.env.local` 을 수정하세요 (`.env*` 는 git 에서 제외).

| 변수 | 기본값 | 설명 |
|---|---|---|
| `PORT` | `3200` | 화면 + API 포트 |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | API 주소 (같은 서버면 그대로) |
| `NEXT_PUBLIC_API_TIMEOUT` | `10000` | API 요청 제한 시간(ms) |
| `NEXT_PUBLIC_REALGRID_LICENSE` | (비어 있음) | RealGrid2 라이선스 키. [개발용 키 발급](https://service.realgrid.com/start) (도메인 단위). 비우면 RealGrid2 화면에 안내만 표시 |
| `NOTICE_DATA_FILE` | `data/notices.json` | 공지사항 저장 파일 |
| `UPLOAD_DIR` | `uploads` | 업로드 파일 저장 폴더 |
| `UPLOAD_MAX_SIZE_MB` | `10` | 파일 1개 최대 크기(MB) |
| `UPLOAD_MAX_FILES` | `10` | 한 번에 올릴 수 있는 파일 수 |

`NEXT_PUBLIC_` 값은 빌드할 때 코드에 들어가므로, 바꾸면 다시 빌드(개발 중이면 서버 재시작)해야 합니다.

## 화면 목록

메뉴 정의는 [`src/config/menu.ts`](src/config/menu.ts) 한 곳에서 관리합니다 (최대 3단계).

| 메뉴 | 주소 |
|---|---|
| 대시보드 | `/` |
| 게시판 › 공지사항 | `/notice` |
| UI 컴포넌트 › useUI 훅 | `/components/use-ui` |
| UI 컴포넌트 › **그리드** › 기능 비교표 | `/components/grid-compare` |
| UI 컴포넌트 › 그리드 › AG Grid (공통 DataGrid) | `/components/grid` |
| UI 컴포넌트 › 그리드 › TOAST UI Grid · RealGrid2 · Glide · RevoGrid · Tabulator · TanStack Table · MUI X | `/components/tui-grid`, `/realgrid`, `/glide-grid`, `/revogrid`, `/tabulator`, `/tanstack-table`, `/mui-grid` |
| UI 컴포넌트 › 트리 · 입력창 · 체크박스 · 라디오 · 버튼 · 셀렉트 · 검색박스 · 차트 · 달력 · 기간 달력 · 파일 업로드/다운로드 · 토스트 · 알림/확인 팝업 | `/components/<이름>` |
| 로그인 | `/login` |

게시판 › 자료실, 시스템 관리 메뉴는 아직 화면이 없습니다 (준비 중).

## 그리드 비교

AG Grid 외에 국내·해외 그리드 7종을 프로젝트에 직접 붙여 같은 데이터(1천~100만 행)로 비교했습니다. **결과는 앱의 `UI 컴포넌트 › 그리드 › 기능 비교표`** 에서 볼 수 있습니다. Syncfusion React Grid 의 기능 27개를 기준으로 각 그리드의 지원 범위와 커버율을 보여 줍니다.

| 그리드 | 라이선스 | Syncfusion 대비 커버율 | 측정 렌더 시간 | 메모 |
|---|---|---|---|---|
| RealGrid2 | 상용 (개발 키 무료) | 85% | 미측정 (키 필요) | 국내, 공식 React 래퍼 |
| Tabulator | MIT | 83% | 10만 행 0.45초 | 무료 중 기능 가장 많음 |
| TOAST UI Grid | MIT | 78% | 10만 행 0.7초 | 국내 (NHN) |
| AG Grid Community | MIT | 56% | 미측정 | 프로젝트 공통 그리드 |
| MUI X DataGrid | MIT (상위 버전 유료) | 50% | 10만 행 0.29초 | 무료는 페이지당 100행 |
| RevoGrid | MIT | 44% | 100만 행 0.6초 | 대용량에 강함 |
| Glide Data Grid | MIT | 39% | 100만 행 0.6초 | 캔버스, 가장 빠름 |
| TanStack Table | MIT | 33% | 10만 행 0.27초 | 로직만 제공, UI 직접 |

커버율과 렌더 시간은 2026-11 기준 대략값입니다 (렌더 시간은 헤드리스 Chromium + 운영 빌드에서 측정).

붙이면서 알게 된 점:

- **TOAST UI Grid**: 공식 `@toast-ui/react-grid` 가 React 17 까지만 지원해서 직접 만든 래퍼(`components/ui/tui-grid/TuiGrid.tsx`)를 씁니다. 원본 CSS 의 IE 전용 코드 때문에 Turbopack 빌드가 실패해서, 그 줄을 뺀 사본(`tui-grid.css`)을 `scripts/tui-grid-css.mjs` 로 만들어 씁니다. **tui-grid 버전을 올리면 이 스크립트를 다시 실행하세요.**
- **RealGrid2**: 키가 없거나 맞지 않으면 그리드를 만들 때 예외를 던집니다. 데모 화면은 키가 없으면 안내만 보여 주고, 잘못된 키는 그리드 영역에만 오류를 표시합니다. 엑셀 내보내기에는 `jszip` 이 필요합니다.
- **Tabulator**: `react-tabulator` 가 React 17 에서 멈춰 있어 본체를 직접 감쌌습니다.
- **Glide Data Grid**: 공식 지원은 React 18 까지지만 React 19 에서 동작을 확인했습니다. 편집기용 `<div id="portal">` 이 필요하고, 같이 설치해야 하는 패키지(`marked@4`, `lodash`, `react-responsive-carousel`)가 있습니다.
- **브라우저 전용 그리드**(RealGrid2, Glide, RevoGrid, Tabulator, TanStack, MUI)는 `next/dynamic` 의 `ssr: false` 로 불러옵니다 (`ui-demo/GridDemoLoaders.tsx`, `RealGridDemoLoader.tsx`).
- 데모 공통 데이터와 행 수 선택 UI는 `ui-demo/grid-sample.tsx` 에 있습니다.

## API

Express 서버가 `/api` 아래에서 동작합니다 (`server/`).

| 메서드 | 주소 | 설명 |
|---|---|---|
| GET | `/api/health` | 상태 확인 |
| GET / POST | `/api/notices` | 공지 목록 / 등록 |
| GET / PUT / DELETE | `/api/notices/:id` | 공지 조회 / 수정 / 삭제 |
| POST | `/api/notices/delete` | 공지 여러 건 삭제 |
| GET | `/api/files/config` | 업로드 제한 설정 |
| GET / POST | `/api/files` | 파일 목록 / 업로드 |
| GET | `/api/files/:id/download` | 파일 다운로드 |
| DELETE | `/api/files/:id` | 파일 삭제 |

데이터는 로컬 파일(`data/`, `uploads/`)에 저장되며 git 에서 제외됩니다.

## 모바일 (웹앱 · 안드로이드 · iOS)

같은 화면을 모바일 웹앱(홈 화면 설치)과 안드로이드·iOS 앱으로도 씁니다. 설정·실행·롤백 방법은 [mobile/README.md](mobile/README.md) 를 참고하세요.

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
│   │   ├── grid/       DataGrid (AG Grid)            ← import "@/components/ui/grid"
│   │   ├── tui-grid/   TuiGrid (TOAST UI Grid 래퍼)  ← 그리드 비교용
│   │   └── chart/      Chart (recharts)              ← import "@/components/ui/chart"
│   ├── view/           화면 (페이지별 실제 UI 와 동작)
│   │   ├── dashboard/  notice/  auth/  error/
│   │   └── ui-demo/    공통 UI 예시 화면, 그리드 비교 화면(*GridDemo, GridCompare)
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
scripts/                makeenv.mjs (.env 생성), tui-grid-css.mjs (TOAST UI Grid CSS 정리)
mobile/                 안드로이드·iOS 앱 (Capacitor, 별도 pnpm 프로젝트) → mobile/README.md
data/, uploads/         로컬 저장 데이터 (git 제외)
```

## 개발 가이드

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
3. 로딩 화면: 같은 폴더에 `loading.tsx` (아래 스켈레톤 참고)
4. 메뉴 등록: `src/config/menu.ts` + 메뉴 이름 `src/i18n/dictionaries.ts` (ko / en 둘 다)

브라우저 전용 라이브러리(캔버스, `window` 를 바로 쓰는 라이브러리 등)를 쓰는 화면은 클라이언트 컴포넌트 안에서 `dynamic(() => import("..."), { ssr: false })` 로 불러옵니다.

### 로딩 스켈레톤

- 화면별 스켈레톤은 `components/view/<기능>/<이름>Skeleton.tsx` 에 만들고, 라우터 폴더의 `loading.tsx` 에서 불러옵니다. (예: `app/(main)/notice/loading.tsx` → `NoticeSkeleton`)
- 부품: `Skeleton`(블록), `SkeletonText`(여러 줄), `SkeletonCard`, `SkeletonGrid`(표), `SkeletonList`(목록), `SkeletonScreen`(화면 전체 틀, 화면 읽기 프로그램용 "불러오는 중" 안내 포함) — `@/components/ui`
- UI 예시 화면은 `DemoSkeleton` 에 `page` 를 넘기면 그 화면 구성대로 그려집니다. 새 예시 화면은 `DEMO_LAYOUTS` 에 섹션 모양을 추가하세요.
- 화면 안에서 데이터를 처음 불러올 때(공지사항 목록, 파일 목록)도 같은 부품으로 자리를 표시합니다.
- 쉬머 효과는 `globals.css` 의 `.skeleton` 클래스. 움직임 줄이기 설정이면 은은한 깜빡임으로 바뀝니다.

### 규칙

- `app/` 에는 라우팅 파일(page, layout, loading, not-found 등)만 둡니다. UI 는 `components/view/` 로.
- 한 화면에서만 쓰는 부품은 그 화면 폴더(`components/view/<기능>/`)에, 여러 화면에서 쓰면 `components/ui/` 로 옮깁니다.
- `components/ui/` 는 `components/view/` 를 import 하지 않습니다 (공통 → 화면 방향 의존 금지).
- 훅은 `src/hooks/` 에서 관리합니다. 화면·레이아웃은 `@/hooks` 에서 import 합니다.
  - 독립 훅은 `hooks/` 에 파일로, Provider 의 context 를 쓰는 훅(useToast, useDialog, useLoading, useI18n, useAuth)은 Provider 옆에 두고 `hooks/index.ts` 에서 다시 내보냅니다.
  - `components/ui`, `lib` 안에서는 순환 참조를 피하려고 `@/hooks` 대신 개별 파일(`@/hooks/useDismiss` 등)을 import 합니다.
- 그리드·차트는 용량이 커서 `@/components/ui` 에서 한꺼번에 내보내지 않습니다. 필요한 화면에서만 `@/components/ui/grid`, `@/components/ui/chart` 로 불러옵니다.
- 커밋 메시지는 `type(범위): 한글 요약` 형식입니다 (`feat`, `fix`, `refactor`, `docs`, `chore`).
