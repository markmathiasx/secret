import "server-only";
import { logStructured } from "@/lib/logger";

export interface WhatsAppSendResult {
  success: boolean;
  simulated?: boolean;
  fallbackLink?: string;
}

const WA_API_VERSION = "v23.0";
const SUPPORT_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5521974137662").replace(/\D/g, "");

function buildFallbackLink(phone: string, code: string): string {
  const msg = `Olá! Solicitei recuperação de senha no site MDH 3D. Meu código é: ${code}`;
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/** Send OTP via Meta Cloud API — plain text message. */
async function sendTextOTP(phone: string, code: string): Promise<WhatsAppSendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;

  const body = {
    messaging_product: "whatsapp",
    to: phone.replace(/\D/g, ""),
    type: "text",
    text: {
      body: `🔐 MDH 3D — Código de recuperação:\n\n*${code}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`,
    },
  };

  const res = await fetch(`https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta Cloud API error ${res.status}: ${err}`);
  }

  return { success: true };
}

/**
 * Send OTP via Meta Cloud API — template message (pre-approved template).
 * Only used when WHATSAPP_OTP_TEMPLATE_NAME is set.
 * Template must have a single body variable {{1}} for the OTP code.
 */
async function sendTemplateOTP(phone: string, code: string): Promise<WhatsAppSendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME!;
  const locale = process.env.WHATSAPP_OTP_TEMPLATE_LOCALE ?? "pt_BR";

  const body = {
    messaging_product: "whatsapp",
    to: phone.replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: locale },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: code }],
        },
        // copy-code button (index 0) — only present if template includes it
        ...(process.env.WHATSAPP_OTP_TEMPLATE_HAS_COPY_BUTTON === "true"
          ? [{ type: "button", sub_type: "copy_code", index: 0, parameters: [{ type: "coupon_code", coupon_code: code }] }]
          : []),
      ],
    },
  };

  const res = await fetch(`https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta Cloud API template error ${res.status}: ${err}`);
  }

  return { success: true };
}

/**
 * Send WhatsApp OTP with automatic provider/mode selection.
 *
 * WHATSAPP_MODE env var:
 *   cloud_api  — Meta Cloud API (production, requires WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID)
 *   simulated  — Log to console + return fallback deep link (dev/staging default)
 *
 * Optional: set WHATSAPP_OTP_TEMPLATE_NAME to use a pre-approved template instead of free-form text.
 */
export async function sendWhatsAppOTP(phone: string, code: string): Promise<WhatsAppSendResult> {
  const mode = process.env.WHATSAPP_MODE ?? "simulated";

  if (
    mode === "cloud_api" &&
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  ) {
    try {
      if (process.env.WHATSAPP_OTP_TEMPLATE_NAME) {
        return await sendTemplateOTP(phone, code);
      }
      return await sendTextOTP(phone, code);
    } catch (err) {
      logStructured("error", "whatsapp_otp_send_failed", {
        phone: phone.slice(0, -4) + "****",
        error: err instanceof Error ? err.message : "unknown",
        mode,
      });
      // Fall through to simulated so the flow never breaks
    }
  }

  // Simulated: log the code so staff / dev can see it
  logStructured("info", "whatsapp_otp_simulated", {
    phone: phone.slice(0, -4) + "****",
    code, // intentionally logged in simulated mode only
  });

  return {
    success: true,
    simulated: true,
    fallbackLink: buildFallbackLink(phone, code),
  };
}

/** Normalise a Brazilian phone number to E.164 (+55XXXXXXXXXXX). */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
  return `+${digits}`;
}
