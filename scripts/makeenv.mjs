#!/usr/bin/env node
/**
 * .env.example 을 바탕으로 환경별 .env 파일을 만듦
 *
 *   pnpm makeenv                          → .env.local                (로컬 개발, 기본)
 *   pnpm makeenv development              → .env.development.local
 *   pnpm makeenv production               → .env.production.local
 *   pnpm makeenv production API_PORT=8080 → 값 지정해서 생성
 *   pnpm makeenv --force                  → 기존 값 무시하고 템플릿 값으로 다시 생성
 *
 * 이미 파일이 있으면 기존 값은 그대로 두고, 템플릿에 새로 생긴 항목만 추가함.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEMPLATE = path.join(ROOT, ".env.example");
const MODES = { local: ".env.local", development: ".env.development.local", production: ".env.production.local" };
const LINE = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(readFileSync(new URL(import.meta.url), "utf-8").match(/\/\*\*([\s\S]*?)\*\//)[1].replace(/^ \* ?/gm, ""));
  process.exit(0);
}
const force = args.includes("--force");
const overrides = Object.fromEntries(
  args.filter((a) => LINE.test(a)).map((a) => {
    const [, k, v] = a.match(LINE);
    return [k, v];
  }),
);
const mode = args.find((a) => !a.startsWith("-") && !LINE.test(a)) ?? "local";

if (!(mode in MODES)) {
  console.error(`알 수 없는 환경입니다: "${mode}" (사용 가능: ${Object.keys(MODES).join(", ")})`);
  process.exit(1);
}
if (!existsSync(TEMPLATE)) {
  console.error(".env.example 파일이 없습니다.");
  process.exit(1);
}

const parse = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((l) => l.match(LINE))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.trim()]),
  );

const target = path.join(ROOT, MODES[mode]);
const existed = existsSync(target);
const current = existed && !force ? parse(readFileSync(target, "utf-8")) : {};
const template = readFileSync(TEMPLATE, "utf-8");
const templateKeys = new Set(Object.keys(parse(template)));

const added = [];
const changed = [];
const body = template
  .split(/\r?\n/)
  .map((line) => {
    const m = line.match(LINE);
    if (!m) return line;
    const [, key, defaultValue] = m;
    let value = key in current ? current[key] : defaultValue.trim();
    if (!(key in current)) added.push(key);
    if (key in overrides) {
      if (overrides[key] !== value) changed.push(key);
      value = overrides[key];
    }
    return `${key}=${value}`;
  })
  .join("\n")
  .replace("직접 수정하지 말고 `pnpm makeenv` 로 .env 파일을 만드세요.", `pnpm makeenv 로 생성됨 (${mode}). 값은 자유롭게 수정해도 됩니다.`);

// 템플릿에는 없고 기존 파일에만 있던 값은 지우지 않고 아래에 남김
const extras = Object.entries(current).filter(([k]) => !templateKeys.has(k));
const extraBlock = extras.length
  ? `\n# ---------- 템플릿에 없는 값 (기존 파일에서 유지) ----------\n${extras.map(([k, v]) => `${k}=${k in overrides ? overrides[k] : v}`).join("\n")}\n`
  : "";
const unknownOverrides = Object.keys(overrides).filter((k) => !templateKeys.has(k) && !(k in current));
const overrideBlock = unknownOverrides.length
  ? `\n# ---------- 추가 값 ----------\n${unknownOverrides.map((k) => `${k}=${overrides[k]}`).join("\n")}\n`
  : "";

writeFileSync(target, body.trimEnd() + "\n" + extraBlock + overrideBlock, "utf-8");

const rel = path.relative(ROOT, target);
if (!existed || force) console.log(`✔ ${rel} 생성 (${force && existed ? "덮어씀" : "새 파일"})`);
else if (added.length || changed.length) console.log(`✔ ${rel} 업데이트`);
else console.log(`✔ ${rel} 이미 최신입니다`);
if (existed && !force && added.length) console.log(`  + 추가된 항목: ${added.join(", ")}`);
if (changed.length || unknownOverrides.length) console.log(`  ~ 지정한 값: ${[...changed, ...unknownOverrides].join(", ")}`);
