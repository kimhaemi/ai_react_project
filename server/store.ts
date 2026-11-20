import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Notice } from "@/types/notice";
import { env } from "./env";

export async function readNotices(): Promise<Notice[]> {
  try {
    const raw = await readFile(env.noticeDataFile, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Notice[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function writeNotices(notices: Notice[]): Promise<void> {
  await mkdir(path.dirname(env.noticeDataFile), { recursive: true });
  // 임시 파일에 먼저 쓰고 교체해서, 쓰다가 끊겨도 JSON 이 깨지지 않도록 함
  const tmp = `${env.noticeDataFile}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(notices, null, 2) + "\n", "utf-8");
  await rename(tmp, env.noticeDataFile);
}

// 여러 요청이 동시에 와도 읽기-수정-쓰기가 섞이지 않도록 순차 처리
let queue: Promise<unknown> = Promise.resolve();
export function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}
