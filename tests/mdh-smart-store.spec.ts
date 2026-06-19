import { expect, test } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

test.describe("Loja inteligente MDH3D", () => {
  test("busca, filtro por categoria e carrinho local funcionam", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.removeItem("mdh3d_smart_cart"));
    const response = await page.goto(`${BASE_URL}/loja`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /MDH3D com checkout externo/i })).toBeVisible();
    await expect(page.locator('[data-smart-product-card="chaveiro-rubro-negro-3d"]').first()).toBeVisible();
    await expect(page.locator('[data-smart-product-card="chaveiro-rubro-negro-3d"]').first()).toContainText("Custo");

    await page.locator("[data-smart-search]").fill("dragão");
    await expect(page.locator('[data-smart-product-card="miniatura-dragao-articulado"]').first()).toBeVisible();
    await expect(page.locator("[data-smart-result-count]")).toContainText(/produto/);

    await page.locator("[data-smart-search]").fill("");
    await page.locator("[data-smart-category]").selectOption("Setup Gamer");
    await expect(page.locator('[data-smart-product-card="suporte-controle-gamer"]').first()).toBeVisible();
    await expect(page.locator("[data-smart-result-count]")).toContainText(/produto/);

    await page.locator("[data-smart-material]").selectOption("PLA");
    await page.locator("[data-smart-sort]").selectOption("menor-preco");
    await expect(page.locator('[data-smart-product-card="suporte-controle-gamer"]').first()).toBeVisible();

    await page.locator('[data-smart-product-card="suporte-controle-gamer"]').first().getByRole("button", { name: /Carrinho/i }).click();
    const cartPanel = page.locator('[role="dialog"]').filter({ hasText: "Carrinho local" });
    await expect(cartPanel).toContainText("1 item");
    await cartPanel.getByPlaceholder("Cupom").fill("PRIMEIRAMDH");
    await cartPanel.getByRole("button", { name: /Aplicar cupom/i }).click();
    const checkout = cartPanel.getByRole("link", { name: /Finalizar pelo WhatsApp/i });
    await expect(checkout).toBeVisible();
    const href = await checkout.getAttribute("href");
    expect(href).toContain("wa.me");
    expect(decodeURIComponent(href || "")).toContain("Suporte para Controle Gamer");
  });

  test("produto com link Nuvemshop usa checkout externo", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/produto/vaso-geometrico-pla`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Vaso Geométrico em PLA/i })).toBeVisible();
    const buy = page.getByRole("link", { name: /Comprar com Pix ou Cartão/i }).first();
    await expect(buy).toBeVisible();
    const href = await buy.getAttribute("href");
    expect(href).toContain("lojavirtualnuvem.com.br");
    expect(await buy.getAttribute("target")).toBe("_blank");
    expect(await buy.getAttribute("rel")).toContain("noopener");
    const productJsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(productJsonLd.some((content) => content.includes('"@type":"Product"') || content.includes('"@type": "Product"'))).toBe(true);
    await expect(page.getByRole("button", { name: /Abrir zoom/i })).toBeVisible();
    const main = page.locator("#main-content");
    await expect(main.getByText(/Frete e prazo/i)).toBeVisible();
    await expect(main.getByText(/Q&A do produto/i)).toBeVisible();
  });

  test("produto sem link Nuvemshop abre WhatsApp com mensagem codificada", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/produto/suporte-controle-gamer`);
    expect(response?.status()).toBe(200);
    const budget = page.getByRole("link", { name: /Pedir orçamento no WhatsApp/i }).first();
    await expect(budget).toBeVisible();
    const href = await budget.getAttribute("href");
    expect(href).toContain("wa.me");
    expect(href).toContain("text=");
    const decoded = decodeURIComponent(href || "");
    expect(decoded).toContain("Suporte para Controle Gamer");
    expect(decoded).toContain("MDH-SET-CTRL");
    expect(decoded).toContain("/produto/suporte-controle-gamer");
  });

  test("feeds locais retornam dados do CSV", async ({ request }) => {
    const json = await request.get(`${BASE_URL}/feeds/produtos.json`);
    expect(json.status()).toBe(200);
    const payload = await json.json();
    expect(payload.total).toBeGreaterThanOrEqual(6);
    expect(payload.products.some((product: { slug: string }) => product.slug === "chaveiro-rubro-negro-3d")).toBe(true);

    const meta = await request.get(`${BASE_URL}/feeds/meta-catalog.csv`);
    expect(meta.status()).toBe(200);
    expect(meta.headers()["content-type"]).toContain("text/csv");
    expect(await meta.text()).toContain("chaveiro-rubro-negro-3d");

    const google = await request.get(`${BASE_URL}/feeds/google-shopping.xml`);
    expect(google.status()).toBe(200);
    expect(google.headers()["content-type"]).toContain("application/xml");
    expect(await google.text()).toContain("<g:price>5.85 BRL</g:price>");

    const tiktok = await request.get(`${BASE_URL}/feeds/tiktok-catalog.csv`);
    expect(tiktok.status()).toBe(200);
    expect(tiktok.headers()["content-type"]).toContain("text/csv");
    expect(await tiktok.text()).toContain("shipping_weight");

    const sitemapProducts = await request.get(`${BASE_URL}/sitemap-products.xml`);
    expect(sitemapProducts.status()).toBe(200);
    expect(await sitemapProducts.text()).toContain("/produto/chaveiro-rubro-negro-3d");
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
