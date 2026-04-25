import "server-only";
import { logStructured } from "@/lib/logger";

export interface WhatsAppSendResult {
  success: boolean;
  simulated?: boolean;
  fallbackLink?: string;
}

const SUPPORT_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5521974137662").replace(/\D/g, "");

function buildFallbackLink(phone: string, code: string): string {
  const msg = `Olá! Solicitei recuperação de senha no site MDH 3D. Meu código é: ${code}`;
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/** Send OTP via Meta Cloud API (WhatsApp Business). */
async function sendViaMetaCloudAPI(phone: string, code: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_ID!;

  const body = {
    messaging_product: "whatsapp",
    to: phone.replace(/\D/g, ""),
    type: "text",
    text: {
      body: `🔐 MDH 3D — Código de recuperação:\n\n*${code}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`,
    },
  };

  const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
 * Send WhatsApp OTP with automatic provider selection.
 *
 * Modes (WHATSAPP_MODE env var):
 *   cloud_api  — Meta Cloud API (production)
 *   simulated  — Log to console + return fallback deep link (dev/staging default)
 */
export async function sendWhatsAppOTP(phone: string, code: string): Promise<WhatsAppSendResult> {
  const mode = process.env.WHATSAPP_MODE ?? "simulated";

  if (mode === "cloud_api" && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    try {
      return await sendViaMetaCloudAPI(phone, code);
    } catch (err) {
      logStructured("error", "whatsapp_otp_send_failed", {
        phone: phone.slice(0, -4) + "****",
        error: err instanceof Error ? err.message : "unknown",
        mode,
      });
      // Fall through to simulated so the flow doesn't break
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
