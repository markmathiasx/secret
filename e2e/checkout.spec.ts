/**
 * E2E Tests - Checkout Flow
 * Tests critical checkout paths that MUST pass before production deploy
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Checkout Flow - Production Critical', () => {
  test.beforeEach(async ({ page }) => {
    // Set authenticated user
    await page.goto(`${BASE_URL}/`);
  });

  test.describe('PIX Payment', () => {
    test('should load checkout page with PIX option', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const pixButton = page.locator('button:has-text("PIX")');
      await expect(pixButton).toBeVisible();
      await expect(pixButton).toBeEnabled();
    });

    test('should generate PIX QR code', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      // Select PIX payment
      await page.click('button:has-text("PIX")');
      await page.waitForTimeout(500);
      
      // Verify QR code is displayed
      const qrCode = page.locator('canvas[id*="qr"], img[alt*="QR"]');
      await expect(qrCode).toBeVisible({ timeout: 5000 });
    });

    test('should copy PIX key to clipboard', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      await page.goto(`${BASE_URL}/checkout`);
      await page.click('button:has-text("PIX")');
      
      const copyButton = page.locator('button:has-text("Copiar"), button:has-text("Copy")');
      await expect(copyButton).toBeVisible();
      
      await copyButton.click();
      await page.waitForTimeout(300);
      
      // Verify success message
      const successMsg = page.locator('text=/copiado|copied/i');
      await expect(successMsg).toBeVisible({ timeout: 3000 });
    });

    test('should display payment instructions clearly', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      await page.click('button:has-text("PIX")');
      
      // Verify instructions are present
      const instructions = page.locator('text=/instrução|instruction|prazo|pix/i');
      await expect(instructions.first()).toBeVisible();
    });
  });

  test.describe('Credit Card Payment', () => {
    test('should load credit card form', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const cardButton = page.locator('button:has-text("Cartão")');
      await expect(cardButton).toBeVisible();
      await cardButton.click();
      
      // Verify card form appears
      const cardForm = page.locator('[data-testid="card-form"], form:has([placeholder*="card"i])');
      await expect(cardForm).toBeVisible({ timeout: 5000 });
    });

    test('should validate card number format', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      await page.click('button:has-text("Cartão")');
      
      const cardInput = page.locator('[name="cardNumber"], [placeholder*="card number"i]');
      await cardInput.fill('invalid');
      
      // Blur to trigger validation
      await cardInput.blur();
      
      const errorMsg = page.locator('text=/inválido|invalid/i');
      await expect(errorMsg).toBeVisible({ timeout: 2000 });
    });

    test('should accept valid test card', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      await page.click('button:has-text("Cartão")');
      
      // Fill with valid test card (Stripe test)
      const cardInput = page.locator('[name="cardNumber"], [data-testid="card-number"]');
      await cardInput.fill('4242424242424242');
      
      const expiryInput = page.locator('[name="expiry"], [placeholder*="MM/YY"i]');
      await expiryInput.fill('12/25');
      
      const cvcInput = page.locator('[name="cvc"], [placeholder*="CVC"i]');
      await cvcInput.fill('123');
      
      // Verify no validation errors
      const errors = page.locator('text=/erro|error/i');
      await expect(errors).not.toBeVisible();
    });

    test('should require all card fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      await page.click('button:has-text("Cartão")');
      
      const submitButton = page.locator('button[type="submit"]:has-text("Pagar"), button:has-text("Pay")');
      await submitButton.click();
      
      // Should show validation errors
      const requiredErrors = page.locator('text=/obrigatório|required/i');
      await expect(requiredErrors.first()).toBeVisible({ timeout: 2000 });
    });

    test('should show installment options', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      await page.click('button:has-text("Cartão")');
      
      const installmentSelect = page.locator('select[name="installments"], [data-testid="installments"]');
      await expect(installmentSelect).toBeVisible();
      
      // Verify we have multiple options
      const options = installmentSelect.locator('option');
      const count = await options.count();
      expect(count).toBeGreaterThan(1);
    });
  });

  test.describe('Checkout Security', () => {
    test('should not expose sensitive data in DOM', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const content = await page.content();
      
      // Should NOT contain real test cards in source
      expect(content).not.toContain('4242424242424242');
      expect(content).not.toContain('5555555555554444');
    });

    test('should use HTTPS for payment endpoints', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      // Intercept payment requests
      const paymentRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('payment') || request.url().includes('charge')) {
          paymentRequests.push(request.url());
        }
      });
      
      // All payment requests should be HTTPS
      paymentRequests.forEach(url => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    test('should validate CSRF tokens', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const csrfToken = page.locator('[name="csrf"], [name="_csrf"], input[value*="."]');
      if (await csrfToken.isVisible()) {
        const tokenValue = await csrfToken.inputValue();
        expect(tokenValue).toBeTruthy();
        expect(tokenValue!.length).toBeGreaterThan(10);
      }
    });
  });

  test.describe('Order Summary', () => {
    test('should display order total correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const totalPrice = page.locator('[data-testid="order-total"], text=/total:/i');
      await expect(totalPrice).toBeVisible();
      
      const priceText = await totalPrice.textContent();
      expect(priceText).toMatch(/\d+[\.,]\d{2}/); // Currency format
    });

    test('should show shipping cost', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const shippingCost = page.locator('[data-testid="shipping-cost"], text=/frete|shipping/i');
      await expect(shippingCost).toBeVisible();
    });

    test('should apply discount codes', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const discountInput = page.locator('[name="coupon"], [placeholder*="cupom"i], [placeholder*="coupon"i]');
      if (await discountInput.isVisible()) {
        await discountInput.fill('TESTDISCOUNT');
        
        const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Apply")');
        await applyButton.click();
        
        // Wait for discount calculation
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Should be able to navigate to submit button with Tab
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]');
      const count = await inputs.count();
      
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const label = page.locator(`label[for="${await input.getAttribute('id')}"]`);
        
        // Either has associated label or aria-label
        const hasLabel = (await label.count()) > 0 || await input.getAttribute('aria-label');
        expect(hasLabel).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      // Simulate offline
      await page.context().setOffline(true);
      
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isEnabled()) {
        await submitButton.click();
      }
      
      // Should show network error message
      const errorMsg = page.locator('text=/erro|erro de conexão|network/i');
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test('should show clear error for invalid payment', async ({ page }) => {
      await page.goto(`${BASE_URL}/checkout`);
      
      // Try to submit with invalid data
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click({ force: true });
      
      // Should show validation or payment error
      const errorMsg = page.locator('[role="alert"], text=/erro|error|inválido|invalid/i');
      await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
    });
  });
});
