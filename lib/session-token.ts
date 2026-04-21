export type SessionRole = "customer" | "admin";

export type SessionPayload = {
  sub: string;
  email: string;
  displayName: string;
  role: SessionRole;
  iat: number;
  exp: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export const customerSessionCookieName = "mdh_customer";

const invalidSecretFragments = [
  "troque-o-session-secret",
  "mdh_troque_este_token_no_env",
  "gere_uma_chave_aleatoria",
  "cole_o_hash_gerado_aqui",
];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getHmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export function isSessionSecretConfigured(secret: string | null | undefined) {
  const normalized = secret?.trim().toLowerCase() || "";
  if (!normalized) return false;
  return !invalidSecretFragments.some((fragment) => normalized.includes(fragment));
}

export function getCustomerSessionSecret() {
  const candidates = [
    process.env.AUTH_CUSTOMER_SESSION_SECRET,
    process.env.AUTH_SESSION_SECRET,
    process.env.ADMIN_SESSION_SECRET,
    process.env.ADMIN_SESSION_TOKEN,
  ];

  for (const candidate of candidates) {
    if (isSessionSecretConfigured(candidate)) {
      return candidate!.trim();
    }
  }

  return null;
}

export async function createSignedSessionToken(
  payload: Omit<SessionPayload, "iat" | "exp"> & { expiresInSeconds: number },
  secret: string
) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    sub: payload.sub,
    email: payload.email,
    displayName: payload.displayName,
    role: payload.role,
    iat: now,
    exp: now + payload.expiresInSeconds,
    ...(payload.metadata ? { metadata: payload.metadata } : {}),
  };

  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(fullPayload)));
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encodedPayload));

  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySignedSessionToken(token: string, secret: string) {
  if (!token || !secret) return null;

  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;

  try {
    const key = await getHmacKey(secret);
    const isValid = await crypto.subtle.verify("HMAC", key, fromBase64Url(encodedSignature), encoder.encode(encodedPayload));
    if (!isValid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(encodedPayload))) as SessionPayload;
    if (!payload?.sub || !payload?.email || !payload?.role || typeof payload.exp !== "number") {
      return null;
    }

    if (
      payload.metadata !== undefined &&
      (
        payload.metadata === null ||
        typeof payload.metadata !== "object" ||
        Array.isArray(payload.metadata)
      )
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
