import "server-only";

import { getDb, isDatabaseConfigured } from "@/db/client";
import { analyticsEvents } from "@/db/schema";
import { sanitizeAnalyticsPayload, type AnalyticsEventInput } from "@/lib/analytics";

export async function recordAnalyticsEvent(input: AnalyticsEventInput & { ipAddress?: string; userAgent?: string | null }) {
  if (!isDatabaseConfigured()) return false;

  try {
    const db = getDb();
    await db.insert(analyticsEvents).values({
      eventName: input.eventName,
      scope: input.scope || "store",
      path: input.path || null,
      sessionId: input.sessionId || null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      orderId: input.orderId || null,
      productId: input.productId || null,
      customerId: input.customerId || null,
      adminSessionId: input.adminSessionId || null,
      payload: sanitizeAnalyticsPayload(input.payload)
    });

    return true;
  } catch {
    return false;
  }
}
