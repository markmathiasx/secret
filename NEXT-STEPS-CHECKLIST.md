# MDH 3D Store - Next Steps & Implementation Checklist

## 📋 Quick Reference

**All files created and ready:**
- ✅ `lib/secure-password-recovery.ts` - Password recovery with 2FA
- ✅ `lib/secure-checkout.ts` - PIX & Card checkout
- ✅ `lib/catalog-validation.ts` - Product validation
- ✅ `lib/production-gates.ts` - Deployment gates
- ✅ `SECURITY-PRODUCTION-GUIDE.md` - Full documentation
- ✅ `IMPLEMENTATION-SUMMARY.md` - Implementation overview
- ✅ `API-ROUTES-IMPLEMENTATION.ts` - API endpoints
- ✅ `INTEGRATION-EXAMPLES.tsx` - React components
- ✅ `components/security-forms.tsx` - UI components
- ✅ `tests/security-services.test.ts` - Test examples

---

## 🚀 Phase 1: Database Setup (2 hours)

### Step 1: Create Migration
```bash
npx prisma migrate dev --name add_security_tables
```

### Step 2: Update `prisma/schema.prisma`

Add these models:

```prisma
model PasswordRecoveryToken {
  id                String   @id @default(cuid())
  userId            String
  email             String
  token             String   @unique
  verificationCode  String?
  isVerified        Boolean  @default(false)
  isUsed            Boolean  @default(false)
  usedAt            DateTime?
  expiresAt         DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([email])
  @@index([token])
}

model Order {
  id                String   @id @default(cuid())
  orderNumber       String   @unique
  buyerId           String?
  status            String   // PENDING_PAYMENT, PAID, SHIPPED, DELIVERED, CANCELLED
  paymentMethod     String   // PIX, CARD, BOLETO
  currency          String   @default("BRL")
  
  subtotal          Decimal
  discountTotal     Decimal  @default(0)
  shippingTotal     Decimal  @default(0)
  taxTotal          Decimal  @default(0)
  grandTotal        Decimal
  
  shippingAddressId String?
  billingAddressId  String?
  
  items             OrderItem[]
  payments          Payment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([orderNumber])
  @@index([buyerId])
  @@index([status])
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  
  title     String
  sku       String
  quantity  Int
  unitPrice Decimal
  totalPrice Decimal
  
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([orderId])
  @@index([productId])
}

model Payment {
  id         String   @id @default(cuid())
  orderId    String
  status     String   // PENDING, COMPLETED, FAILED, REFUNDED
  method     String   // PIX, CARD, BOLETO
  amount     Decimal
  currency   String   @default("BRL")
  externalId String   @unique
  
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([orderId])
  @@index([externalId])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  email     String?
  action    String
  status    String   // success, failed, blocked
  reason    String?
  ipAddress String?
  userAgent String?
  
  timestamp DateTime @default(now())
  
  @@index([userId])
  @@index([email])
  @@index([action])
  @@index([timestamp])
}
```

---

## 🔑 Phase 2: Environment Setup (1 hour)

### Step 1: Create `.env.local`

```bash
# Password Recovery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@mdh3d.local

# Payment Processing
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx

# Or Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=xxxxx

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mdh3d

# Application
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### Step 2: Install Dependencies

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer

# For payment processing
npm install stripe
# OR
npm install mercadopago

# For validation
npm install zod

# For testing
npm install --save-dev vitest @vitest/ui
```

---

## 🔌 Phase 3: API Routes (3 hours)

### Step 1: Create API Directories

```bash
mkdir -p app/api/auth/password-recovery
mkdir -p app/api/checkout
mkdir -p app/api/catalog/validate
mkdir -p app/api/admin/catalog
```

### Step 2: Implement API Routes

Copy from `API-ROUTES-IMPLEMENTATION.ts`:

1. **Password Recovery**
   - `app/api/auth/password-recovery/request.ts`
   - `app/api/auth/password-recovery/verify.ts`

2. **Checkout**
   - `app/api/checkout/validate.ts`
   - `app/api/checkout/pix.ts`
   - `app/api/checkout/card.ts`

3. **Catalog Validation**
   - `app/api/catalog/validate/[productId].ts`
   - `app/api/catalog/validate/batch.ts`

### Step 3: Update `middleware.ts`

Add security headers and middleware from `API-ROUTES-IMPLEMENTATION.ts`

---

## 🎨 Phase 4: UI Components (2 hours)

### Step 1: Implement Components

Copy `components/security-forms.tsx`:
- `PasswordRecoveryForm`
- `CheckoutPIXForm`
- `ProductValidationStatus`

### Step 2: Create Pages

Using examples from `INTEGRATION-EXAMPLES.tsx`:
- `app/checkout/page.tsx`
- `app/auth/password-recovery/page.tsx`
- `app/admin/catalog/page.tsx`

### Step 3: Add to Layout

Update `app/layout.tsx` with security headers:

```typescript
import { metadata } from 'next';

export const metadata = {
  // ... existing metadata
  other: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  }
};
```

---

## ✅ Phase 5: Testing (2 hours)

### Step 1: Add Test File

Copy `tests/security-services.test.ts` to `__tests__/security-services.test.ts`

### Step 2: Run Tests

```bash
npm test
npm run test:coverage
```

Expected coverage:
- Statements: >80%
- Branches: >80%
- Functions: >80%
- Lines: >80%

### Step 3: Manual Testing

Test the complete flow:
1. Password recovery journey
2. PIX checkout process
3. Card checkout process
4. Catalog validation

---

## 🚀 Phase 6: Validation (1 hour)

### Step 1: Run Production Gates

```bash
# First make sure you have a script runner
npm run validate:gates
```

If script doesn't exist, create `scripts/validate-production-gates.ts`

### Step 2: Validate Catalog

```bash
# Validate a single product
curl http://localhost:3000/api/catalog/validate/product-123

# Validate batch
curl -X POST http://localhost:3000/api/catalog/validate/batch \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["p1", "p2", "p3"]}'
```

### Step 3: Check All Gates

```bash
# Code quality
npm run lint
npm run type-check

# Tests
npm run test

# Security
npm audit

# Build
npm run build
```

---

## 📊 Phase 7: Monitoring Setup (1 hour)

### Step 1: Add Logging

Update services with observability:

```typescript
// In password-recovery.ts
import { logger } from '@/lib/logger';

logger.info('Password recovery requested', {
  email,
  ipAddress,
  timestamp: new Date()
});
```

### Step 2: Configure Observability

(Optional but recommended for production)

```bash
npm install pino pino-pretty
# OR
npm install winston
```

### Step 3: Set Up Alerts

Create monitoring dashboard:
- Failed password resets > 10/hour
- Payment failures > 5%
- Invalid products > 50

---

## 🎯 Complete Implementation Checklist

### Database
- [ ] Created Prisma migration
- [ ] Added all models (Token, Order, Payment, AuditLog)
- [ ] Ran `prisma db push`
- [ ] Verified tables in database

### Environment
- [ ] Created `.env.local` with all variables
- [ ] Set up SMTP credentials
- [ ] Configured payment processor (Stripe/MP)
- [ ] Generated NEXTAUTH_SECRET

### Dependencies
- [ ] Installed all required packages
- [ ] Updated package-lock.json
- [ ] No duplicate versions

### API Routes
- [ ] Created all route files
- [ ] Added authentication checks
- [ ] Added error handling
- [ ] Added logging/audit

### Components
- [ ] Created React components
- [ ] Implemented form validation
- [ ] Added error messages
- [ ] Styled with Tailwind

### Pages
- [ ] Created checkout page
- [ ] Created password recovery page
- [ ] Created admin validation page
- [ ] Connected to API routes

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Coverage > 80%
- [ ] No console errors

### Production Gates
- [ ] Lint passing
- [ ] Type check passing
- [ ] Security audit clean
- [ ] Build successful

### Documentation
- [ ] README updated
- [ ] API documented
- [ ] Deployment guide written
- [ ] Team trained

### Security
- [ ] HTTPS configured
- [ ] CSP headers set
- [ ] HSTS enabled
- [ ] Secrets not in code
- [ ] Audit logging enabled

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring set up
- [ ] Alert thresholds defined
- [ ] Logs collected

---

## 🔍 Pre-Deployment Verification

Run this checklist before deploying to production:

```bash
# 1. Code quality
npm run lint && npm run type-check

# 2. Tests
npm run test && npm run test:coverage

# 3. Security
npm audit
npm run validate:gates

# 4. Build
npm run build

# 5. Size analysis
npm run analyze:bundle

# 6. Database
npx prisma migrate deploy
npx prisma db seed

# 7. Environment
echo "Check .env.local exists and has all variables"

# 8. Documentation
echo "Check SECURITY-PRODUCTION-GUIDE.md is up to date"
```

---

## 📞 Troubleshooting

### Common Issues

**SMTP Error: "Invalid credentials"**
```bash
# For Gmail, use 2FA app password (not account password)
# 1. Enable 2FA in Gmail
# 2. Create app-specific password
# 3. Use that password in SMTP_PASSWORD
```

**Payment Token Invalid**
```bash
# Make sure you're using test tokens in development
# Stripe: tok_visa, tok_mastercard
# MercadoPago: Use test account
```

**Database Migration Failed**
```bash
# Rollback and retry
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate dev
```

**Tests Failing**
```bash
# Clear cache and rerun
rm -rf node_modules/.vitest
npm run test -- --clearCache
```

---

## 📈 Success Metrics

After implementation, verify:

✅ **Security**
- Zero critical vulnerabilities
- PCI-DSS compliance verified
- GDPR data handling confirmed

✅ **Performance**
- Page load < 2.5s
- API response < 200ms
- Bundle size < 250KB

✅ **Reliability**
- 99.9% uptime
- Zero data loss
- Automated backups working

✅ **User Experience**
- Password recovery completes in <2min
- Checkout in <3min
- Error messages helpful

---

## 🎓 Training & Documentation

Create team documentation:
1. **Developer Guide** - Setup & contribution
2. **Operations Guide** - Deployment & monitoring
3. **User Guide** - Customer-facing features
4. **Security Guide** - Best practices & incidents

---

## 📅 Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 2 hours | Database setup |
| Phase 2 | 1 hour | Environment |
| Phase 3 | 3 hours | API routes |
| Phase 4 | 2 hours | UI components |
| Phase 5 | 2 hours | Testing |
| Phase 6 | 1 hour | Validation |
| Phase 7 | 1 hour | Monitoring |
| **Total** | **~12 hours** | **Full implementation** |

---

## 🚀 Go-Live Checklist

- [ ] All code reviewed and approved
- [ ] All tests passing with >80% coverage
- [ ] Security audit completed (no critical findings)
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring alerts configured
- [ ] Backup & disaster recovery tested
- [ ] Staging deployment successful
- [ ] Production deployment approved
- [ ] Post-deployment verification done
- [ ] Rollback plan understood

---

## 📞 Support

**Questions? Issues?**

1. Check `SECURITY-PRODUCTION-GUIDE.md`
2. Review code comments in services
3. Check test examples in `tests/`
4. Review integration examples in `INTEGRATION-EXAMPLES.tsx`

**For specific issues:**
- Password recovery: See `lib/secure-password-recovery.ts`
- Checkout: See `lib/secure-checkout.ts`
- Validation: See `lib/catalog-validation.ts`
- Deployment: See `lib/production-gates.ts`

---

**Status:** 🟢 Ready to Begin Implementation
**Last Updated:** 2026-01-15
**Next Step:** Start Phase 1 - Database Setup
