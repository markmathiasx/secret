import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mdh_cookie_consent", "rejected"));
});

test("home preserves visible content, pointer feedback and reduced motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pequenos objetos.");
  const collection = page.locator(".experience-collection").first();
  await collection.hover();
  await expect.poll(() => collection.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => collection.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  await expect(page.getByRole("link", { name: "Encontrar minha peça" })).toBeVisible();
});

test("catalog loads fully and preserves filters through product navigation", async ({ page }) => {
  await page.goto("/catalogo?type=keychain");
  await expect(page.locator('[data-catalog-load-state="ready"]')).toBeVisible();
  const products = page.locator("[data-product-card]");
  expect(await products.count()).toBeGreaterThan(0);
  const names = await products.locator("h3").allTextContents();
  expect(names.every((name) => /chaveiro/i.test(name))).toBe(true);
  const favorite = products.first().getByRole("button", { name: /^Favoritar/ });
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await products.first().locator("h3 a").click();
  await expect(page).toHaveURL(/from=.*type/);
  await page.goBack();
  await expect(page).toHaveURL(/type=keychain/);
  await expect(page.locator('[data-catalog-load-state="ready"]')).toBeVisible();
});

test("mobile menu responds to click and Escape without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Abrir menu", exact: true });
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Menu principal", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  for (const route of ["/", "/catalogo", "/login", "/carrinho"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  await page.goto("/catalogo");
  await expect(page.locator('[data-catalog-load-state="ready"]')).toBeVisible();
  await expect(page.locator(".experience-filter-panel")).not.toHaveAttribute("open", "");
  await page.getByText("Filtrar produtos", { exact: true }).click();
  await expect(page.locator('.experience-filter-fields select[aria-label="Categoria"]')).toBeVisible();
});
