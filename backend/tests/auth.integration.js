const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/index");
const { pool, initDb } = require("../src/db");

test("integration: register -> login -> me with username", async (t) => {
  try {
    await pool.query("SELECT 1");
  } catch {
    t.skip("PostgreSQL is not reachable. Start docker compose first.");
    return;
  }

  await initDb();

  const username = `itest_${Date.now()}`;
  const password = "password123";

  t.after(async () => {
    await pool.query("DELETE FROM users WHERE username = $1", [username]);
  });

  const registerResponse = await request(app).post("/api/auth/register").send({ username, password });
  assert.equal(registerResponse.status, 201);
  assert.ok(registerResponse.body.token);
  assert.equal(registerResponse.body.user.username, username);

  const loginResponse = await request(app).post("/api/auth/login").send({ username, password });
  assert.equal(loginResponse.status, 200);
  assert.ok(loginResponse.body.token);

  const meResponse = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);

  assert.equal(meResponse.status, 200);
  assert.equal(meResponse.body.user.username, username);
});
