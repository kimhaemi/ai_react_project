#!/usr/bin/env node
/**
 * 앱 아이콘 만들기 (원본: mobile/assets/logo.svg 와 같은 로고)
 *
 *   pnpm --dir mobile icons
 *
 * 만드는 파일
 *   - 웹앱(PWA):  public/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
 *   - 안드로이드:  mobile/android/.../mipmap-*  (android 폴더가 있을 때만)
 *   - iOS:        mobile/ios/.../AppIcon.appiconset (ios 폴더가 있을 때만)
 *
 * 로고를 바꾸려면 아래 BRAND / MARK 를 고치고 다시 실행하세요.
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const MOBILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(MOBILE, "..");

const BRAND = "#2563eb";
/** 32x32 기준 로고 모양 (흰 선) */
const MARK = `<path d="M9 22V10h5a4 4 0 0 1 0 8h-5m7 0 5 4" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

/**
 * @param {object} o
 * @param {boolean} [o.rounded]  모서리 둥글게 (일반 아이콘)
 * @param {number}  [o.scale]    로고 크기 비율 (maskable·적응형 아이콘은 가장자리가 잘리므로 작게)
 * @param {boolean} [o.transparent] 배경 없이 로고만 (안드로이드 적응형 전경)
 */
function svg({ rounded = false, scale = 1, transparent = false } = {}) {
  const offset = (32 - 32 * scale) / 2;
  const bg = transparent ? "" : `<rect width="32" height="32" ${rounded ? 'rx="7"' : ""} fill="${BRAND}"/>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${bg}<g transform="translate(${offset} ${offset}) scale(${scale})">${MARK}</g></svg>`,
  );
}

async function write(file, size, opts, { flatten = false } = {}) {
  mkdirSync(path.dirname(file), { recursive: true });
  let img = sharp(svg(opts), { density: 72 * (size / 32) * 1.1 }).resize(size, size);
  if (flatten) img = img.flatten({ background: BRAND }); // iOS 는 투명 픽셀이 있으면 안 됨
  await img.png().toFile(file);
  console.log("  ✓", path.relative(ROOT, file));
}

// 1) 웹앱(PWA)
const pub = path.join(ROOT, "public/icons");
await write(path.join(pub, "icon-192.png"), 192, { rounded: true });
await write(path.join(pub, "icon-512.png"), 512, { rounded: true });
await write(path.join(pub, "maskable-512.png"), 512, { scale: 0.7 });
await write(path.join(pub, "apple-touch-icon.png"), 180, {}, { flatten: true });

// 2) 안드로이드 (cap add android 이후)
const res = path.join(MOBILE, "android/app/src/main/res");
if (existsSync(res)) {
  const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, x] of Object.entries(densities)) {
    await write(path.join(res, `mipmap-${d}/ic_launcher.png`), 48 * x, { rounded: true, scale: 0.9 });
    await write(path.join(res, `mipmap-${d}/ic_launcher_round.png`), 48 * x, { rounded: true, scale: 0.9 });
    // 적응형 아이콘 전경 (108dp, 가운데 66dp 만 항상 보임)
    await write(path.join(res, `mipmap-${d}/ic_launcher_foreground.png`), 108 * x, { transparent: true, scale: 0.6 });
  }
}

// 3) iOS (cap add ios 이후)
const appIcon = path.join(MOBILE, "ios/App/App/Assets.xcassets/AppIcon.appiconset");
if (existsSync(appIcon)) {
  await write(path.join(appIcon, "AppIcon-512@2x.png"), 1024, {}, { flatten: true });
}
