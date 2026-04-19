/**
 * API Routes Implementation Guide
 * Ready-to-use API endpoints for all security services
 */

// ============================================================================
// app/api/auth/password-recovery/request.ts
// ============================================================================

import { requestPasswordRecovery } from '@/lib/secure-password-recovery';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Request recovery
    const result = await requestPasswordRecovery(
      email,
      ip,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Password Recovery Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// app/api/auth/password-recovery/verify.ts
// ============================================================================

import { verify2FACode, resetPassword } from '@/lib/secure-password-recovery';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, code, newPassword, confirmPassword, action } =
      await request.json();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (action === '2fa') {
      // Verify 2FA code
      if (!token || !code) {
        return NextResponse.json(
          { error: 'Token and code required' },
          { status: 400 }
        );
      }

      const result = await verify2FACode(token, code, ip);
      return NextResponse.json(result);
    }

    if (action === 'reset') {
      // Reset password
      if (!token || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: 'Token, password, and confirmation required' },
          { status: 400 }
        );
      }

      const result = await resetPassword(
        token,
        newPassword,
        confirmPassword,
        ip
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Password Verification Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// app/api/checkout/validate.ts
// ============================================================================

import { validateCheckout } from '@/lib/secure-checkout';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { session, shippingAddress, billingAddress } = await request.json();

    if (!session || !shippingAddress) {
      return NextResponse.json(
        { error: 'Session and shipping address required' },
        { status: 400 }
      );
    }

    const result = await validateCheckout(
      session,
      shippingAddress,
      billingAddress
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Checkout Validation Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// app/api/checkout/pix.ts
// ============================================================================

import { processPIXPayment, createOrderFromCheckout } from '@/lib/secure-checkout';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { session, shippingAddress, billingAddress } = await request.json();

    if (!session || !shippingAddress) {
      return NextResponse.json(
        { error: 'Session and address required' },
        { status: 400 }
      );
    }

    // Process PIX
    const pixResult = await processPIXPayment(
      session,
      shippingAddress,
      billingAddress
    );

    if (!pixResult.success) {
      return NextResponse.json(
        { error: pixResult.error },
        { status: 400 }
      );
    }

    // Create order
    const orderResult = await createOrderFromCheckout(
      session,
      'PIX',
      pixResult.pixKey || '',
      shippingAddress,
      billingAddress
    );

    if (orderResult.error) {
      return NextResponse.json(
        { error: orderResult.error },
        { status: 400 }
      );
    }

    // Return PIX details + order ID
    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      qrCode: pixResult.qrCode,
      pixKey: pixResult.pixKey,
      expiresIn: pixResult.expiresIn
    });
  } catch (error) {
    console.error('[PIX Processing Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// app/api/checkout/card.ts
// ============================================================================

import { processCreditCardPayment, createOrderFromCheckout } from '@/lib/secure-checkout';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      session,
      shippingAddress,
      billingAddress,
      cardToken,
      installments = 1
    } = await request.json();

    if (!session || !shippingAddress || !cardToken) {
      return NextResponse.json(
        { error: 'Session, address, and card token required' },
        { status: 400 }
      );
    }

    // Process card
    const cardResult = await processCreditCardPayment(
      session,
      shippingAddress,
      billingAddress || shippingAddress,
      cardToken,
      installments
    );

    if (!cardResult.success) {
      return NextResponse.json(
        { error: cardResult.error },
        { status: 400 }
      );
    }

    // Create order
    const orderResult = await createOrderFromCheckout(
      session,
      'CARD',
      cardResult.transactionId || '',
      shippingAddress,
      billingAddress || shippingAddress
    );

    if (orderResult.error) {
      return NextResponse.json(
        { error: orderResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      transactionId: cardResult.transactionId,
      installments
    });
  } catch (error) {
    console.error('[Card Processing Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// app/api/catalog/validate/[productId].ts
// ============================================================================

import { validateProduct, exportValidationReport } from '@/lib/catalog-validation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv' | 'html';
    const fullValidation = searchParams.get('full') === 'true';

    const report = await validateProduct(params.productId, fullValidation);

    // Export in requested format
    const content = exportValidationReport(report, format);

    const headers: Record<string, string> = {
      'Content-Type': format === 'json' ? 'application/json' : 'text/plain'
    };

    if (format === 'html') {
      headers['Content-Type'] = 'text/html';
    }

    return new NextResponse(content, { headers });
  } catch (error) {
    console.error('[Catalog Validation Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// app/api/catalog/validate/batch.ts
// ============================================================================

import { validateProductBatch } from '@/lib/catalog-validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productIds, fullValidation = false } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array required' },
        { status: 400 }
      );
    }

    const reports = await validateProductBatch(productIds);

    const summary = {
      totalProducts: reports.length,
      validCount: reports.filter(r => r.status === 'VALID').length,
      invalidCount: reports.filter(r => r.status === 'INVALID').length,
      warningCount: reports.filter(r => r.status === 'WARNING').length,
      reports
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Batch Validation Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// middleware.ts - Global Security Middleware
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();

  // HSTS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );

  // XSS Protection
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // CORS
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3000');

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/auth/:path*', '/checkout/:path*', '/catalog/:path*']
};

// ============================================================================
// Environment Variables (.env.local)
// ============================================================================

/*
# Password Recovery
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@mdh3d.local
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@mdh3d.local

# Payment Processing
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx
MERCADOPAGO_ACCESS_TOKEN=xxxxx

# Application
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://mdh3d.local
DATABASE_URL=postgresql://user:pass@localhost:5432/mdh3d

# Observability
DATADOG_API_KEY=xxxxx (optional)
SENTRY_DSN=xxxxx (optional)
*/

// ============================================================================
// package.json Scripts
// ============================================================================

/*
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "validate:gates": "ts-node scripts/validate-production-gates.ts",
  "validate:catalog": "ts-node scripts/validate-catalog.ts"
}
*/
