import type { MetadataRoute } from "next";
import { MOBILE_APP } from "@/mobile";

/** 웹앱 설치 정보 (/manifest.webmanifest) — 홈 화면에 추가하면 앱처럼 실행됨 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MOBILE_APP.name,
    short_name: MOBILE_APP.shortName,
    description: MOBILE_APP.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    lang: "ko",
    background_color: MOBILE_APP.backgroundColor,
    theme_color: MOBILE_APP.themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
