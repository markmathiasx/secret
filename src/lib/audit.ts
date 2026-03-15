import "server-only";

import { getDb, isDatabaseConfigured } from "@/db/client";
import { auditLogs } from "@/db/schema";
import { hashIpAddress, maskSensitiveObject } from "@/lib/data-protection";

type AuditInput = {
  actorType: "admin" | "customer" | "system" | "anonymous";
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  payload?: Record<string, unknown>;
};

export async function appendAuditLog(input: AuditInput) {
  if (!isDatabaseConfigured()) {
    return;
  }

  const db = getDb();
  await db.insert(auditLogs).values({
    actorType: input.actorType,
    actorId: input.actorId || null,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId || null,
    ipAddressHash: hashIpAddress(input.ipAddress),
    userAgent: input.userAgent || null,
    payload: (maskSensitiveObject(input.payload || {}) as Record<string, unknown>) || {}
  });
}
