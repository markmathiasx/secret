/**
 * Email Provider - Abstraction layer for transactional email
 *
 * Supports multiple providers:
 * - Resend.com (recommended for Vercel)
 * - SendGrid
 * - Mailgun
 * - SMTP (local/fallback)
 *
 * Switch providers by setting EMAIL_PROVIDER environment variable.
 */

import { getSmtpConfig, getSiteUrl } from '@/lib/env';

export type EmailProvider = 'resend' | 'sendgrid' | 'mailgun' | 'smtp';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProviderResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get configured email provider
 */
function getConfiguredProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase() as EmailProvider;
  
  // In production, Resend is recommended for Vercel
  if (process.env.VERCEL === '1' && process.env.NODE_ENV === 'production') {
    return 'resend';
  }
  
  return provider;
}

/**
 * Send email via Resend (recommended for Vercel)
 */
async function sendViaResend(options: SendEmailOptions): Promise<EmailProviderResult> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return {
      ok: false,
      error: 'RESEND_API_KEY not configured'
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || process.env.EMAIL_FROM || 'noreply@mdh-3d-store.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: `Resend API error: ${JSON.stringify(error)}`
      };
    }

    const data = await response.json();
    return {
      ok: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      ok: false,
      error: `Resend error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(options: SendEmailOptions): Promise<EmailProviderResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    return {
      ok: false,
      error: 'SENDGRID_API_KEY not configured'
    };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }],
          subject: options.subject,
        }],
        from: {
          email: options.from || process.env.EMAIL_FROM || 'noreply@mdh-3d-store.com',
        },
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
          ...(options.text ? [{
            type: 'text/plain',
            value: options.text,
          }] : []),
        ],
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `SendGrid API error: ${response.statusText}`
      };
    }

    return {
      ok: true,
      messageId: response.headers.get('X-Message-Id') || undefined,
    };
  } catch (error) {
    return {
      ok: false,
      error: `SendGrid error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Send email via Mailgun
 */
async function sendViaMailgun(options: SendEmailOptions): Promise<EmailProviderResult> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  
  if (!apiKey || !domain) {
    return {
      ok: false,
      error: 'MAILGUN_API_KEY or MAILGUN_DOMAIN not configured'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('from', options.from || process.env.EMAIL_FROM || 'noreply@mdh-3d-store.com');
    formData.append('to', options.to);
    formData.append('subject', options.subject);
    formData.append('html', options.html);
    if (options.text) {
      formData.append('text', options.text);
    }
    if (options.replyTo) {
      formData.append('h:Reply-To', options.replyTo);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Mailgun API error: ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      ok: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      ok: false,
      error: `Mailgun error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Send email via SMTP (local development/fallback)
 */
async function sendViaSMTP(options: SendEmailOptions): Promise<EmailProviderResult> {
  try {
    const { sendMail } = await import('@/lib/mailer');
    
    const result = await sendMail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      ok: true,
      messageId: result.messageId || undefined,
    };
  } catch (error) {
    return {
      ok: false,
      error: `SMTP error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
  const provider = getConfiguredProvider();
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // Log email send attempt for audit trail
  console.log(`📧 Sending email via ${provider} to ${options.to}`);

  let result: EmailProviderResult;

  switch (provider) {
    case 'resend':
      result = await sendViaResend(options);
      break;
    case 'sendgrid':
      result = await sendViaSendGrid(options);
      break;
    case 'mailgun':
      result = await sendViaMailgun(options);
      break;
    case 'smtp':
    default:
      result = await sendViaSMTP(options);
  }

  if (!result.ok) {
    console.error(`❌ Email send failed (${provider}):`, result.error);
    
    // In production, log email failures for monitoring
    if (isProd) {
      console.error(`⚠️ CRITICAL: Email send failed in production`, {
        provider,
        to: options.to,
        subject: options.subject,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    console.log(`✅ Email sent successfully (${provider}):`, result.messageId);
  }

  return result;
}

/**
 * Verify email provider configuration
 */
export function verifyEmailProvider(): { ok: boolean; provider: EmailProvider; issues: string[] } {
  const provider = getConfiguredProvider();
  const issues: string[] = [];
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (provider === 'resend' && !process.env.RESEND_API_KEY) {
    issues.push('RESEND_API_KEY is not set');
  }

  if (provider === 'sendgrid' && !process.env.SENDGRID_API_KEY) {
    issues.push('SENDGRID_API_KEY is not set');
  }

  if (provider === 'mailgun') {
    if (!process.env.MAILGUN_API_KEY) issues.push('MAILGUN_API_KEY is not set');
    if (!process.env.MAILGUN_DOMAIN) issues.push('MAILGUN_DOMAIN is not set');
  }

  if (provider === 'smtp') {
    const config = getSmtpConfig();
    if (isProd && (config.host === 'localhost' || config.host === '127.0.0.1')) {
      issues.push('SMTP is configured for localhost in production - use a real email provider');
    }
  }

  return {
    ok: issues.length === 0,
    provider,
    issues,
  };
}

/**
 * Get email provider status
 */
export function getEmailProviderStatus() {
  const provider = getConfiguredProvider();
  const verification = verifyEmailProvider();
  
  return {
    provider,
    configured: verification.ok,
    issues: verification.issues,
    isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
  };
}
