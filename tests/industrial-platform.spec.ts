import { expect, test } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

test.describe("Industrial platform gates", () => {
  test("health, liveness and readiness are public and sanitized", async ({ request }) => {
    const liveness = await request.get(`${BASE_URL}/api/health/liveness`);
    expect(liveness.status()).toBe(200);
    await expect(liveness).toBeOK();
    const liveJson = await liveness.json();
    expect(liveJson.ok).toBe(true);

    const readiness = await request.get(`${BASE_URL}/api/health/readiness`);
    expect(readiness.status()).toBe(200);
    const readyJson = await readiness.json();
    expect(readyJson.ok).toBe(true);
    expect(JSON.stringify(readyJson)).not.toMatch(/DATABASE_URL|DIRECT_URL|SECRET|TOKEN|PASSWORD/);
    expect(JSON.stringify(readyJson)).toContain("product-master");
    expect(JSON.stringify(readyJson)).toContain("critical-feeds");
  });

  test("db and cache health keep optional fallback", async ({ request }) => {
    const db = await request.get(`${BASE_URL}/api/health/db`);
    expect(db.status()).toBe(200);
    const dbJson = await db.json();
    expect(JSON.stringify(dbJson)).not.toMatch(/postgresql:\/\/|DIRECT_URL/);

    const cache = await request.get(`${BASE_URL}/api/health/cache`);
    expect(cache.status()).toBe(200);
    const cacheJson = await cache.json();
    expect(cacheJson.ok).toBe(true);
  });

  test("AI chat works without local PC and blocks sensitive collection", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/ai-chat/message`, {
      data: { message: "quero chaveiro barato, qual preco?" },
    });
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.mode).toBe("fallback_instant");
    expect(JSON.stringify(json)).not.toMatch(/localhost|127\.0\.0\.1|OLLAMA_BASE_URL/);
  });

  test("admin AI and local agent endpoints are protected", async ({ request }) => {
    const admin = await request.get(`${BASE_URL}/api/admin/ai-chat/health`);
    expect([403, 503]).toContain(admin.status());

    const agent = await request.get(`${BASE_URL}/api/local-agent/tasks`);
    expect([403, 503]).toContain(agent.status());
  });
});
