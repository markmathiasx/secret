import "server-only";

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

const ENCRYPTION_VERSION = "enc_v1";

function getProtectionKey() {
  const raw = process.env.FIELD_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET || "";

  if (!raw) {
    throw new Error("FIELD_ENCRYPTION_KEY não configurada.");
  }

  return createHash("sha256").update(raw).digest();
}

export function hashLookupValue(value: string) {
  return createHmac("sha256", getProtectionKey()).update(value).digest("hex");
}

export function hashIpAddress(ipAddress: string | null | undefined) {
  if (!ipAddress) return null;
  return hashLookupValue(ipAddress.trim());
}

export function encryptField(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized) return null;

  if (normalized.startsWith(`${ENCRYPTION_VERSION}:`)) {
    return normalized;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getProtectionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTION_VERSION}:${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptField(value: string | null | undefined) {
  if (!value) return "";
  if (!value.startsWith(`${ENCRYPTION_VERSION}:`)) return value;

  const [, ivEncoded, tagEncoded, payloadEncoded] = value.split(":");
  if (!ivEncoded || !tagEncoded || !payloadEncoded) return "";

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getProtectionKey(),
      Buffer.from(ivEncoded, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payloadEncoded, "base64url")),
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

export function sanitizeTextInput(value: string | null | undefined, maxLength?: number) {
  const normalized = String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return typeof maxLength === "number" ? normalized.slice(0, maxLength) : normalized;
}

export function normalizeEmailAddress(value: string | null | undefined) {
  return sanitizeTextInput(value, 160).toLowerCase();
}

export function normalizePhoneNumber(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
}

export function maskEmail(value: string | null | undefined) {
  const email = normalizeEmailAddress(value);
  if (!email.includes("@")) return "***";

  const [local, domain] = email.split("@");
  const visibleLocal = local.slice(0, 2);
  return `${visibleLocal}${"*".repeat(Math.max(1, local.length - visibleLocal.length))}@${domain}`;
}

export function maskPhone(value: string | null | undefined) {
  const digits = normalizePhoneNumber(value);
  if (!digits) return "***";
  if (digits.length <= 4) return `***${digits}`;
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskAddressLine(value: string | null | undefined) {
  const line = sanitizeTextInput(value);
  if (!line) return "***";
  if (line.length <= 6) return `${line[0]}***`;
  return `${line.slice(0, 3)}***${line.slice(-2)}`;
}

export function maskCardHolderName(value: string | null | undefined) {
  const normalized = sanitizeTextInput(value);
  if (!normalized) return "***";

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part[0]}***`)
    .join(" ");
}

export function maskSensitiveObject(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => maskSensitiveObject(item));
  }

  if (!input || typeof input !== "object") {
    return input;
  }

  const output: Record<string, unknown> = {};
  const entries = Object.entries(input as Record<string, unknown>);

  for (const [key, value] of entries) {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey.includes("password") || normalizedKey.includes("token") || normalizedKey.includes("cookie")) {
      output[key] = "[redacted]";
      continue;
    }

    if (normalizedKey.includes("authorization")) {
      output[key] = "[redacted]";
      continue;
    }

    if (
      normalizedKey.includes("cvv") ||
      normalizedKey.includes("securitycode") ||
      normalizedKey.includes("security_code") ||
      normalizedKey.includes("cardnumber") ||
      normalizedKey.includes("card_number") ||
      normalizedKey.includes("pan")
    ) {
      output[key] = "[redacted-card]";
      continue;
    }

    if (normalizedKey.includes("email")) {
      output[key] = typeof value === "string" ? maskEmail(value) : "[masked-email]";
      continue;
    }

    if (normalizedKey.includes("whatsapp") || normalizedKey.includes("phone") || normalizedKey.includes("telefone")) {
      output[key] = typeof value === "string" ? maskPhone(value) : "[masked-phone]";
      continue;
    }

    if (
      normalizedKey.includes("street") ||
      normalizedKey.includes("address") ||
      normalizedKey.includes("bairro") ||
      normalizedKey.includes("neighborhood") ||
      normalizedKey.includes("city") ||
      normalizedKey.includes("estado") ||
      normalizedKey.includes("state") ||
      normalizedKey.includes("postalcode") ||
      normalizedKey.includes("cep")
    ) {
      output[key] = typeof value === "string" ? maskAddressLine(value) : "[masked-address]";
      continue;
    }

    if (normalizedKey.includes("cardholder")) {
      output[key] = typeof value === "string" ? maskCardHolderName(value) : "[masked-cardholder]";
      continue;
    }

    output[key] = maskSensitiveObject(value);
  }

  return output;
}
