import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import type { StoredFile } from "@/types/file";
import { env } from "../env";
import { HttpError } from "../http-error";
import { withLock } from "../store";

/**
 * 파일 업로드/다운로드
 *   uploads/<id>       실제 파일 (확장자 없이 저장 → 서버에서 실행될 일 없음)
 *   uploads/files.json 파일 정보 목록
 */
mkdirSync(env.uploadDir, { recursive: true });
const META_FILE = path.join(env.uploadDir, "files.json");
const ID_PATTERN = /^[0-9a-f-]{36}$/;

async function readMeta(): Promise<StoredFile[]> {
  try {
    return JSON.parse(await readFile(META_FILE, "utf-8")) as StoredFile[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeMeta(list: StoredFile[]) {
  const tmp = `${META_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2) + "\n", "utf-8");
  await rename(tmp, META_FILE);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename: (_req, _file, cb) => cb(null, randomUUID()),
  }),
  limits: { fileSize: env.uploadMaxSizeMB * 1024 * 1024, files: env.uploadMaxFiles },
  // 한글 파일명이 깨지지 않도록 UTF-8 로 해석
  defParamCharset: "utf8",
});

export const filesRouter = Router();

/** 업로드 제한 (화면에서 미리 검사할 때 사용) */
filesRouter.get("/config", (_req, res) => {
  res.json({ maxSizeMB: env.uploadMaxSizeMB, maxFiles: env.uploadMaxFiles });
});

/** 목록 (최근 순) */
filesRouter.get("/", async (_req, res) => {
  const list = await readMeta();
  res.json([...list].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
});

/** 업로드: multipart/form-data, 필드 이름 "files" (여러 개 가능) */
filesRouter.post("/", (req, res, next) => {
  upload.array("files")(req, res, async (err: unknown) => {
    try {
      if (err instanceof multer.MulterError) {
        const messages: Partial<Record<multer.ErrorCode, string>> = {
          LIMIT_FILE_SIZE: `파일 크기는 ${env.uploadMaxSizeMB}MB 이하만 올릴 수 있습니다.`,
          LIMIT_FILE_COUNT: `한 번에 ${env.uploadMaxFiles}개까지 올릴 수 있습니다.`,
          LIMIT_UNEXPECTED_FILE: "파일 필드 이름은 files 여야 합니다.",
        };
        throw new HttpError(400, messages[err.code] ?? "업로드에 실패했습니다.");
      }
      if (err) throw err;

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) throw new HttpError(400, "업로드할 파일이 없습니다.");

      const now = new Date().toISOString();
      const added: StoredFile[] = files.map((f) => ({
        id: f.filename,
        name: path.basename(f.originalname),
        size: f.size,
        type: f.mimetype || "application/octet-stream",
        uploadedAt: now,
      }));
      await withLock(async () => writeMeta([...(await readMeta()), ...added]));
      res.status(201).json(added);
    } catch (e) {
      next(e);
    }
  });
});

async function findFile(id: string) {
  if (!ID_PATTERN.test(id)) throw new HttpError(400, "잘못된 파일 ID 입니다.");
  const file = (await readMeta()).find((f) => f.id === id);
  if (!file) throw new HttpError(404, "존재하지 않는 파일입니다.");
  return file;
}

/** 다운로드 (원래 파일 이름으로 내려줌) */
filesRouter.get("/:id/download", async (req, res, next) => {
  const file = await findFile(req.params.id);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.download(path.join(env.uploadDir, file.id), file.name, { headers: { "Content-Type": file.type } }, (err) => {
    if (err && !res.headersSent) next(new HttpError(404, "파일을 찾을 수 없습니다."));
  });
});

/** 삭제 */
filesRouter.delete("/:id", async (req, res) => {
  const file = await findFile(req.params.id);
  await withLock(async () => writeMeta((await readMeta()).filter((f) => f.id !== file.id)));
  await unlink(path.join(env.uploadDir, file.id)).catch(() => undefined);
  res.json({ deleted: 1 });
});
