# Playwright Marketplace Run

Generated at: 06/19/2026 05:27:35
Base URL: http://127.0.0.1:3000

| Command | Exit code | Log |
| --- | ---: | --- |
| `npm run test -- --reporter=line` | 0 | reports/playwright-tests.out.log |
| `npm run test:e2e -- --reporter=line` | 0 | reports/playwright-e2e.out.log |

## Tests tail
```text

> mdh-3d-store@2.0.0 test
> playwright test --reporter=line


🧪 Catalog Semantic Integrity Test Gate

  ✅ Semantic audit report exists
  ✅ All snapshot items audited (248 >= 248)
  ✅ All items have required audit fields
  ✅ No APPROVED items with placeholder images (found 0)
  ✅ All placeholder text cards are BLOCKED (0 exceptions)
  ✅ mdh-057 is BLOCKED with placeholder flag (status: BLOCKED)
  ✅ All APPROVED items have score >= 0.70 (0 violations)
  ✅ Audit is recent (2026-06-19T04:54:26.897Z)
  ✅ Status counts sum to total (248 === 248)
  ✅ No APPROVED items with placeholder/rejected mediaStatus (0)

📊 Results: 10 passed, 0 failed

```

## E2E tail
```text

> mdh-3d-store@2.0.0 test:e2e
> playwright test --config=playwright.e2e.config.ts --reporter=line


[WebServer]
[WebServer] 🌐 Mercado Pago - WARNINGS:
[WebServer]   ⚠️ MERCADOPAGO_ACCESS_TOKEN is empty. Pix and Card payments will show fallback UI.
[WebServer]   ⚠️ NEXT_PUBLIC_MP_PUBLIC_KEY is empty. Payment Brick will show fallback UI.
[WebServer]
[WebServer] 🗄️ Database - WARNINGS:
[WebServer]   DATABASE_URL: DATABASE_URL não configurada. Configure a variável no ambiente antes de usar recursos com banco.
[WebServer]
[WebServer] 📧 Email - WARNINGS:
[WebServer]   ⚠️ Email is configured for localhost (127.0.0.1) in PRODUCTION. Set EMAIL_PROVIDER to 'resend', 'sendgrid', or 'mailgun' and configure the required API keys.
[WebServer]   ⚠️ Email provider: RESEND_API_KEY is not set

[WebServer]
[WebServer] ───────────────────────────────────────────────────────────────
[WebServer] ⚠️ STARTUP VALIDATION - WARNINGS
[WebServer] ───────────────────────────────────────────────────────────────
[WebServer]


Running 9 tests using 1 worker

[1/9] [chromium] › e2e\checkout.spec.ts:34:7 › Checkout web-first › loads checkout with persisted cart and order totals
[2/9] [chromium] › e2e\checkout.spec.ts:43:7 › Checkout web-first › shows empty-cart guard when no product is persisted
[3/9] [chromium] › e2e\checkout.spec.ts:52:7 › Checkout web-first › keeps WhatsApp fallback available with encoded cart context
[4/9] [chromium] › e2e\checkout.spec.ts:71:7 › Checkout web-first › does not expose card test numbers or payment secrets in checkout DOM
[5/9] [chromium] › e2e\password-recovery.spec.ts:6:7 › Password recovery › renders the email recovery form
[6/9] [chromium] › e2e\password-recovery.spec.ts:15:7 › Password recovery › uses native email validation for malformed addresses
[7/9] [chromium] › e2e\password-recovery.spec.ts:26:7 › Password recovery › submits a valid request without exposing account existence

[WebServer] {"level":"error","event":"password_reset_request_failed","timestamp":"2026-06-19T05:27:11.885Z","requestId":"68aa7dd7-0926-4f50-b666-381789150611","ip":"127.0.0.1","error":"\nInvalid `prisma.user.findUnique()` invocation:\n\n\nerror: Environment variable not found: DATABASE_URL.\n  -->  schema.prisma:7\n   | \n 6 |   provider  = \"postgresql\"\n 7 |   url       = env(\"DATABASE_URL\")\n   | \n\nValidation Error Count: 1"}
[8/9] [chromium] › e2e\password-recovery.spec.ts:36:7 › Password recovery › shows reset form when token is present and rejects invalid token

[WebServer] {"level":"error","event":"password_reset_confirm_failed","timestamp":"2026-06-19T05:27:13.307Z","error":"\nInvalid `prisma.verificationToken.findUnique()` invocation:\n\n\nerror: Environment variable not found: DATABASE_URL.\n  -->  schema.prisma:7\n   | \n 6 |   provider  = \"postgresql\"\n 7 |   url       = env(\"DATABASE_URL\")\n   | \n\nValidation Error Count: 1"}
[9/9] [chromium] › e2e\password-recovery.spec.ts:49:7 › Password recovery › validates password confirmation before calling the API
  9 passed (19.9s)
```
