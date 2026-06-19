import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const cartPayload = {
  state: {
    items: [
      {
        productId: "mdh-013",
        quantity: 2,
        title: "Suporte para Fone Headphone",
        pricePix: 69.9,
        priceCard: 70.9,
        image: "/products/setup/suporte-fone-headphone.webp",
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  version: 0,
};

async function seedCart(page: import("@playwright/test").Page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((payload) => {
    window.localStorage.setItem("mdh:cart:v2", JSON.stringify(payload));
  }, cartPayload);
}

test.describe("Checkout web-first", () => {
  test.beforeEach(async ({ page }) => {
    await seedCart(page);
  });

  test("loads checkout with persisted cart and order totals", async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /checkout sem cadastro/i })).toBeVisible();
    await expect(page.getByText("Suporte para Fone Headphone")).toBeVisible();
    await expect(page.getByText(/Total do site/i)).toBeVisible();
    await expect(page.getByText(/R\$\s*139,80/).first()).toBeVisible();
  });

  test("shows empty-cart guard when no product is persisted", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.localStorage.removeItem("mdh:cart:v2"));
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /checkout começa no carrinho/i })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: /ir para o carrinho/i })).toBeVisible();
  });

  test("keeps WhatsApp fallback available with encoded cart context", async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });

    await page.getByPlaceholder("Seu nome").fill("Cliente Teste");
    await page.getByPlaceholder("voce@email.com").fill("cliente@example.com");
    await page.getByPlaceholder("+5521974137662").fill("5521974137662");
    await page.getByPlaceholder("00000-000").fill("20040002");
    await page.getByPlaceholder("Rua, avenida e número").fill("Rua Teste, 123");
    await page.getByPlaceholder("Bairro").fill("Centro");

    const whatsapp = page.getByRole("link", { name: /finalizar via whatsapp/i }).first();
    await expect(whatsapp).toBeVisible();
    const href = await whatsapp.getAttribute("href");

    expect(href).toContain("https://wa.me/5521974137662");
    expect(decodeURIComponent(href || "")).toContain("Suporte para Fone Headphone");
    expect(decodeURIComponent(href || "")).toContain("Cliente Teste");
  });

  test("does not expose card test numbers or payment secrets in checkout DOM", async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });
    const content = await page.content();

    expect(content).not.toContain("4242424242424242");
    expect(content).not.toMatch(/MERCADOPAGO_ACCESS_TOKEN|NEXT_PUBLIC_MP_PUBLIC_KEY|sk_live|sk_test/i);
  });
});
