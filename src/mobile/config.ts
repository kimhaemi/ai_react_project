/**
 * 모바일 웹앱(PWA)·네이티브 앱 공통 설정.
 * 앱 이름·색을 바꾸려면 여기만 고치면 됨 (네이티브 앱 이름은 mobile/capacitor.config.ts 도 함께).
 */
export const MOBILE_APP = {
  name: "관리 시스템",
  shortName: "관리",
  description: "관리 시스템",
  /** 상단 상태바 색 (헤더 배경과 맞춤) */
  themeColor: "#ffffff",
  /** 앱 시작 화면 배경색 (본문 배경과 맞춤) */
  backgroundColor: "#f9fafb",
  /** 서비스 워커 파일 (public/sw.js) */
  serviceWorker: "/sw.js",
} as const;
