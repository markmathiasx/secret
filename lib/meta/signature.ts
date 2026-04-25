import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { metaConfig } from "./config";

/**
 * Validates the X-Hub-Signature-256 header sent by Meta on all webhook POSTs.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function isValidMetaSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = metaConfig.appSecret;
  if (!secret) {
    // If app secret is not set, reject all signed requests — fail secure.
    return false;
  }
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }
  const received = signatureHeader.slice("sha256=".length);
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (received.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Validates the hub.verify_token sent during webhook subscription handshake.
 */
export function isValidVerifyToken(token: string | null): boolean {
  const expected = metaConfig.verifyToken;
  if (!expected || !token) return false;
  // Simple constant-time string compare
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
