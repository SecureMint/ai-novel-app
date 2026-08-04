import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
const app = createApp({ databasePath: ":memory:" });
let server: Server;
beforeAll(
  () =>
    new Promise<void>((resolve, reject) => {
      server = app.listen(0, "127.0.0.1", error => (error ? reject(error) : resolve()));
    }),
);
afterAll(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve())),
    ),
);
describe("API", () => {
  it("reports API and database health", async () => {
    const r = await request(server).get("/health");
    expect(r.status).toBe(200);
    expect(r.body.status).toBe("ok");
    expect(r.body.database.connected).toBe(true);
    expect(r.body.database.bookCount).toBe(5);
  });
  it("protects shelf", async () => {
    expect((await request(server).post("/api/shelf").send({ bookId: "b1" })).status).toBe(401);
  });
  it("returns complete paginated book feed data", async () => {
    const response = await request(server).get("/api/books?page=2&limit=8");
    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.nextPage).toBe(3);
    expect(response.body.books).toHaveLength(8);
    expect(response.body.books[0]).toMatchObject({
      id: expect.any(String),
      cover: expect.any(String),
      description: expect.any(String),
      tags: expect.any(Array),
    });
  });
  it("returns channel-specific category sections", async () => {
    const male = await request(server).get("/api/categories?channel=男生");
    const female = await request(server).get("/api/categories?channel=女生");
    expect(male.status).toBe(200);
    expect(male.body.sections.map((section: { key: string }) => section.key)).toEqual([
      "hot",
      "subject",
      "role",
      "plot",
    ]);
    expect(female.body.sections[0].tags).not.toEqual(male.body.sections[0].tags);
  });
  it("logs in and runs batch action", async () => {
    const login = await request(server)
      .post("/api/auth/login")
      .send({ username: "reader", password: "reader123" });
    const r = await request(server)
      .post("/api/shelf/batch")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ bookIds: ["b1", "b2"], action: "move" });
    expect(r.status).toBe(200);
    expect(r.body.affected).toBe(2);
  });
  it("history deletion preserves annotations", async () => {
    const login = await request(server)
      .post("/api/auth/login")
      .send({ username: "reader", password: "reader123" });
    const r = await request(server)
      .delete("/api/history/h1")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(r.body.annotationsPreserved).toBe(true);
  });
});
