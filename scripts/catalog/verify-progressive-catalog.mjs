import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:3120";
const server = spawn("npm", ["run", "start"], {
  env: { ...process.env, PORT: "3120", HOSTNAME: "127.0.0.1", AUTH_SECRET: "local-ci-catalog-validation-secret-32chars", AUTH_URL: base },
  stdio: "ignore",
  detached: true,
});
let browser;
try {
  let available = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      if ((await fetch(base + "/api/release")).ok) { available = true; break; }
    } catch {}
    await delay(500);
  }
  assert.ok(available, "Production build starts");
  const response = await fetch(base + "/catalog-data.json");
  assert.equal(response.status, 200);
  const { items, total } = await response.json();
  assert.equal(total, 843);
  assert.equal(items.length, total);
  assert.equal(new Set(items.map(item => item.id)).size, total);
  for (const item of items) {
    assert.ok(item.images.length > 0);
    for (const field of ["baseCost", "estimatedUnitCost", "marketBenchmark", "csvMeta", "makerWorldMeta"]) {
      assert.ok(!(field in item), field + " must stay server-side");
    }
  }
  const html = await (await fetch(base + "/catalogo")).text();
  const bytes = Buffer.byteLength(html);
  assert.ok(bytes < 600000, "Catalog HTML below 600 KB; got " + bytes);
  assert.ok(html.includes('data-official-product-count="843"'));
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const ready = async () => {
    await page.locator('[data-catalog-load-state="ready"]').waitFor({ timeout: 30000 });
    assert.equal(await page.locator("[data-catalog-loaded-count]").getAttribute("data-catalog-loaded-count"), "843");
  };
  await page.goto(base + "/catalogo?category=" + encodeURIComponent("Presentes Criativos"));
  await ready();
  await page.waitForFunction(() => new URL(location.href).searchParams.get("category") === "Presentes Criativos");
  assert.ok(await page.locator("[data-product-card]").count() > 0, "Category still has products");
  assert.equal(new URL(page.url()).searchParams.has("max"), false, "Missing maximum must remain unbounded");
  await page.goto(base + "/busca?q=grinder");
  await ready();
  await page.locator("[data-product-card] h3").filter({ hasText: /grinder/i }).first().waitFor();
  assert.equal(new URL(page.url()).searchParams.get("q"), "grinder");
  await page.goto(base + "/catalogo?page=2");
  await ready();
  await page.waitForFunction(() => new URL(location.href).searchParams.get("page") === "2");
  assert.ok(await page.locator("[data-product-card]").count() > 0);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ catalogProducts: total, htmlBytes: bytes, category: "passed", search: "passed", pagination: "passed", pageErrors: errors }));
} finally {
  await browser?.close();
  try { process.kill(-server.pid, "SIGTERM"); } catch {}
}
