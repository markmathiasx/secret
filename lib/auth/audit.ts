import "server-only";
import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { logStructured } from "@/lib/logger";

function hashNullable(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return null;
  return createHash("sha256").update(normalized).digest("hex");
}

export async function recordAuthAudit(input: {
  actorUserId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const payload = {
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    ipHash: hashNullable(input.ip),
    userAgentHash: hashNullable(input.userAgent),
    metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
  };

  if (await canConnectToDatabase()) {
    try {
      await prisma.auditLog.create({ data: payload });
      return;
    } catch (error) {
      logStructured("error", "auth_audit_db_failed", {
        action: input.action,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  logStructured("info", "auth_audit_event", {
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
  });
}
