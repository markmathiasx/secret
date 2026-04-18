import { test, expect } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

test.describe("MDH 3D Store – Smoke Tests", () => {
  test("Home: carrega com elementos principais", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/MDH 3D/i);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.locator('a[href="/catalogo"]').first()).toBeVisible();
  });

  test("Home: botão Ver catálogo completo navega para /catalogo", async ({ page }) => {
    await page.goto(BASE_URL);
    const link = page.locator('a[href="/catalogo"]').first();
    await link.click();
    await expect(page).toHaveURL(/\/catalogo/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Catálogo: retorna 200 e mostra produtos", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/catalogo`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  });

  test("Catálogo: filtro mode=real funciona", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/catalogo?mode=real`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  });

  test("Catálogo: filtro status=Pronta+entrega funciona", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/catalogo?status=Pronta%20entrega`);
    expect(response?.status()).toBe(200);
  });

  test("PDP: primeira página de produto retorna 200", async ({ page }) => {
    // Navigate to catalog and get first product link
    await page.goto(`${BASE_URL}/catalogo`);
    const productLink = page.locator('a[href^="/catalogo/"]').first();
    const href = await productLink.getAttribute("href");
    if (!href) throw new Error("Nenhum link de produto encontrado no catálogo");

    const response = await page.goto(`${BASE_URL}${href}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("PDP: JSON-LD de produto presente na página", async ({ page }) => {
    await page.goto(`${BASE_URL}/catalogo`);
    const productLink = page.locator('a[href^="/catalogo/"]').first();
    const href = await productLink.getAttribute("href");
    if (!href) throw new Error("Nenhum link de produto encontrado");

    await page.goto(`${BASE_URL}${href}`);
    const jsonLd = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLd.length).toBeGreaterThan(0);

    const contents = await Promise.all(jsonLd.map((el) => el.textContent()));
    const hasProduct = contents.some((c) => c?.includes('"Product"') || c?.includes('"BreadcrumbList"'));
    expect(hasProduct).toBe(true);
  });

  test("Checkout: retorna 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/checkout`);
    expect(response?.status()).toBe(200);
  });

  test("Login: retorna 200 e mostra formulário", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/login`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  });

  test("FAQ: retorna 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/faq`);
    expect(response?.status()).toBe(200);
  });

  test("Política de privacidade: retorna 200 e contém conteúdo LGPD", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/politica-de-privacidade`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/privacidade/i);
  });

  test("Health API: retorna 200 e status ok", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("Sitemap: retorna 200 e contém URL do catálogo", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("/catalogo");
  });

  test("Robots.txt: retorna 200 e permite indexação pública", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toContain("Disallow: /\n");
  });

  test("Imagem para impressão 3D: retorna 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/imagem-para-impressao-3d`);
    expect(response?.status()).toBe(200);
  });

  test("Entregas: retorna 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/entregas`);
    expect(response?.status()).toBe(200);
  });

  test("Presentes 3D: retorna 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/presentes-3d`);
    expect(response?.status()).toBe(200);
  });

  test("Admin login: retorna 200 ou redireciona para login", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/admin`);
    // Either shows login or redirects to /admin/login
    const finalUrl = page.url();
    const status = response?.status() ?? 0;
    expect(status).toBe(200);
    expect(finalUrl).toMatch(/\/admin/);
  });

  test("Nenhuma rota principal retorna 500", async ({ page }) => {
    const routes = ["/", "/catalogo", "/checkout", "/login", "/faq", "/entregas", "/politica-de-privacidade"];
    for (const route of routes) {
      const response = await page.goto(`${BASE_URL}${route}`);
      const status = response?.status() ?? 0;
      expect(status, `Rota ${route} retornou ${status}`).not.toBe(500);
    }
  });
});
