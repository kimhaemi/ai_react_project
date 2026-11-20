import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Next.js 와 같은 우선순위로 .env 파일을 읽음 (먼저 읽은 값이 우선, 이미 설정된 환경변수는 덮어쓰지 않음)
 *   .env.{NODE_ENV}.local > .env.local > .env.{NODE_ENV} > .env
 */
const mode = process.env.NODE_ENV ?? "development";
for (const file of [`.env.${mode}.local`, ".env.local", `.env.${mode}`, ".env"]) {
  const full = path.resolve(process.cwd(), file);
  if (existsSync(full)) process.loadEnvFile(full);
}

function int(name: string, fallback: number) {
  const v = Number(process.env[name]);
  return Number.isInteger(v) && v > 0 ? v : fallback;
}

export const env = {
  mode,
  /** 화면 + API 가 함께 쓰는 포트 */
  port: int("PORT", 3200),
  host: process.env.HOST || "0.0.0.0",
  noticeDataFile: path.resolve(process.cwd(), process.env.NOTICE_DATA_FILE ?? "data/notices.json"),
};
