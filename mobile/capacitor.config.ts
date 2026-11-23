import { existsSync } from "node:fs";
import type { CapacitorConfig } from "@capacitor/cli";

/**
 * 안드로이드 / iOS 앱 설정 (Capacitor)
 *
 * 앱은 화면을 직접 들고 있지 않고, MOBILE_SERVER_URL 의 웹 서버(Next + API)를 앱 안에서 엽니다.
 * → 웹을 배포하면 앱도 바로 바뀜 (스토어 재심사 불필요). 대신 서버에 접속할 수 있어야 함.
 *
 * 주소는 mobile/.env 의 MOBILE_SERVER_URL (없으면 안드로이드 에뮬레이터 기본값).
 * 바꾼 뒤에는 `pnpm sync` 로 네이티브 프로젝트에 반영하세요.
 */
if (existsSync(".env")) process.loadEnvFile(".env");

// 10.0.2.2 = 안드로이드 에뮬레이터에서 본 내 PC. iOS 시뮬레이터는 http://localhost:3200
const serverUrl = process.env.MOBILE_SERVER_URL || "http://10.0.2.2:3200";

const config: CapacitorConfig = {
  // 스토어 등록 전 반드시 회사 도메인 기준으로 바꾸세요 (등록 후에는 변경 불가)
  appId: process.env.MOBILE_APP_ID || "com.example.reacttest",
  appName: "관리 시스템",
  // 서버에 접속하지 못할 때를 대비한 최소 화면 (Capacitor 필수 폴더)
  webDir: "www",
  server: {
    url: serverUrl,
    // http 주소(개발용)일 때만 평문 통신 허용. 운영은 https 를 쓰세요.
    cleartext: serverUrl.startsWith("http:"),
  },
  android: {
    // 개발 중에는 크롬 chrome://inspect 로 앱 화면 디버깅 가능
    webContentsDebuggingEnabled: process.env.NODE_ENV !== "production",
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
