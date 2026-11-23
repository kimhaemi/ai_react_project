/**
 * 모바일 웹앱(PWA) 모듈.
 * 이 폴더와 app/manifest.ts, public/sw.js, public/offline.html, public/icons/ 가 모바일 웹앱 기능의 전부이고,
 * app/layout.tsx 에서 아래 세 가지만 가져다 씀.
 */
export { MOBILE_APP } from "./config";
export { mobileMetadata, mobileViewport } from "./metadata";
export { default as ServiceWorkerRegister } from "./ServiceWorkerRegister";
