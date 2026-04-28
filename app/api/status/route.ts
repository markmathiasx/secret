import { NextResponse } from "next/server";
import { canConnectToDatabase, getDatabaseConfigurationStatus } from "@/lib/prisma";
import { getMercadoPagoAccessToken, getMercadoPagoPublicKey, getMercadoPagoWebhookSecret } from "@/lib/env";
import { isRedisConfigured } from "@/lib/redis";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<{ ok: boolean; latencyMs?: number; reason?: string; message?: string }> {
  const start = Date.now();
  const status = getDatabaseConfigurationStatus();
  if (!status.ok) {
    return { ok: false, latencyMs: Date.now() - start, reason: status.reason, message: status.message };
  }

  try {
    const ok = await canConnectToDatabase();
    return { ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false };
  }
}

function checkPayments() {
  const hasAccessToken = Boolean(getMercadoPagoAccessToken());
  const hasPublicKey = Boolean(getMercadoPagoPublicKey());
  const hasWebhookSecret = Boolean(getMercadoPagoWebhookSecret());
  return {
    ok: hasAccessToken,
    accessToken: hasAccessToken,
    publicKey: hasPublicKey,
    webhookSecret: hasWebhookSecret,
    warning: !hasWebhookSecret ? "MERCADOPAGO_WEBHOOK_SECRET not set. Mercado Pago webhook route will return 503." : undefined,
  };
}

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const start = Date.now();

  const [db, payments] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkPayments()),
  ]);

  const redis = { ok: isRedisConfigured(), configured: isRedisConfigured() };
  const sentry = { configured: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) };
  const allOk = db.ok;

  const body = {
    ok: allOk,
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    services: {
      database: db,
      payments,
      redis,
      sentry,
    },
    build: {
      id: process.env.BUILD_ID || "development",
      time: process.env.BUILD_TIME || null,
      env: process.env.NODE_ENV,
    },
  };

  logStructured("info", "status_check", { ok: allOk, latencyMs: body.latencyMs });

  const response = NextResponse.json(body, { status: allOk ? 200 : 503 });
  response.headers.set("x-request-id", requestId);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
