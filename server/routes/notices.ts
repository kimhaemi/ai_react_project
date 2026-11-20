import { Router } from "express";
import type { Notice, NoticeInput } from "@/types/notice";
import { HttpError } from "../http-error";
import { readNotices, withLock, writeNotices } from "../store";

export const noticesRouter = Router();

function validate(body: unknown): NoticeInput {
  const b = (body ?? {}) as Partial<Record<keyof NoticeInput, unknown>>;
  const title = String(b.title ?? "").trim();
  const author = String(b.author ?? "").trim();
  const content = String(b.content ?? "").trim();
  if (!title) throw new HttpError(400, "제목을 입력해 주세요.");
  if (title.length > 200) throw new HttpError(400, "제목은 200자 이하로 입력해 주세요.");
  if (!author) throw new HttpError(400, "작성자를 입력해 주세요.");
  if (author.length > 50) throw new HttpError(400, "작성자는 50자 이하로 입력해 주세요.");
  if (content.length > 10000) throw new HttpError(400, "내용은 10,000자 이하로 입력해 주세요.");
  return { title, author, content };
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "잘못된 게시글 번호입니다.");
  return id;
}

/** 목록 */
noticesRouter.get("/", async (_req, res) => {
  res.json(await readNotices());
});

/** 상세 */
noticesRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const notice = (await readNotices()).find((n) => n.id === id);
  if (!notice) throw new HttpError(404, "존재하지 않는 게시글입니다.");
  res.json(notice);
});

/** 등록 */
noticesRouter.post("/", async (req, res) => {
  const data = validate(req.body);
  const created = await withLock(async () => {
    const notices = await readNotices();
    const now = new Date().toISOString();
    const notice: Notice = {
      id: notices.reduce((max, n) => Math.max(max, n.id), 0) + 1,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await writeNotices([...notices, notice]);
    return notice;
  });
  res.status(201).json(created);
});

/** 수정 */
noticesRouter.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const data = validate(req.body);
  const updated = await withLock(async () => {
    const notices = await readNotices();
    const target = notices.find((n) => n.id === id);
    if (!target) throw new HttpError(404, "존재하지 않는 게시글입니다.");
    const next: Notice = { ...target, ...data, updatedAt: new Date().toISOString() };
    await writeNotices(notices.map((n) => (n.id === id ? next : n)));
    return next;
  });
  res.json(updated);
});

/** 단건 삭제 */
noticesRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const deleted = await deleteByIds([id]);
  if (deleted === 0) throw new HttpError(404, "존재하지 않는 게시글입니다.");
  res.json({ deleted });
});

/** 여러 건 삭제: body { ids: number[] } */
noticesRouter.post("/delete", async (req, res) => {
  const ids = (req.body as { ids?: unknown })?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((v) => Number.isInteger(v) && v > 0)) {
    throw new HttpError(400, "삭제할 게시글 번호(ids)를 배열로 보내 주세요.");
  }
  res.json({ deleted: await deleteByIds(ids as number[]) });
});

function deleteByIds(ids: number[]) {
  const targets = new Set(ids);
  return withLock(async () => {
    const notices = await readNotices();
    const next = notices.filter((n) => !targets.has(n.id));
    if (next.length !== notices.length) await writeNotices(next);
    return notices.length - next.length;
  });
}
