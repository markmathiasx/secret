import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/marketplace-auth";
import { getClientIp } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { logStructured } from "@/lib/logger";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`pw-reset-request:${ip}`, 3, 60 * 60 * 1000);
  if (!rateLimit.ok) {
    // Always return success to prevent email enumeration
    return applyNoStoreHeaders(NextResponse.json({ ok: true }));
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 400 }));
  }

  await requestPasswordReset(parsed.data.email, {
    source: "customer",
    requestedByIp: ip,
    requestedByUserAgent: request.headers.get("user-agent"),
    requestId: request.headers.get("x-request-id"),
  });

  logStructured("info", "password_reset_request_api_ok", {
    requestId: request.headers.get("x-request-id") || null,
    ip,
  });

  return applyNoStoreHeaders(NextResponse.json({ ok: true }));
}
