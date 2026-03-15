import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { analyticsEventNames } from "@/lib/analytics";
import { checkRateLimit, getClientIp } from "@/lib/security";

const analyticsSchema = z.object({
  eventName: z.enum(analyticsEventNames),
  scope: z.enum(["store", "admin"]).default("store"),
  path: z.string().max(255).optional(),
  sessionId: z.string().max(120).optional(),
  orderId: z.string().uuid().optional(),
  productId: z.string().max(64).optional(),
  customerId: z.string().uuid().optional(),
  adminSessionId: z.string().uuid().optional(),
  payload: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`analytics:${ip}`, 120, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "rate_limited" }, { status: 429 });
  }

  const parsed = analyticsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "invalid_payload" }, { status: 400 });
  }

  await recordAnalyticsEvent({
    ...parsed.data,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true });
}
