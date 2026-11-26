// TOAST UI Grid CSS 에 남아 있는 IE6/7 전용 핵(`*padding-left: 2px` 같은 줄)을 Turbopack CSS 파서가 오류로 거부해서,
// 그 줄만 뺀 사본을 src/components/ui/tui-grid/tui-grid.css 로 만든다.
// tui-grid 버전을 올린 뒤 다시 실행: node scripts/tui-grid-css.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const src = require.resolve("tui-grid/dist/tui-grid.css");
const out = new URL("../src/components/ui/tui-grid/tui-grid.css", import.meta.url);
const { version } = JSON.parse(readFileSync(require.resolve("tui-grid/package.json"), "utf8"));

const lines = readFileSync(src, "utf8").split("\n");
const kept = lines.filter((line) => !/^\s*\*[a-z-]+\s*:/i.test(line));
const header = `/* tui-grid ${version} dist/tui-grid.css 에서 IE 전용 '*속성' 핵 ${lines.length - kept.length}줄을 뺀 사본. scripts/tui-grid-css.mjs 로 생성 — 직접 고치지 말 것 */\n`;
writeFileSync(out, header + kept.join("\n"));
console.log(`removed ${lines.length - kept.length} line(s) -> ${out.pathname}`);
