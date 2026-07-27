import { createHmac, timingSafeEqual } from "node:crypto";

export function parseMercadoPagoSignature(signature: string) {
  return signature
    .split(",")
    .map((part) => part.trim().split("="))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {});
}

export function getMercadoPagoSignatureTimestamp(signature: string) {
  const parsed = parseMercadoPagoSignature(signature);
  const rawTimestamp = Number(parsed.ts || 0);
  if (!Number.isFinite(rawTimestamp) || rawTimestamp <= 0) {
    return null;
  }

  return rawTimestamp < 10_000_000_000 ? rawTimestamp * 1000 : rawTimestamp;
}

export function isMercadoPagoSignatureFresh(
  signature: string,
  options?: {
    nowMs?: number;
    maxAgeMs?: number;
    maxFutureSkewMs?: number;
  }
) {
  const timestamp = getMercadoPagoSignatureTimestamp(signature);
  if (!timestamp) {
    return false;
  }

  const nowMs = options?.nowMs ?? Date.now();
  const maxAgeMs = options?.maxAgeMs ?? 15 * 60_000;
  const maxFutureSkewMs = options?.maxFutureSkewMs ?? 5 * 60_000;
  const ageMs = nowMs - timestamp;

  if (ageMs < 0) {
    return Math.abs(ageMs) <= maxFutureSkewMs;
  }

  return ageMs <= maxAgeMs;
}

function matchesDigest(candidate: string, expected: string) {
  const left = Buffer.from(candidate, "hex");
  const right = Buffer.from(expected, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyMercadoPagoSignature(input: {
  secret: string;
  signature: string;
  requestId: string;
  dataId: string;
}) {
  const parts = parseMercadoPagoSignature(input.signature);
  const ts = parts.ts || "";
  const expected = parts.v1 || "";
  if (!ts || !expected || !input.dataId) return false;

  const candidates = [
    `id:${input.dataId};request-id:${input.requestId};ts:${ts};`,
    `id:${input.dataId};request-id:${input.requestId};ts:${ts}`,
    `id:${input.dataId};ts:${ts};`,
    `id:${input.dataId};ts:${ts}`,
  ];

  return candidates.some((manifest) => {
    const digest = createHmac("sha256", input.secret).update(manifest).digest("hex");
    return matchesDigest(digest, expected);
  });
}
