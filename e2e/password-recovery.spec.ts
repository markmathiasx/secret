import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Password recovery", () => {
  test("renders the email recovery form", async ({ page }) => {
    await page.goto(`${BASE_URL}/recuperar-senha`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /recuperar acesso/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar solicitação/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /recuperar via whatsapp/i })).toBeVisible();
  });

  test("uses native email validation for malformed addresses", async ({ page }) => {
    await page.goto(`${BASE_URL}/recuperar-senha`, { waitUntil: "networkidle" });

    const email = page.locator('input[type="email"]');
    await email.fill("invalid-email");
    await page.getByRole("button", { name: /enviar solicitação/i }).click();

    const validationMessage = await email.evaluate((input) => (input as HTMLInputElement).validationMessage);
    expect(validationMessage.length).toBeGreaterThan(0);
  });

  test("submits a valid request without exposing account existence", async ({ page }) => {
    await page.goto(`${BASE_URL}/recuperar-senha`, { waitUntil: "networkidle" });

    await page.locator('input[type="email"]').fill(`cliente-${Date.now()}@example.com`);
    await page.getByRole("button", { name: /enviar solicitação/i }).click();

    await expect(page.getByText(/solicitação recebida/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/se o e-mail estiver cadastrado/i)).toBeVisible();
  });

  test("shows reset form when token is present and rejects invalid token", async ({ page }) => {
    await page.goto(`${BASE_URL}/recuperar-senha?token=invalid-token-${Date.now()}`, {
      waitUntil: "networkidle",
    });

    await expect(page.getByRole("heading", { name: /defina sua nova senha/i })).toBeVisible();
    await page.locator('input[type="password"]').first().fill("NewSecurePassword123");
    await page.locator('input[type="password"]').nth(1).fill("NewSecurePassword123");
    await page.getByRole("button", { name: /salvar nova senha/i }).click();

    await expect(page.getByText(/link inválido ou expirado|erro ao redefinir/i)).toBeVisible({ timeout: 10_000 });
  });

  test("validates password confirmation before calling the API", async ({ page }) => {
    await page.goto(`${BASE_URL}/recuperar-senha?token=invalid-token-${Date.now()}`, {
      waitUntil: "networkidle",
    });

    await page.locator('input[type="password"]').first().fill("NewSecurePassword123");
    await page.locator('input[type="password"]').nth(1).fill("DifferentPassword123");
    await page.getByRole("button", { name: /salvar nova senha/i }).click();

    await expect(page.getByText(/confirmação da senha não confere/i)).toBeVisible();
  });
});
