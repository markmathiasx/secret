import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logStructured } from "@/lib/logger";
import type { MetaChannel } from "@/lib/meta/types";

export type OperationalAlertType =
  | "new_site_lead"
  | "new_whatsapp_message"
  | "new_meta_message"
  | "webhook_error"
  | "send_failure"
  | "thread_sla_risk"
  | "handoff_requested";

type AlertInput = {
  type: OperationalAlertType;
  title: string;
  body: string;
  channel?: MetaChannel;
  threadId?: string;
  severity?: "info" | "warning" | "critical";
  dedupeKey?: string;
  metadata?: Record<string, unknown>;
};

const SENSITIVE_KEY = /token|secret|authorization|cookie|session|password|senha|cpf|cnpj|phone|telefone|email|address|endereco/i;

function sanitizeMetadata(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeMetadata(item));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[redacted]" : sanitizeMetadata(item),
    ])
  );
}

export async function recordOperationalAlert(input: AlertInput) {
  const dedupeKey = input.dedupeKey ?? `${input.type}:${input.threadId ?? "global"}:${input.channel ?? "site"}`;
  const linkUrl = input.threadId ? `/admin/inbox?thread=${encodeURIComponent(input.threadId)}` : "/admin/inbox";
  const cutoff = new Date(Date.now() - 10 * 60 * 1000);
  const payload = sanitizeMetadata({
    type: input.type,
    severity: input.severity ?? "info",
    channel: input.channel ?? "site",
    threadId: input.threadId,
    dedupeKey,
    ...(input.metadata ?? {}),
  }) as Prisma.InputJsonValue;

  try {
    await prisma.adminActionLog.create({
      data: {
        action: `operational_alert.${input.type}`,
        entityType: input.threadId ? "ChatThread" : "System",
        entityId: input.threadId,
        summary: input.title.slice(0, 240),
        metadata: payload,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
      take: 20,
    });

    await Promise.allSettled(
      admins.map(async (admin) => {
        const recent = await prisma.notification.findFirst({
          where: {
            userId: admin.id,
            title: input.title,
            linkUrl,
            createdAt: { gte: cutoff },
          },
          select: { id: true },
        });
        if (recent) return;

        await prisma.notification.create({
          data: {
            userId: admin.id,
            channel: "IN_APP",
            status: "PENDING",
            title: input.title.slice(0, 140),
            body: input.body.slice(0, 500),
            linkUrl,
            payload,
          },
        });
      })
    );
  } catch (error) {
    logStructured("warn", "operational_alert_record_failed", {
      type: input.type,
      channel: input.channel,
      threadId: input.threadId,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}
