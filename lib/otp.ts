import { createHmac, timingSafeEqual, randomInt } from "node:crypto";

import { requireSigningSecret } from "./security/secret-policy";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Generate a cryptographically secure 6-digit OTP. */
export function generateOTP(): string {
  // Use randomInt for uniform six-digit distribution, zero-padded.
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** HMAC-SHA256 storage. Existing legacy hashes cannot verify; request a fresh OTP (10-minute expiry). */
export function hashOTP(code: string): string {
  if (!/^\d{6}$/.test(code)) throw new Error("OTP must contain exactly six digits.");
  const secret = requireSigningSecret([process.env.OTP_SECRET, process.env.AUTH_SECRET]);
  return createHmac("sha256", secret).update(code).digest("hex");
}

/** Timing-safe comparison of a user-supplied code against a stored hash. */
export function verifyOTP(input: string, storedHash: string): boolean {
  if (!/^\d{6}$/.test(input) || !/^[a-f0-9]{64}$/i.test(storedHash)) return false;
  const inputHash = hashOTP(input);
  const a = Buffer.from(inputHash, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { OTP_EXPIRY_MINUTES, MAX_ATTEMPTS };
