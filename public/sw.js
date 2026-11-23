/**
 * 서비스 워커 (모바일 웹앱용). src/mobile/ServiceWorkerRegister.tsx 가 운영 모드에서 등록함.
 *
 * - /_next/static/*, /icons/*  : 한 번 받은 파일은 캐시에서 바로 (파일명에 해시가 있어 바뀌지 않음)
 * - 페이지 이동               : 항상 네트워크 먼저, 연결이 끊겼으면 offline.html
 * - /api/* 와 GET 이 아닌 요청 : 건드리지 않음 (항상 서버로)
 *
 * 캐시 구조를 바꿨으면 VERSION 을 올리세요. 이전 캐시는 자동으로 지워집니다.
 */
const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
});
