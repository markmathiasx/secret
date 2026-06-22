import { expect, test } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

test.describe("Preview NeoGlass Commerce OS 2026", () => {
  test("renderiza a prévia isolada com dados reais e WhatsApp oficial", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    const response = await page.goto(`${BASE_URL}/preview/neoglass-2026`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);

    await expect(page.getByTestId("neoglass-header")).toContainText("Loja");
    await expect(page.getByText("MDH3D Commerce OS 2026")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Impressão 3D sob encomenda com visual de futuro/i })).toBeVisible();
    await expect(page.getByTestId("neoglass-search")).toBeVisible();
    await expect(page.getByTestId("neoglass-catalog-section")).toContainText("Pix");
    await expect(page.getByTestId("neoglass-drops")).toContainText("STLFLIX");
    await expect(page.getByTestId("neoglass-cinematic-product")).toContainText("Product detail simulation");
    await expect(page.getByTestId("neoglass-configurator")).toContainText("3D Lab Configurator");
    await expect(page.getByTestId("neoglass-admin-command")).toContainText("Score Commerce OS");
    await expect(page.getByTestId("neoglass-admin-command")).toContainText("100/100/100");
    await expect(page.getByTestId("neoglass-mobile-preview")).toContainText("Carrinho");
    await expect(page.getByTestId("neoglass-comparison")).toContainText("Antes/depois");

    const whatsappLink = page.locator('.neoglass-preview a[href^="https://wa.me/5521974137662"]').first();
    await expect(whatsappLink).toBeVisible();
    await expect(whatsappLink).toHaveAttribute("rel", /noopener/);

    const criticalErrors = consoleErrors.filter((entry) => !/favicon|Failed to load resource/i.test(entry));
    expect(criticalErrors).toEqual([]);
  });
});
