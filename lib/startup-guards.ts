/**
 * Startup Guards - Fail Loudly on Configuration Errors
 *
 * These guards run at module load time to detect critical configuration
 * issues before they cause runtime failures. Better to crash on startup
 * than to silently fail in production.
 */

import { getMercadoPagoPublicKey, getMercadoPagoAccessToken, getDatabaseUrl, getSmtpConfig, getSiteUrl } from '@/lib/env';

interface StartupGuardResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function validateMercadoPago(): StartupGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const publicKey = getMercadoPagoPublicKey();
  const accessToken = getMercadoPagoAccessToken();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // Both keys should be present if Mercado Pago is being used
  if (publicKey && !accessToken) {
    errors.push('❌ NEXT_PUBLIC_MP_PUBLIC_KEY is set but MERCADOPAGO_ACCESS_TOKEN is missing. Both must be configured together.');
  }

  if (accessToken && !publicKey) {
    errors.push('❌ MERCADOPAGO_ACCESS_TOKEN is set but NEXT_PUBLIC_MP_PUBLIC_KEY is missing. Both must be configured together.');
  }

  // Check for test credentials in production
  if (isProd && publicKey && publicKey.startsWith('TEST-')) {
    errors.push(
      `❌ TEST Mercado Pago credentials detected in PRODUCTION (${process.env.VERCEL_ENV}). ` +
      `Use only production credentials (starting with APP_USR_). ` +
      `Current: NEXT_PUBLIC_MP_PUBLIC_KEY=${publicKey.substring(0, 20)}...`
    );
  }

  if (isProd && accessToken && accessToken.startsWith('TEST-')) {
    errors.push(
      `❌ TEST Mercado Pago credentials detected in PRODUCTION (${process.env.VERCEL_ENV}). ` +
      `Use only production credentials. ` +
      `Current: MERCADOPAGO_ACCESS_TOKEN=${accessToken.substring(0, 20)}...`
    );
  }

  // Check for empty/invalid credentials
  if (accessToken === '') {
    warnings.push('⚠️ MERCADOPAGO_ACCESS_TOKEN is empty. Pix and Card payments will show fallback UI.');
  }

  if (publicKey === '') {
    warnings.push('⚠️ NEXT_PUBLIC_MP_PUBLIC_KEY is empty. Payment Brick will show fallback UI.');
  }

  // Warn about mismatched credentials (both TEST or both PROD)
  if (publicKey && accessToken) {
    const publicIsTest = publicKey.startsWith('TEST-');
    const accessIsTest = accessToken.startsWith('TEST-');

    if (publicIsTest !== accessIsTest) {
      errors.push(
        `❌ Mismatched Mercado Pago credentials: ` +
        `NEXT_PUBLIC_MP_PUBLIC_KEY is ${publicIsTest ? 'TEST' : 'PROD'} ` +
        `but MERCADOPAGO_ACCESS_TOKEN is ${accessIsTest ? 'TEST' : 'PROD'}. ` +
        `Both must be from the same environment.`
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateDatabase(): StartupGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dbUrl = getDatabaseUrl();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (!dbUrl) {
    warnings.push('⚠️ DATABASE_URL is not set. Database operations will fail.');
    if (isProd) {
      errors.push('❌ DATABASE_URL is required in production.');
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateEmail(): StartupGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getSmtpConfig();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // Check for localhost MailHog in production
  if (isProd && (config.host === '127.0.0.1' || config.host === 'localhost' || config.host === '0.0.0.0')) {
    errors.push(
      `❌ Email is configured for localhost (${config.host}) in PRODUCTION. ` +
      `Set SMTP_HOST to a real transactional email provider (e.g., resend.com, mailgun, sendgrid).`
    );
  }

  // Warn about localhost in development
  if (!isProd && (config.host === '127.0.0.1' || config.host === 'localhost')) {
    warnings.push(
      `ℹ️ Email is using localhost SMTP (MailHog). In production, configure a real email provider. ` +
      `Set: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateSiteUrl(): StartupGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const siteUrl = getSiteUrl();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (!siteUrl) {
    errors.push('❌ SITE_URL could not be determined. Set NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL.');
  }

  if (siteUrl && siteUrl.includes('localhost')) {
    if (isProd) {
      errors.push(`❌ Site URL is localhost in production: ${siteUrl}. Use a real domain.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Run all startup guards and report results
 */
export function runStartupGuards(options?: { exitOnError?: boolean }): StartupGuardResult {
  const exitOnError = options?.exitOnError !== false;
  const guards = [
    { name: '🌐 Mercado Pago', validate: validateMercadoPago },
    { name: '🗄️ Database', validate: validateDatabase },
    { name: '📧 Email', validate: validateEmail },
    { name: '🔗 Site URL', validate: validateSiteUrl },
  ];

  const allResults: StartupGuardResult = {
    ok: true,
    errors: [],
    warnings: [],
  };

  for (const guard of guards) {
    const result = guard.validate();
    
    if (!result.ok) {
      allResults.ok = false;
    }

    if (result.errors.length > 0) {
      console.error(`\n${guard.name} - ERRORS:`);
      result.errors.forEach(err => console.error(`  ${err}`));
      allResults.errors.push(...result.errors);
    }

    if (result.warnings.length > 0 && !result.ok) {
      console.warn(`\n${guard.name} - WARNINGS:`);
      result.warnings.forEach(warn => console.warn(`  ${warn}`));
      allResults.warnings.push(...result.warnings);
    }
  }

  if (!allResults.ok) {
    console.error(
      '\n' +
      '═══════════════════════════════════════════════════════════════\n' +
      '❌ STARTUP VALIDATION FAILED\n' +
      '═══════════════════════════════════════════════════════════════\n' +
      'Critical configuration errors detected. Please fix the issues above.\n' +
      'See .env.example for required variables.\n' +
      '═══════════════════════════════════════════════════════════════\n'
    );

    if (exitOnError) {
      process.exit(1);
    }
  } else if (allResults.warnings.length > 0) {
    console.warn(
      '\n' +
      '───────────────────────────────────────────────────────────────\n' +
      '⚠️ STARTUP VALIDATION - WARNINGS\n' +
      '───────────────────────────────────────────────────────────────\n'
    );
  }

  return allResults;
}

/**
 * Called at module load time for server-side
 */
if (typeof window === 'undefined') {
  // Server-side only
  try {
    // Skip in test environments
    if (process.env.NODE_ENV !== 'test') {
      // Only exit on error in production-like environments
      const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
      runStartupGuards({ exitOnError: isProd });
    }
  } catch (error) {
    console.error('Failed to run startup guards:', error);
  }
}
