import { expect, test } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const PRODUCT_LINK_SELECTOR = 'a[href^="/catalogo/"]';
const SMART_PRODUCT_SLUG = "chaveiro-goleiro-comercial-copa-2026-copa-001";

test.describe("Loja inteligente MDH3D", () => {
  test("alias /loja redireciona para o catálogo canônico com produtos públicos", async ({ page }) => {
    await page.goto(`${BASE_URL}/loja`);
    await expect(page).toHaveURL(/\/catalogo/);
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("[data-product-card]").first()).toBeVisible();
    await expect(page.locator(PRODUCT_LINK_SELECTOR).first()).toBeVisible();
  });

  test("catálogo canônico adiciona produto ao carrinho global", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.removeItem("mdh:cart:v2"));
    await page.goto(`${BASE_URL}/catalogo`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-product-card]").first()).toBeVisible();

    const firstCard = page.locator("[data-product-card]").first();
    const productName = (await firstCard.locator("h3").first().textContent())?.trim() || "";
    await firstCard.getByRole("button", { name: /Carrinho/i }).click();
    await page.goto(`${BASE_URL}/carrinho`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /Revise o pedido/i })).toBeVisible();
    if (productName) {
      await expect(page.locator("body")).toContainText(productName);
    }
  });

  test("PDP público exibe compra, WhatsApp, JSON-LD e galeria real", async ({ page }) => {
    await page.goto(`${BASE_URL}/catalogo`, { waitUntil: "networkidle" });
    const href = await page.locator(PRODUCT_LINK_SELECTOR).first().getAttribute("href");
    expect(href).toBeTruthy();

    const response = await page.goto(`${BASE_URL}${href}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('[data-testid="product-image-gallery"] img').first()).toBeVisible();

    const buy = page.getByRole("link", { name: /Comprar|Pedir orçamento/i }).first();
    await expect(buy).toBeVisible();
    const whatsapp = page.locator('a[href*="wa.me"]').first();
    await expect(whatsapp).toBeVisible();

    const productJsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(productJsonLd.some((content) => content.includes('"Product"') || content.includes('"BreadcrumbList"'))).toBe(true);
  });

  test("PDP da loja inteligente renderiza produto real em /produto sem cair na busca", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/produto/${SMART_PRODUCT_SLUG}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/produto/${SMART_PRODUCT_SLUG}$`));
    await expect(page.getByRole("heading", { name: /Chaveiro Goleiro Comercial Copa 2026/i })).toBeVisible();
    await expect(page.getByText("Compra segura via checkout externo")).toBeVisible();
    await expect(page.locator("a[href*='wa.me']").first()).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((content) => content.includes('"@type":"Product"') || content.includes('"@type": "Product"'))).toBe(true);
    expect(jsonLd.some((content) => content.includes('"@type":"BreadcrumbList"') || content.includes('"@type": "BreadcrumbList"'))).toBe(true);
  });

  test("feeds públicos retornam apenas dados navegáveis do catálogo atual", async ({ request }) => {
    const json = await request.get(`${BASE_URL}/feeds/produtos.json`);
    expect(json.status()).toBe(200);
    const payload = await json.json();
    expect(payload.total).toBeGreaterThanOrEqual(12);
    expect(payload.products.some((product: { slug: string }) => product.slug.includes("chaveiro"))).toBe(true);

    const google = await request.get(`${BASE_URL}/feeds/google-shopping.xml`);
    expect(google.status()).toBe(200);
    expect(google.headers()["content-type"]).toContain("application/xml");
    expect(await google.text()).toContain("/produto/");

    const sitemapProducts = await request.get(`${BASE_URL}/sitemap-products.xml`);
    expect(sitemapProducts.status()).toBe(200);
    expect(await sitemapProducts.text()).toContain("/catalogo/");

    const sitemap = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(`/produto/${SMART_PRODUCT_SLUG}`);
  });

  test("ofertas e orçamento personalizado carregam sem credenciais externas", async ({ page }) => {
    const ofertas = await page.goto(`${BASE_URL}/ofertas`);
    expect(ofertas?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Ofertas, cupons e combos/i })).toBeVisible();
    await expect(page.getByText("PRIMEIRAMDH")).toBeVisible();

    const orcamento = await page.goto(`${BASE_URL}/orcamento-personalizado`);
    expect(orcamento?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Orçamento sob medida/i })).toBeVisible();
    await page.getByLabel(/Quantidade/i).fill("3");
    const whatsapp = page.getByRole("link", { name: /Enviar orçamento no WhatsApp/i });
    await expect(whatsapp).toBeVisible();
    const href = await whatsapp.getAttribute("href");
    expect(href).toContain("wa.me");
    expect(decodeURIComponent(href || "")).toContain("Quantidade: 3");
  });
});
