import type { Metadata, Viewport } from "next";
import { MOBILE_APP } from "./config";

/** 루트 layout 의 metadata 에 펼쳐 넣는 모바일용 값 (홈 화면 추가, iOS 아이콘 등) */
export const mobileMetadata: Metadata = {
  applicationName: MOBILE_APP.name,
  appleWebApp: {
    capable: true,
    title: MOBILE_APP.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

/** 루트 layout 의 viewport */
export const mobileViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: MOBILE_APP.themeColor,
};
