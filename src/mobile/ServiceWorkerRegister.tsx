"use client";

import { useEffect } from "react";
import { MOBILE_APP } from "./config";

/**
 * 서비스 워커 등록 (운영 모드에서만).
 * 개발 모드에서는 캐시 때문에 수정한 화면이 안 보이는 일이 없도록, 남아 있던 서비스 워커를 지움.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((list) => list.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker.register(MOBILE_APP.serviceWorker, { scope: "/", updateViaCache: "none" }).catch((e) => {
      console.warn("서비스 워커 등록 실패", e);
    });
  }, []);
  return null;
}
