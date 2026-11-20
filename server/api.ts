import express, { Router, type ErrorRequestHandler } from "express";
import { env } from "./env";
import { HttpError } from "./http-error";
import { noticesRouter } from "./routes/notices";

/** /api/* 요청을 처리하는 라우터 (그 외 요청은 Next.js 가 처리) */
export const apiRouter = Router();

// JSON 파싱은 /api 에만 적용 (Next.js 요청 본문은 건드리지 않음)
apiRouter.use(express.json({ limit: "1mb" }));

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", mode: env.mode });
});
apiRouter.use("/notices", noticesRouter);

apiRouter.use((_req, _res, next) => next(new HttpError(404, "존재하지 않는 API 입니다.")));

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  void _next;
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  // express.json() 이 잘못된 JSON 을 받았을 때
  if ((err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ message: "요청 본문(JSON) 형식이 올바르지 않습니다." });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
};
apiRouter.use(errorHandler);
