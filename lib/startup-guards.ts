/**
 * Startup Guards - Fail Loudly on Configuration Errors
 *
 * These guards run at module load time to detect critical configuration
 * issues before they cause runtime failures. Better to crash on startup
 * than to silently fail in production.
 *
 * NOTE: This module is server-only. It's imported only in instrumentation.ts
 * which runs on server startup. It won't be bundled into client code.
 */

import 'server-only';
import { getMercadoPagoPublicKey, getMercadoPagoAccessToken, getDatabaseUrl, getSmtpConfig, getSiteUrl, isSiteUrlVercelDefault } from '@/lib/env';
import { verifyEmailProvider, type EmailProvider } from '@/lib/email-provider';

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

  // All payment issues are warnings — store should never crash for payment config
  if (publicKey && !accessToken) {
    warnings.push('⚠️ NEXT_PUBLIC_MP_PUBLIC_KEY is set but MERCADOPAGO_ACCESS_TOKEN is missing. Payments will use fallback.');
  }

  if (accessToken && !publicKey) {
    warnings.push('⚠️ MERCADOPAGO_ACCESS_TOKEN is set but NEXT_PUBLIC_MP_PUBLIC_KEY is missing. Payment Brick disabled.');
  }

  if (isProd && publicKey && publicKey.startsWith('TEST-')) {
    warnings.push(
      `⚠️ TEST Mercado Pago public key in production. Use APP_USR_ credentials for real transactions.`
    );
  }

  if (isProd && accessToken && accessToken.startsWith('TEST-')) {
    warnings.push(
      `⚠️ TEST Mercado Pago access token in production. Use APP_USR_ credentials for real transactions.`
    );
  }

  if (accessToken === '') {
    warnings.push('⚠️ MERCADOPAGO_ACCESS_TOKEN is empty. Pix and Card payments will show fallback UI.');
  }

  if (publicKey === '') {
    warnings.push('⚠️ NEXT_PUBLIC_MP_PUBLIC_KEY is empty. Payment Brick will show fallback UI.');
  }

  if (publicKey && accessToken) {
    const publicIsTest = publicKey.startsWith('TEST-');
    const accessIsTest = accessToken.startsWith('TEST-');

    if (publicIsTest !== accessIsTest) {
      warnings.push(
        `⚠️ Mismatched Mercado Pago credentials: public key is ${publicIsTest ? 'TEST' : 'PROD'}, ` +
        `access token is ${accessIsTest ? 'TEST' : 'PROD'}. Both should match.`
      );
    }
  }

  return {
    ok: true,
    errors,
    warnings,
  };
}

function validateDatabase(): StartupGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    warnings.push('⚠️ DATABASE_URL is not set. Database operations will fail gracefully.');
  }

  return {
    ok: true,
    errors,
    warnings,
  };
}

function validateEmail(): StartupGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getSmtpConfig();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const emailProvider = verifyEmailProvider();

  // Email is non-critical — downgrade to warnings so the store can still operate
  if (isProd && (config.host === '127.0.0.1' || config.host === 'localhost' || config.host === '0.0.0.0')) {
    warnings.push(
      `⚠️ Email is configured for localhost (${config.host}) in PRODUCTION. ` +
      `Set EMAIL_PROVIDER to 'resend', 'sendgrid', or 'mailgun' and configure the required API keys.`
    );
  }

  if (!emailProvider.ok && isProd) {
    emailProvider.issues.forEach(issue => {
      warnings.push(`⚠️ Email provider: ${issue}`);
    });
  }

  // Warn about localhost in development
  if (!isProd && (config.host === '127.0.0.1' || config.host === 'localhost')) {
    warnings.push(
      `ℹ️ Email is using localhost SMTP (MailHog) in development. ` +
      `In production, set EMAIL_PROVIDER=resend and configure RESEND_API_KEY.`
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
    warnings.push('⚠️ SITE_URL could not be determined. Set NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL.');
  }

  if (siteUrl && siteUrl.includes('localhost') && isProd) {
    warnings.push(`⚠️ Site URL is localhost in production: ${siteUrl}. Set a real domain for SEO and payments.`);
  }

  if (isProd && isSiteUrlVercelDefault()) {
    warnings.push(
      `⚠️ Site URL is still a vercel.app domain: ${siteUrl}. ` +
      `Set NEXT_PUBLIC_SITE_URL to your custom domain for correct canonical and SEO.`
    );
  }

  return {
    ok: true,
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
 * Module-level guard execution removed.
 * Guards run explicitly via instrumentation.ts register() only.
 */
