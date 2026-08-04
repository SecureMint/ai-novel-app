import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createDatabase } from "./database.js";
import { categoryChannels, categoryData } from "./categoryData.js";
const secret = process.env.JWT_SECRET || "development-only-secret-change-me";
type Authed = Request & { user?: { id: string; username: string } };
function auth(req: Authed, res: Response, next: NextFunction) {
  const value = req.headers.authorization?.replace("Bearer ", "");
  if (!value) return res.status(401).json({ message: "请先登录" });
  try {
    req.user = jwt.verify(value, secret) as any;
    next();
  } catch {
    return res.status(401).json({ message: "登录已过期" });
  }
}
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
export function createApp(options: { databasePath?: string } = {}) {
  const database = createDatabase(options.databasePath);
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/health", (_q, r) => r.json({ status: "ok", database: database.health() }));
  app.post("/api/auth/login", (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "用户名至少 3 位，密码至少 6 位" });
    const user = {
      id: `user-${parsed.data.username}`,
      username: parsed.data.username,
    };
    database.ensureUser(user.id, user.username);
    return res.json({
      user,
      token: jwt.sign(user, secret, { expiresIn: "7d" }),
    });
  });
  app.get("/api/books", (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 12));
    const allBooks = database.books();
    const offset = (page - 1) * limit;
    const books = Array.from(
      { length: limit },
      (_, index) => allBooks[(offset + index) % allBooks.length],
    );
    return res.json({ books, page, nextPage: page + 1 });
  });
  app.get("/api/categories", (req, res) => {
    const requested = String(req.query.channel || "男生");
    const channel = categoryChannels.includes(requested as (typeof categoryChannels)[number])
      ? (requested as (typeof categoryChannels)[number])
      : "男生";
    return res.json({ channel, channels: categoryChannels, sections: categoryData[channel] });
  });
  app.get("/api/books/:id/download", auth, (req, r) =>
    r.json({ chapters: database.chapters(String(req.params.id)) }),
  );
  app.post("/api/shelf", auth, (req: Authed, r) => {
    database.addShelf(req.user!.id, req.body.bookId);
    return r.status(201).json({ ok: true, userId: req.user?.id, bookId: req.body.bookId });
  });
  app.post("/api/shelf/batch", auth, (req: Authed, r) => {
    const p = z
      .object({
        bookIds: z.array(z.string()).min(1),
        action: z.enum(["similar", "move", "playlist", "delete"]),
      })
      .safeParse(req.body);
    if (!p.success) return r.status(400).json({ message: "批量操作参数错误" });
    const affected = database.batchShelf(req.user!.id, p.data.bookIds, p.data.action);
    return r.json({ ok: true, affected, action: p.data.action });
  });
  app.delete("/api/history/:id", auth, (req, r) => {
    const historyId = String(req.params.id);
    database.deleteHistory(historyId);
    return r.json({
      ok: true,
      deletedHistoryId: historyId,
      annotationsPreserved: true,
    });
  });
  app.post("/api/sync", auth, (req, r) =>
    r.json({
      ok: true,
      strategy: "latest-updated-at-wins",
      accepted: Array.isArray(req.body) ? req.body.length : 1,
    }),
  );
  app.get("/api/ai/search", async (req, r) => {
    r.setHeader("Content-Type", "text/event-stream");
    r.setHeader("Cache-Control", "no-cache");
    r.setHeader("Connection", "keep-alive");
    r.flushHeaders();
    const q = String(req.query.q || "");
    const books = database.books();
    const tokens = ["正在理解你的阅读偏好…", "我从书库标签中筛选了高匹配作品。"];
    for (const text of tokens) {
      r.write(`event: token\ndata: ${JSON.stringify({ text })}\n\n`);
      await new Promise(x => setTimeout(x, 90));
    }
    const matched = books.filter(
      b => b.tags.some(t => q.includes(t)) || q.includes(b.title.slice(0, 2)),
    );
    r.write(
      `event: books\ndata: ${JSON.stringify({ books: matched.length ? matched : books.slice(0, 3) })}\n\n`,
    );
    r.write("event: done\ndata: {}\n\n");
    r.end();
  });
  return app;
}
