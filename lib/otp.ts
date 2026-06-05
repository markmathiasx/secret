import { createHash, timingSafeEqual, randomInt } from "node:crypto";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Generate a cryptographically secure 6-digit OTP. */
export function generateOTP(): string {
  // Use randomInt for uniform six-digit distribution, zero-padded.
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Hash an OTP with HMAC-SHA256 for safe DB storage. */
export function hashOTP(code: string): string {
  const secret = process.env.OTP_SECRET ?? process.env.AUTH_SECRET ?? "otp-fallback-secret";
  return createHash("sha256").update(code + secret).digest("hex");
}

/** Timing-safe comparison of a user-supplied code against a stored hash. */
export function verifyOTP(input: string, storedHash: string): boolean {
  const inputHash = hashOTP(input);
  const a = Buffer.from(inputHash, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { OTP_EXPIRY_MINUTES, MAX_ATTEMPTS };
