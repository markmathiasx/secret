import 'server-only';
import { Prisma } from "@prisma/client";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { logStructured } from "@/lib/logger";

export type AdminActionInput = {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordAdminAction(input: AdminActionInput) {
  if (!(await canConnectToDatabase())) {
    return null;
  }

  try {
    const metadata = input.metadata
      ? (JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue)
      : undefined;

    return await prisma.adminActionLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata,
        requestId: input.requestId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    logStructured("error", "admin_action_audit_failed", {
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      requestId: input.requestId ?? null,
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}
