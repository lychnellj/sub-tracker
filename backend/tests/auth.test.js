const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/index");

test("GET /health responds with ok", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("POST /api/auth/register rejects invalid payload", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "x",
    password: "short",
  });

  assert.equal(response.status, 400);
});

test("POST /api/auth/login rejects invalid payload", async () => {
  const response = await request(app).post("/api/auth/login").send({
    username: "x",
    password: "short",
  });

  assert.equal(response.status, 400);
});
