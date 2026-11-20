import { env } from "./env";
import { createServer } from "node:http";
import express from "express";
import next from "next";
import { apiRouter } from "./api";

/**
 * 화면(Next.js)과 API(Express)를 한 서버, 한 포트에서 실행
 *   /api/*  → Express (server/api.ts)
 *   그 외    → Next.js
 */
const dev = env.mode !== "production";
const app = express();
const server = createServer(app);
// httpServer 를 넘겨야 개발 모드의 화면 자동 갱신(HMR 웹소켓)이 동작함
const nextApp = next({ dev, hostname: env.host, port: env.port, httpServer: server });
const handle = nextApp.getRequestHandler();

app.disable("x-powered-by");
app.use("/api", apiRouter);
app.use((req, res) => handle(req, res));

nextApp
  .prepare()
  .then(() => {
    server.listen(env.port, env.host, () => {
      console.log(`> ${dev ? "development" : "production"} 서버 실행: http://localhost:${env.port}`);
      console.log(`  화면 http://localhost:${env.port}  |  API http://localhost:${env.port}/api`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
