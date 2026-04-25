import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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

  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
  });

  logStructured("info", "push_subscribe", {
    userId: user.id,
    endpointDomain: new URL(endpoint).host,
  });

  return NextResponse.json({ ok: true, message: "Subscrição registrada com sucesso." });
}

export async function DELETE(request: NextRequest) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, message: "Autenticação necessária." }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const endpoint = typeof raw?.endpoint === "string" ? raw.endpoint : null;

  if (endpoint) {
    await prisma.pushSubscription
      .deleteMany({ where: { userId: user.id, endpoint } })
      .catch(() => {});
  } else {
    // Remove all subscriptions for the user
    await prisma.pushSubscription.deleteMany({ where: { userId: user.id } }).catch(() => {});
  }

  logStructured("info", "push_unsubscribe", { userId: user.id });

  return NextResponse.json({ ok: true, message: "Subscrição removida." });
}
