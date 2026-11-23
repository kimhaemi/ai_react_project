# 모바일 (웹앱 · 안드로이드 · iOS)

기존 웹 화면을 **그대로** 모바일에서 쓰는 세 가지 방법입니다. 화면 코드는 하나만 유지합니다.

| 방법 | 설치 방법 | 업데이트 | 필요한 것 |
|---|---|---|---|
| 모바일 웹앱 (PWA) | 브라우저에서 "홈 화면에 추가" | 웹 배포하면 바로 반영 | https 서버 |
| 안드로이드 앱 | APK / Play 스토어 | 웹 배포하면 바로 반영 (앱 껍데기만 스토어) | Android Studio |
| iOS 앱 | TestFlight / App Store | 위와 같음 | macOS + Xcode |

안드로이드·iOS 앱은 [Capacitor](https://capacitorjs.com) 로 만든 **껍데기 앱**입니다.
앱 안에서 웹 서버(`MOBILE_SERVER_URL`)를 열기 때문에, 화면을 고쳐도 앱을 다시 빌드할 필요가 없습니다.
(이 프로젝트는 Next 서버 + Express API 가 함께 돌아가는 구조라 화면을 앱 안에 정적 파일로 넣을 수 없습니다.)

## 추가된 파일 (모바일 작업은 이게 전부)

```
mobile/                         ← 네이티브 앱 프로젝트 (루트와 의존성 분리된 별도 pnpm 프로젝트)
├── capacitor.config.ts         앱 ID·이름·열 서버 주소
├── .env.example                서버 주소 예시 → .env 로 복사해서 사용
├── android/                    안드로이드 프로젝트 (Android Studio 로 열기)
├── ios/                        iOS 프로젝트 (Xcode 로 열기)
├── www/index.html              Capacitor 필수 최소 화면 (평소엔 안 보임)
├── assets/logo.svg             앱 로고 원본
└── scripts/make-icons.mjs      웹앱·안드로이드·iOS 아이콘과 시작 화면 생성

src/mobile/                     ← 모바일 웹앱(PWA) 모듈
├── config.ts                   앱 이름·색
├── metadata.ts                 홈 화면 추가용 metadata / viewport
└── ServiceWorkerRegister.tsx   서비스 워커 등록 (운영 모드에서만)
src/app/manifest.ts             웹앱 설치 정보 (/manifest.webmanifest)
public/sw.js                    서비스 워커 (정적 파일 캐시, 오프라인 안내)
public/offline.html             인터넷이 끊겼을 때 화면
public/icons/                   웹앱 아이콘
```

### 기존 파일에서 바뀐 곳

| 파일 | 바뀐 내용 |
|---|---|
| `src/app/layout.tsx` | `@/mobile` 에서 `mobileMetadata`, `mobileViewport`, `<ServiceWorkerRegister />` 연결 (3줄) |
| `tsconfig.json` | `exclude` 에 `"mobile"` 추가 |
| `eslint.config.mjs` | 무시 목록에 `"mobile/**"` 추가 |
| `README.md` | 이 문서 링크 |

다른 화면·부품 코드는 건드리지 않았습니다.

## 1. 모바일 웹앱 (PWA)

따로 할 일 없음. 운영 모드로 실행하면 됩니다.

```bash
pnpm build && pnpm start
```

- 안드로이드 크롬: 메뉴 → "앱 설치" (또는 자동으로 설치 안내가 뜸)
- 아이폰 사파리: 공유 버튼 → "홈 화면에 추가"
- **https 주소여야** 설치·서비스 워커가 동작합니다. (`localhost` 는 예외)
- 개발 모드(`pnpm dev`)에서는 캐시 문제를 막으려고 서비스 워커를 등록하지 않습니다.
- 앱 이름·색 변경: `src/mobile/config.ts`

## 2. 안드로이드 앱

준비: [Android Studio](https://developer.android.com/studio) (JDK·SDK 포함)

```bash
cd mobile
pnpm install                 # 처음 한 번
cp .env.example .env         # 서버 주소 설정 (아래 표 참고)
pnpm sync                    # 설정을 네이티브 프로젝트에 반영 (주소 바꿀 때마다)
pnpm android                 # Android Studio 열기 → ▶ 실행
# 또는 pnpm run:android      # 연결된 기기/에뮬레이터에 바로 실행
```

| 실행 위치 | MOBILE_SERVER_URL |
|---|---|
| 안드로이드 에뮬레이터 | `http://10.0.2.2:3200` (에뮬레이터에서 본 내 PC) |
| 실제 폰 (같은 Wi-Fi) | `http://<내 PC IP>:3200` |
| 운영 | `https://<운영 도메인>` |

- 루트에서 `pnpm dev` 로 서버를 먼저 띄워 두세요.
- 개발 중 앱 화면 디버깅: PC 크롬 주소창에 `chrome://inspect`
- 출시용 빌드: Android Studio → Build → Generate Signed App Bundle (.aab)

## 3. iOS 앱

준비: macOS + Xcode (Windows/Linux 에서는 빌드 불가)

```bash
cd mobile
pnpm install
cp .env.example .env         # 시뮬레이터면 MOBILE_SERVER_URL=http://localhost:3200
pnpm sync
pnpm ios                     # Xcode 열기 → 팀(Signing) 선택 → ▶ 실행
```

- Swift Package Manager 방식이라 CocoaPods 설치는 필요 없습니다.
- 개발 중 같은 네트워크의 http 서버 접속을 허용해 두었습니다 (`Info.plist` 의 `NSAllowsLocalNetworking`). 운영은 https 를 쓰세요.
- 화면 디버깅: Mac 사파리 → 개발자용 메뉴 → 시뮬레이터/기기 선택

## 스토어 출시 전 체크

1. **앱 ID 변경** — `mobile/.env` 의 `MOBILE_APP_ID` (예: `com.회사.admin`). 스토어 등록 후에는 바꿀 수 없습니다.
   - 처음 정할 때는 `android/`, `ios/` 폴더를 지우고 `npx cap add android` / `npx cap add ios` 로 다시 만든 뒤 `pnpm icons` 를 실행하는 게 가장 깔끔합니다. (iOS 는 Xcode 에서 Bundle Identifier 만 바꿔도 됨)
2. `MOBILE_SERVER_URL` 을 운영 https 주소로 → `pnpm sync`
3. 앱 이름: `capacitor.config.ts` 의 `appName`, `android/app/src/main/res/values/strings.xml`, Xcode 의 Display Name
4. 로고 변경 시: `scripts/make-icons.mjs` 의 `BRAND`/`MARK` 수정 → `pnpm icons`
5. 애플 심사는 "웹사이트를 감싸기만 한 앱"을 거절할 수 있습니다 (가이드라인 4.2). 사내용이면 TestFlight·Apple Business Manager 배포를 고려하세요.

## 이 작업만 되돌리기 (롤백)

모바일 작업 커밋은 모두 메시지에 `(mobile)` 이 들어 있고, 다른 작업과 섞이지 않게 나눠 두었습니다.

```bash
git log --oneline --grep="(mobile)"                           # 모바일 커밋 목록
git revert --no-edit $(git log --format=%h --grep="(mobile)")  # 전부 되돌리기 (최신 커밋부터)
```

일부만 되돌릴 때 (최신 → 오래된 순서로):

| 커밋 | 내용 | 되돌리면 |
|---|---|---|
| `docs(mobile)` | 이 문서 + README 링크 | 문서만 사라짐 |
| `feat(mobile): iOS…` | `mobile/ios/` | iOS 앱만 제거 |
| `feat(mobile): 안드로이드…` | `mobile/android/` | 안드로이드 앱만 제거 |
| `feat(mobile): Capacitor…` | `capacitor.config.ts`, `www/` | 네이티브 앱 설정 제거 (위 두 개 먼저) |
| `feat(mobile): 모바일 웹앱(PWA)…` | `src/mobile/`, `manifest.ts`, `sw.js`, `layout.tsx` 3줄 | 홈 화면 설치·오프라인 기능 제거 |
| `feat(mobile): 모바일 작업 폴더…` | `mobile/` 기본, `public/icons/`, tsconfig·eslint | 전부 제거 (맨 마지막에) |

> PWA 를 되돌린 뒤 이미 설치된 브라우저에는 서비스 워커가 남아 있을 수 있습니다.
> 브라우저 개발자 도구 → Application → Service Workers → Unregister 로 지우세요.
