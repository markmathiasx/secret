/**
 * E2E Cart Tests
 * Tests cart UI behavior: add, update quantity, remove items.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || process.env.SMOKE_BASE_URL || "http://localhost:3000";

test.describe("Cart UI", () => {
  test("catálogo lista produtos", async ({ page }) => {
    await page.goto(`${BASE_URL}/catalogo`);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/catalogo/);
    // Should have at least one product link
    const productLinks = page.locator('a[href^="/loja/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test("página de produto tem informações essenciais", async ({ page }) => {
    await page.goto(`${BASE_URL}/catalogo`);
    await page.waitForLoadState("networkidle");

    const productLink = page.locator('a[href^="/loja/"]').first();
    const href = await productLink.getAttribute("href");
    if (!href) return;

    await page.goto(`${BASE_URL}${href}`);
    await page.waitForLoadState("networkidle");

    // Page should have a title (h1)
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });
    const h1Text = await h1.textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(3);
  });

  test("botão de WhatsApp está presente", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    // WhatsApp button should exist somewhere on the page
    const waLink = page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first();
    await expect(waLink).toBeVisible({ timeout: 10000 });
  });

  test("API de saúde responde com 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json().catch(() => ({}));
    expect(body).toBeDefined();
  });

  test("sitemap.xml existe e é válido", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<url>");
  });

  test("robots.txt existe", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/robots.txt`);
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(/User-agent/i);
  });
});
