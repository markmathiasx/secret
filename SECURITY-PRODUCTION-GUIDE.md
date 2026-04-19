# Security & Production Implementation Guide

## Overview

This document details the enterprise-grade security services and production gates implemented for MDH 3D Store 2026.

---

## 1. Password Recovery Service (2-Factor Confirmation)

**File:** `lib/secure-password-recovery.ts`

### Features
- ✅ Dual-confirmation password recovery (Email + 2FA)
- ✅ Rate limiting (3 requests/hour per email)
- ✅ Audit logging for compliance
- ✅ Token expiration (1 hour)
- ✅ Password strength validation
- ✅ Password reuse prevention
- ✅ Session invalidation on reset

### API Usage

#### Step 1: Request Password Recovery
```typescript
import { requestPasswordRecovery } from '@/lib/secure-password-recovery';

const result = await requestPasswordRecovery(
  'user@example.com',
  ipAddress,
  userAgent
);
```

#### Step 2: Verify Token
```typescript
import { verifyPasswordToken } from '@/lib/secure-password-recovery';

const result = await verifyPasswordToken(token, ipAddress);
```

#### Step 3: Verify 2FA Code
```typescript
import { verify2FACode } from '@/lib/secure-password-recovery';

const result = await verify2FACode(token, '123456', ipAddress);
```

#### Step 4: Reset Password
```typescript
import { resetPassword } from '@/lib/secure-password-recovery';

const result = await resetPassword(
  token,
  'newPassword123!',
  'newPassword123!',
  ipAddress
);
```

### Password Requirements
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Audit Logging
All password recovery attempts are logged:
```typescript
import { getAuditLogs } from '@/lib/secure-password-recovery';

const logs = getAuditLogs({ userId: 'user123' });
```

---

## 2. Secure Checkout Service

**File:** `lib/secure-checkout.ts`

### Features
- ✅ PIX payment processing
- ✅ Credit card processing (PCI-DSS compliant)
- ✅ Session-based checkout
- ✅ Real-time inventory validation
- ✅ Address validation
- ✅ Shipping & tax calculation
- ✅ Coupon/discount support

### Payment Methods

#### PIX Payment
```typescript
import { processPIXPayment } from '@/lib/secure-checkout';

const result = await processPIXPayment(session, shippingAddress, billingAddress);
// Returns: { success: boolean, qrCode?: string, pixKey?: string, expiresIn?: number }
```

#### Credit Card Payment (Tokenized)
```typescript
import { processCreditCardPayment } from '@/lib/secure-checkout';

const result = await processCreditCardPayment(
  session,
  shippingAddress,
  billingAddress,
  cardToken, // From Stripe/Square, NOT full card number
  installments // 1-12
);
```

### Checkout Flow

1. **Initiate Checkout**
```typescript
import { initiateCheckout } from '@/lib/secure-checkout';

const session = await initiateCheckout(
  userId,
  sessionToken,
  items // CheckoutItem[]
);
```

2. **Validate Checkout**
```typescript
import { validateCheckout } from '@/lib/secure-checkout';

const validation = await validateCheckout(session, shippingAddress, billingAddress);
```

3. **Process Payment**
```typescript
// PIX or Card, then...
```

4. **Create Order**
```typescript
import { createOrderFromCheckout } from '@/lib/secure-checkout';

const order = await createOrderFromCheckout(
  session,
  'PIX', // or 'CARD'
  transactionId,
  shippingAddress,
  billingAddress
);
```

### Shipping Calculation
- Free above R$ 500
- R$ 15 for R$ 200-500
- R$ 25 for R$ 100-200
- R$ 35 below R$ 100

### Tax Calculation
- 7% ICMS (average, varies by state)

---

## 3. Catalog Validation Service

**File:** `lib/catalog-validation.ts`

### Features
- ✅ Comprehensive product validation
- ✅ Media integrity checks
- ✅ SEO optimization validation
- ✅ Pricing validation
- ✅ Stock availability checks
- ✅ Batch validation
- ✅ Full catalog validation
- ✅ Report export (JSON, CSV, HTML)

### Single Product Validation
```typescript
import { validateProduct } from '@/lib/catalog-validation';

const report = await validateProduct('product-123');
```

### Batch Validation
```typescript
import { validateProductBatch } from '@/lib/catalog-validation';

const reports = await validateProductBatch(
  ['product-1', 'product-2', 'product-3'],
  (current, total) => console.log(`${current}/${total}`)
);
```

### Full Catalog Validation
```typescript
import { validateFullCatalog } from '@/lib/catalog-validation';

const result = await validateFullCatalog(
  (current, total, productId) => {
    console.log(`${current}/${total} - ${productId}`);
  }
);
```

### Validation Checks
1. **Basic Information**
   - Title (10-200 chars)
   - Description (min 50 chars)
   - SKU (required, unique)
   - Status (DRAFT, READY_TO_SHIP, ARCHIVED)

2. **Pricing**
   - PIX price (required, > 0)
   - Card price (optional, >= PIX price)
   - Discount validation

3. **Stock**
   - Stock level defined
   - Status consistency (0 stock = archived)
   - Low stock warning (<5 units)

4. **Media**
   - At least 1 image
   - Valid format (JPG, PNG, WebP, GIF)
   - Minimum resolution (recommended 1200x1200)
   - Thumbnail assigned

5. **SEO**
   - Meta title (30-60 chars)
   - Meta description (120-160 chars)
   - URL slug

6. **Variants** (if applicable)
   - Title, SKU, Price for each

7. **Categories**
   - Collection assignment

### Export Reports
```typescript
import { exportValidationReport } from '@/lib/catalog-validation';

const jsonReport = exportValidationReport(report, 'json');
const csvReport = exportValidationReport(report, 'csv');
const htmlReport = exportValidationReport(report, 'html');
```

---

## 4. Production Gates

**File:** `lib/production-gates.ts`

### Gate Overview

| Gate | Severity | Blocks | Description |
|------|----------|--------|-------------|
| Code Quality & Lint | CRITICAL | YES | ESLint, Prettier, TypeScript |
| Unit Tests | CRITICAL | YES | 80%+ coverage required |
| Integration Tests | HIGH | YES | E2E and API tests |
| Security Scan | CRITICAL | YES | Dependencies, secrets, SAST |
| Performance | HIGH | NO | Bundle size, Lighthouse |
| Build Verification | CRITICAL | YES | Docker build, artifacts |
| Database Migrations | CRITICAL | YES | Syntax, rollback plan |
| Deployment Readiness | HIGH | NO | Environment, infra config |
| Documentation | MEDIUM | NO | README, API docs, guides |
| Compliance | CRITICAL | YES | Licenses, GDPR, PCI-DSS |

### Running Gates

```typescript
import { runAllGates } from '@/lib/production-gates';

const result = await runAllGates();
console.log(result.summary);
// Output: "✓ Deployment ready" or "❌ DEPLOYMENT BLOCKED"
```

### Generating Reports
```typescript
import { generateGateReport } from '@/lib/production-gates';

const report = generateGateReport(result.gates);
console.log(report);
```

---

## 5. Integration with Next.js

### Environment Variables
```bash
# Password Recovery
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@mdh3d.local
SMTP_PASSWORD=xxxxx
SMTP_FROM=noreply@mdh3d.local

# Payment Processing
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx
# or
MERCADOPAGO_ACCESS_TOKEN=xxxxx
SERPER_API_KEY=xxxxx

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mdh3d

# Application
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=https://mdh3d.local
```

### API Routes Example

#### Password Recovery Endpoint
```typescript
// app/api/auth/password-recovery/request.ts
import { requestPasswordRecovery } from '@/lib/secure-password-recovery';

export async function POST(req: Request) {
  const { email } = await req.json();
  const result = await requestPasswordRecovery(
    email,
    req.headers.get('x-forwarded-for') || '',
    req.headers.get('user-agent') || ''
  );
  return Response.json(result);
}
```

#### Checkout Endpoint
```typescript
// app/api/checkout/validate.ts
import { validateCheckout } from '@/lib/secure-checkout';

export async function POST(req: Request) {
  const { session, shippingAddress, billingAddress } = await req.json();
  const result = await validateCheckout(session, shippingAddress, billingAddress);
  return Response.json(result);
}
```

#### Validation Endpoint
```typescript
// app/api/catalog/validate/[productId].ts
import { validateProduct } from '@/lib/catalog-validation';

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const report = await validateProduct(params.productId);
  return Response.json(report);
}
```

---

## 6. Production Deployment Checklist

### Pre-Deployment
- [ ] All code quality gates pass
- [ ] All tests pass (unit + integration)
- [ ] Security scanning clean (no vulnerabilities)
- [ ] Performance benchmarks met
- [ ] Docker build successful
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Documentation updated

### Deployment
```bash
# Run all gates
npm run validate:gates

# Validate catalog (if needed)
npm run validate:gates -- --validate-catalog

# Build and test
npm run build
npm run test

# Deploy
docker build -t mdh-3d-store:latest .
docker push mdh-3d-store:latest
# Deploy to production cluster
```

### Post-Deployment
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Services responsive
- [ ] Logs monitoring active
- [ ] Performance metrics normal

---

## 7. Monitoring & Alerts

### Audit Logs
```typescript
import { getAuditLogs } from '@/lib/secure-password-recovery';

// Get all password recovery attempts
const logs = getAuditLogs({ action: 'password_recovery_requested' });

// Filter by user
const userLogs = getAuditLogs({ userId: 'user-123' });
```

### Key Metrics to Monitor
1. **Security**
   - Failed login attempts
   - Password reset requests
   - 2FA verification rates

2. **Payments**
   - Transaction success rate
   - PIX vs Card split
   - Payment failures by type

3. **Catalog**
   - Invalid products count
   - Media errors
   - SEO compliance

4. **Performance**
   - Page load times
   - API response times
   - Error rates

---

## 8. Troubleshooting

### Password Recovery Issues
- **Token expired**: User waited >1 hour
- **Code mismatch**: User entered wrong 2FA code
- **Rate limit**: User requested >3 times/hour

### Checkout Issues
- **Inventory mismatch**: Product stock changed
- **Price changed**: Product price updated during session
- **Address invalid**: Malformed address data

### Validation Issues
- **Media not found**: Image file path incorrect
- **Missing images**: No images uploaded
- **SEO incomplete**: Meta tags not filled

---

## 9. API Reference

### Types
```typescript
// Password Recovery
interface PasswordRecoveryToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  verificationCode?: string;
  isVerified: boolean;
}

// Checkout
type PaymentMethod = 'PIX' | 'CARD' | 'BOLETO';
type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

interface CheckoutSession {
  id: string;
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'ACTIVE' | 'ABANDONED' | 'COMPLETED';
}

// Validation
interface ValidationReport {
  productId: string;
  status: ValidationStatus;
  checks: ValidationCheck[];
  mediaErrors?: MediaError[];
  suggestions?: string[];
}

// Gates
interface GateResult {
  name: string;
  passed: boolean;
  checks: GateCheck[];
  blocksDeployment: boolean;
}
```

---

## 10. Support & Resources

- **Documentation**: See inline code comments
- **Audit Logs**: Check application logs for security events
- **Error Messages**: All services return descriptive error messages
- **Monitoring**: Set up alerts for critical events

---

**Last Updated:** 2026-01-15
**Status:** Production Ready
**Compliance:** GDPR, PCI-DSS, SOC2
