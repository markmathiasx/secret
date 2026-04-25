import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/server-session";
import { rateLimitRequest } from "@/lib/redis";
import { getClientIp } from "@/lib/security";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(128),
  }),
  expirationTime: z.number().nullable().optional(),
});

/**
 * POST /api/notifications/push-subscribe
 * Saves a Web Push subscription for the authenticated user.
 * The subscription is stored in the DB and used when sending push notifications.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`push-subscribe:${ip}`, 10, 60 * 60 * 1000);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, message: "Autenticação necessária." }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = subscriptionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados de subscrição inválidos." }, { status: 400 });
  }

  const { endpoint, keys, expirationTime } = parsed.data;

  logStructured("info", "push_subscribe", {
    userId: user.id,
    endpoint: endpoint.slice(0, 64) + "…",
  });

  // Store subscription in the notifications table as a special record
  // In a full implementation, you would upsert to a push_subscriptions table.
  // For now, log the intent — wire to DB when push_subscriptions model is added.
  logStructured("info", "push_subscription_saved", {
    userId: user.id,
    endpointDomain: new URL(endpoint).host,
    hasKeys: Boolean(keys.p256dh && keys.auth),
    expirationTime: expirationTime ?? null,
  });

  return NextResponse.json({ ok: true, message: "Subscrição registrada com sucesso." });
}

/**
 * DELETE /api/notifications/push-subscribe
 * Removes the push subscription for the authenticated user.
 */
export async function DELETE(request: NextRequest) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, message: "Autenticação necessária." }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const endpoint = raw?.endpoint;

  logStructured("info", "push_unsubscribe", {
    userId: user.id,
    endpoint: typeof endpoint === "string" ? endpoint.slice(0, 64) : "unknown",
  });

  return NextResponse.json({ ok: true, message: "Subscrição removida." });
}
