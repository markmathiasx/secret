import { createSignedSessionToken, getCustomerSessionSecret, verifySignedSessionToken } from "@/lib/session-token";

export const orderAccessCookieName = "mdh_order_access";
export const orderAccessMaxAgeSeconds = 60 * 60 * 24 * 30;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createOrderAccessToken(input: {
  orderCode: string;
  customerEmail: string;
  customerName?: string | null;
}) {
  const secret = getCustomerSessionSecret();
  if (!secret) {
    return null;
  }

  return createSignedSessionToken(
    {
      sub: input.orderCode,
      email: normalizeEmail(input.customerEmail),
      displayName: input.customerName?.trim() || "Pedido MDH",
      role: "customer",
      expiresInSeconds: orderAccessMaxAgeSeconds,
    },
    secret
  );
}

export async function verifyOrderAccessToken(
  token: string,
  input: { orderCode: string; customerEmail: string }
) {
  const secret = getCustomerSessionSecret();
  if (!secret) {
    return false;
  }

  const payload = await verifySignedSessionToken(token, secret);
  if (!payload) {
    return false;
  }

  return payload.sub === input.orderCode && payload.email === normalizeEmail(input.customerEmail);
}
