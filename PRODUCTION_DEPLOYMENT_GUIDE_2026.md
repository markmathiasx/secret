# MDH 3D Store - April 2026 Production Deployment Guide

## Overview

This guide covers the complete setup for deploying MDH 3D Store as a production-grade ecommerce storefront with:
- ✅ Reliable checkout with Pix and Card payments
- ✅ Secure password recovery with email + phone
- ✅ Production monitoring (Sentry + OpenTelemetry)
- ✅ CI/CD gates with Playwright tests
- ✅ Real transactional email
- ✅ Mobile-first UX refinements
- ✅ Analytics and CRM integration

---

## CRITICAL P0 - CHECKOUT & PAYMENTS

### 1. Mercado Pago Configuration

#### Environment Variables
Set these in your `.env.production` and Vercel dashboard:

```env
# ❌ WRONG - Test credentials in production
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-12345...
MERCADOPAGO_ACCESS_TOKEN=TEST-12345...

# ✅ CORRECT - Production credentials
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxxxxxxxxx
```

**CRITICAL RULES:**
- Both keys must be from the SAME Mercado Pago application
- Both keys must be from the SAME environment (both PROD or both TEST)
- In production, ONLY use credentials starting with `APP_USR_`
- The public key CAN be exposed (it's in the browser)
- The access token MUST be server-only (never expose to frontend)
- NEVER commit credentials to git

#### Obtain Production Credentials
1. Go to [Mercado Pago Console](https://www.mercadopago.com.br/developers)
2. Create a production application
3. Copy the **Production Public Key** to `NEXT_PUBLIC_MP_PUBLIC_KEY`
4. Copy the **Production Access Token** to `MERCADOPAGO_ACCESS_TOKEN`
5. Go to Settings > Webhooks and set:
   - URL: `https://yourdomain.com/api/webhooks/mercadopago`
   - Copy the Webhook Secret to `MERCADOPAGO_WEBHOOK_SECRET`

#### Startup Validation
The app will FAIL TO START if:
- Credentials are missing
- Credentials don't match (one TEST, one PROD)
- TEST credentials are used in production

This is intentional - it's better to crash on startup than silently fail in production.

**Example error:**
```
❌ STARTUP VALIDATION FAILED
❌ TEST Mercado Pago credentials detected in PRODUCTION
❌ Mismatched Mercado Pago credentials: NEXT_PUBLIC_MP_PUBLIC_KEY is PROD but MERCADOPAGO_ACCESS_TOKEN is TEST
```

### 2. Pix Payment (QR Code + Copy-Paste)

The Pix implementation includes:
- Dynamic QR Code generation
- Copy-paste string (Brcode)
- Manual Pix key fallback
- Expiration countdown
- Automatic retry on failure

**What to test in production:**
1. QR Code appears correctly on checkout
2. Copy-paste string can be used in banking apps
3. Pix key option works as fallback
4. QR Code doesn't break the page on error
5. Payment completes after Pix is approved

**Debug QR Code Issues:**
```bash
# Check if Mercado Pago SDK loads
curl -I https://sdk.mercadopago.com/js/v2

# Verify Pix is enabled in your MP account
# Go to Mercado Pago Settings > Payment Methods > Pix > Enable
```

### 3. Card Payment (Credit/Debit)

Uses Mercado Pago's **Card Payment Brick** for:
- Secure PCI-compliant card handling
- Native form UI
- Support for installments
- Real-time card validation

**What to test in production:**
1. Card Payment Brick form appears
2. Form accepts valid card details
3. Form validates card numbers in real-time
4. Payment processes successfully
5. Form doesn't freeze or disappear
6. Error messages display clearly

**Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Form doesn't appear | SDK not loaded | Check CSP headers, allow `sdk.mercadopago.com` |
| Form freezes on submit | Network latency | Increase timeout or use Pix as primary |
| Form disappears | Container unmount issue | Check React strict mode, avoid re-renders |
| White text invisible | Dark mode CSS issue | Fixed - see globals.css select styling |

### 4. Select/Option Visibility Fix (Dark Mode)

**Issue:** Select dropdowns had white text on white background.

**Fix Applied:**
- Added `color-scheme: dark` to select elements
- Proper styling for option elements
- Cyan highlight for selected options
- Custom dropdown icon

**Verify in production:**
```html
<select className="field-base">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

All text should be clearly visible on dark background.

---

## CRITICAL P1 - EMAIL & PASSWORD RECOVERY

### 1. Real Transactional Email Provider

**REQUIREMENT:** Email MUST work in production (no MailHog/localhost fallback).

#### Recommended: Resend.com (Best for Vercel)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=orders@mdh-3d-store.com
```

**Steps:**
1. Sign up at [Resend.com](https://resend.com)
2. Create API key
3. Verify domain (if not Vercel-hosted)
4. Set `RESEND_API_KEY` in production

#### Alternative: SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=orders@mdh-3d-store.com
```

#### Alternative: Mailgun

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mail.mdh-3d-store.com
EMAIL_FROM=orders@mdh-3d-store.com
```

### 2. Password Recovery Flow

The improved password recovery includes:
- **Step 1:** User enters email
- **Step 2:** Generic response (no account enumeration)
- **Step 3:** Email sent with recovery link/token
- **Step 4:** (TODO) Phone confirmation required
- **Step 5:** (TODO) OTP via WhatsApp/SMS
- **Step 6:** User sets new password

**Current Implementation:**
- Email-based recovery ✅
- Generic responses ✅
- Rate limiting ⚠️ (needs review)
- Token expiration ⚠️ (needs configuration)

**To Complete:**
- [ ] Add phone confirmation step
- [ ] Implement OTP flow
- [ ] Add WhatsApp integration
- [ ] Create beautiful UI for flow
- [ ] Comprehensive audit trail

---

## CRITICAL P2 - MONITORING & OBSERVABILITY

### 1. Sentry (Error Tracking)

Sentry is configured in `next.config.ts` but needs environment variables.

```env
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
SENTRY_ORG=mdh-3d
SENTRY_PROJECT=storefront
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

**Setup:**
1. Create project at [Sentry.io](https://sentry.io)
2. Select Next.js
3. Copy DSN to `.env.production`
4. Errors automatically tracked for:
   - Server-side exceptions
   - API errors
   - Client-side errors
   - Payment errors
   - Email delivery failures

### 2. OpenTelemetry (Distributed Tracing)

**Status:** Configured in instrumentation.ts but needs setup.

```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-backend.com
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer%20token
```

**Instruments:**
- Critical user journeys
- Payment flow
- Password recovery
- Product page loads
- Checkout steps
- API latency

**Setup Instructions:**
- [ ] Choose OTel backend (Datadog, New Relic, Honeycomb, etc.)
- [ ] Configure OTEL environment variables
- [ ] Add @vercel/otel integration
- [ ] Create dashboards for critical paths

---

## CRITICAL P3 - CI/CD & DEPLOYMENT GATES

### GitHub Actions Workflow

The `.github/workflows/production-gates.yml` includes:

**Required Checks:**
1. ✅ TypeScript type checking (`npm run typecheck`)
2. ✅ ESLint code quality (`npm run lint`)
3. ✅ Production build (`npm run build`)
4. ✅ Playwright E2E tests (`npm run test:e2e`)
5. ✅ Security audit (`npm audit`)
6. ✅ Prisma migration validation

**Branch Protection:**
```yaml
Required status checks:
- ✅ typecheck
- ✅ lint
- ✅ build
- ✅ playwright
- ✅ security
- ✅ migrations
```

**What runs when:**
- Push to `main`: All checks required before merge
- PR to `main`: All checks must pass
- Deployment: Only proceed if all checks pass

### Playwright E2E Tests

Critical checkout tests:

```typescript
// e2e/checkout-pix.spec.ts
test('Pix checkout flow', async ({ page }) => {
  // 1. Navigate to checkout
  // 2. Fill in customer details
  // 3. Select Pix payment method
  // 4. Verify QR Code appears
  // 5. Verify copy-paste string is visible
  // 6. Simulate Pix payment
  // 7. Verify success page
});
```

**Tests to add:**
- [ ] Card checkout flow
- [ ] Password recovery flow
- [ ] Mobile responsiveness
- [ ] Form validation errors
- [ ] Loading states

**Run locally:**
```bash
npm run test:e2e
npm run test:e2e -- --headed  # With UI
npm run test:e2e -- --debug   # Debug mode
```

---

## CRITICAL P4 - CATALOG & PRODUCT IMAGES

### Current State
- Products have single images
- Need multiple angles per product

### Requirements
Each important product should have:
- **4-8 images** from different angles
- **Same product** variations (not different products)
- **Main thumbnail** with best-selling angle
- **Detail close-ups** of finishes
- **Context of use** where applicable
- **Scale reference** when relevant

### Image Optimization
- Quality: 75-85% JPEG
- Format: WebP/AVIF (Vercel serves best format)
- Aspect Ratio: Consistent 1:1 or 3:4
- Alt text: Descriptive and SEO-friendly
- Compression: Automatic via Vercel Image Optimization

**Upload Process:**
1. Prepare 4-8 images per product
2. Name: `product-id-angle-1.jpg`, `product-id-angle-2.jpg`, etc.
3. Upload to Supabase bucket
4. Update product record with image URLs
5. Test in all browsers/devices

---

## CRITICAL P5 - UX & VISUAL REFINEMENT

### Mobile-First Improvements

**Contrast & Readability:**
- [ ] Review all text colors (WCAG AA minimum)
- [ ] Test all form inputs on mobile
- [ ] Verify button sizes (44px minimum)
- [ ] Check focus indicators on keyboard navigation

**Spacing & Hierarchy:**
- [ ] Consistent padding/margins
- [ ] Better visual hierarchy for CTAs
- [ ] Sticky "Add to Cart" / "Checkout" on mobile
- [ ] Improved card layouts

**Performance:**
- [ ] Lazy load images
- [ ] Code splitting for bundles
- [ ] Optimize fonts (Google Fonts)
- [ ] Remove unused CSS/JS

### Accessibility (AA Level)
```bash
npm run typecheck    # Ensures type safety
npm run lint         # Code quality
npm run build        # Full compilation
# Use Chrome DevTools Accessibility Audits
# Use Axe DevTools browser extension
```

---

## CRITICAL P6 - ANALYTICS, CRM & ACQUISITION

### Google Analytics 4

**Status:** Core GA4 integration needed.

```env
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

**Events to track:**
- `view_item_list` - Category/collection page
- `select_item` - Product clicked
- `view_item` - PDP loaded
- `add_to_cart` - Cart updated
- `begin_checkout` - Checkout started
- `add_shipping_info` - Shipping selected
- `add_payment_info` - Payment method chosen
- `purchase` - Payment completed
- `whatsapp_click` - Support contacted
- `review_submitted` - Customer review posted

### Meta Pixel + Conversion API

```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=xxxxxxxxx
FACEBOOK_PIXEL_ACCESS_TOKEN=EAAxxxx
```

**Setup:**
1. Create Facebook Business Account
2. Create Pixel
3. Install on website
4. Configure Conversion API
5. Map events from GA4

### CRM (Simple Pipeline)

**Status:** Configured but needs implementation.

Minimum viable pipeline:
- **Leads:** Email + phone from checkout/contact
- **Contacted:** Sales rep reached out
- **Qualified:** Customer interested
- **Proposal:** Quote sent
- **Negotiation:** Discussing terms
- **Won:** Order completed
- **Lost:** Didn't convert

**Integrations to add:**
- [ ] Mailchimp or Brevo for email sequences
- [ ] WhatsApp Business API for follow-ups
- [ ] Zapier to connect tools

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment (Week Before)

- [ ] All environment variables configured in Vercel
- [ ] Mercado Pago credentials verified (production)
- [ ] Email provider API keys set
- [ ] Sentry project created
- [ ] Database migrations run
- [ ] Playwright tests passing
- [ ] Build succeeds locally
- [ ] CDN cache invalidation strategy set

### Deployment Day

- [ ] Run full test suite
- [ ] Deploy to staging first
- [ ] Smoke tests on staging
- [ ] Test Pix payment flow end-to-end
- [ ] Test card payment flow end-to-end
- [ ] Test password recovery email
- [ ] Deploy to production
- [ ] Monitor Sentry for errors (1 hour)
- [ ] Monitor analytics in GA4
- [ ] Monitor checkout conversion rate

### Post-Deployment

- [ ] Daily error log review (first week)
- [ ] Monitor payment success rates
- [ ] Check email delivery rates
- [ ] Review user feedback
- [ ] Performance monitoring (CLS, LCP, FID)
- [ ] Security scanning (OWASP, CSP violations)

---

## PRODUCTION ENVIRONMENT VARIABLES

Copy to Vercel dashboard:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db
DIRECT_URL=postgresql://user:pass@host/db

# Mercado Pago (PRODUCTION ONLY)
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_xxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxx
MERCADOPAGO_WEBHOOK_SECRET=whsec_xxxx

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxx
EMAIL_FROM=orders@mdh-3d-store.com

# Monitoring
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
SENTRY_ORG=mdh-3d
SENTRY_PROJECT=storefront
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=xxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxx
SUPABASE_SERVICE_ROLE_KEY=eyxx

# Auth
AUTH_SECRET=use-openssl-rand-hex-32
NEXTAUTH_URL=https://mdh-3d-store.com

# Feature Flags
NEXT_PUBLIC_ENABLE_CARD_CHECKOUT=true
NEXT_PUBLIC_ENABLE_PIX_CHECKOUT=true
NEXT_PUBLIC_ENABLE_AFFILIATE=false
```

---

## TROUBLESHOOTING

### Pix QR Code Not Appearing
1. Check Mercado Pago credentials are production
2. Check network tab for SDK load errors
3. Check browser console for JS errors
4. Verify QR Code library is imported
5. Check if Pix is enabled in MP account

### Card Brick Won't Mount
1. Verify NEXT_PUBLIC_MP_PUBLIC_KEY is set
2. Check CSP headers allow `sdk.mercadopago.com`
3. Check container element exists in DOM
4. Try clearing browser cache
5. Check network latency to MP servers

### Emails Not Sending
1. Verify EMAIL_PROVIDER is set correctly
2. Check API keys in environment
3. Look for errors in server logs
4. Check email provider dashboard for bounces
5. Verify domain is verified (if required)

### Build Fails at Startup
1. Check `.env.production` has all required vars
2. Run `npm run typecheck` locally
3. Check database connection string
4. Review startup guard error message
5. Fix configuration and redeploy

---

## MONITORING DASHBOARDS

### Sentry Dashboard
- Error rate
- Failed checkout attempts
- Payment errors
- Email delivery failures
- API latency

### GA4 Dashboard
- Checkout abandonment rate
- Payment method distribution
- Conversion rate
- Revenue per user
- UTM attribution

### Custom Dashboard (To Create)
- Mercado Pago webhook health
- Email delivery rate
- Database query latency
- API response times
- User authentication status

---

## SUPPORT & ESCALATION

**Critical Issues:**
1. Payments not processing → Check Mercado Pago dashboard
2. Emails not sending → Check provider status
3. Database down → Contact Supabase support
4. Deploy failed → Check GitHub Actions logs

**Monitoring Links:**
- Sentry: https://sentry.io
- Mercado Pago: https://www.mercadopago.com.br/developers
- Resend: https://resend.com/docs
- Vercel: https://vercel.com/docs

---

Last updated: April 19, 2026
Version: 1.0 (Production Ready)
