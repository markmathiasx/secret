import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { sendChatMessage } from "@/lib/live-chat-service";
import {
  sendWhatsAppText,
  sendFbPageReply,
  sendInstagramDmReply,
  replyToInstagramComment,
} from "@/lib/meta/graph-api";
import { normalizeMetaChannel, type MetaChannel } from "@/lib/meta/types";
import { logStructured } from "@/lib/logger";
import { recordOperationalAlert } from "@/lib/operational-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Derive the channel from either the explicit DB field or the legacy email prefix heuristic. */
function resolveChannel(
  channel: string | null,
  email: string | null | undefined
): MetaChannel {
  if (channel && channel !== "site") return normalizeMetaChannel(channel);
  if (email?.endsWith("@mdh.local")) {
    if (email.startsWith("wa-")) return "whatsapp";
    if (email.startsWith("fb-")) return "facebook_page";
    if (email.startsWith("igc-")) return "instagram_comments";
    if (email.startsWith("ig-")) return "instagram_dm";
  }
  return normalizeMetaChannel(channel);
}

async function requireAdmin() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("thread_id");

  if (threadId) {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        buyer: true,
        seller: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!thread) return NextResponse.json({ thread: null });

    const ch = resolveChannel(thread.channel ?? null, thread.buyer?.email);
    // Mark as read when agent opens the thread
    await prisma.chatThread.update({ where: { id: threadId }, data: { unread: false } }).catch(() => {});
    return NextResponse.json({ thread: { ...thread, channel: ch } });
  }

  const { searchParams: sp } = new URL(request.url);
  const statusFilter = sp.get("status") || "all";
  const channelFilter = sp.get("channel") || "all";

  const whereClause: Record<string, unknown> = {};
  if (statusFilter !== "all") whereClause.status = statusFilter;
  if (channelFilter !== "all") {
    const normalized = normalizeMetaChannel(channelFilter);
    whereClause.channel = normalized === "instagram_comments"
      ? { in: ["instagram_comments", "instagram_comment"] }
      : normalized;
  }

  const threads = await prisma.chatThread.findMany({
    where: whereClause,
    orderBy: [{ unread: "desc" }, { lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
    include: {
      buyer: true,
      seller: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const slaCutoff = Date.now() - 30 * 60 * 1000;
  await Promise.allSettled(
    threads
      .filter((thread) => {
        const lastAt = (thread.lastMessageAt || thread.updatedAt).getTime();
        return thread.unread && thread.status !== "archived" && thread.status !== "resolved" && lastAt < slaCutoff;
      })
      .slice(0, 10)
      .map((thread) =>
        recordOperationalAlert({
          type: "thread_sla_risk",
          title: "Conversa sem resposta há mais de 30 min",
          body: thread.subject || "Thread aguardando atendimento no inbox.",
          channel: resolveChannel(thread.channel ?? null, thread.buyer?.email),
          threadId: thread.id,
          severity: "warning",
          dedupeKey: `sla_30m:${thread.id}`,
        })
      )
  );

  return NextResponse.json({
    threads: threads.map((thread) => {
      const ch = resolveChannel(thread.channel ?? null, thread.buyer?.email);
      return {
        id: thread.id,
        subject: thread.subject || "Atendimento comercial",
        buyerName: thread.buyer?.name || thread.buyer?.email || "Visitante",
        buyerEmail: thread.buyer?.email || "",
        sellerName: thread.seller?.name || "",
        lastMessageAt: thread.lastMessageAt || thread.updatedAt,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        channel: ch,
        status: thread.status ?? "open",
        tags: thread.tags ?? [],
        notes: thread.notes ?? null,
        unread: thread.unread ?? true,
        isWhatsApp: ch === "whatsapp",
        type: thread.type,
        lastMessage: thread.messages[0]
          ? {
              id: thread.messages[0].id,
              body: thread.messages[0].body,
              createdAt: thread.messages[0].createdAt,
              senderId: thread.messages[0].senderId,
            }
          : null,
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const threadId = String(body.threadId || "").trim();
  const message = String(body.message || "").trim();

  if (!threadId || !message) {
    return NextResponse.json({ error: "threadId and message are required" }, { status: 400 });
  }

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { sellerId: user.id, lastMessageAt: new Date(), unread: false },
  });

  const reply = await sendChatMessage({
    thread_id: threadId,
    sender_id: user.id,
    sender_type: "support_agent",
    message,
  });

  // Bridge reply back to the originating channel
  try {
    const threadData = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: {
        channel: true,
        buyerId: true,
        buyer: { select: { email: true, phone: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { senderId: true, attachments: true },
        },
      },
    });
    const buyer = threadData?.buyer;
    const channel = resolveChannel(threadData?.channel ?? null, buyer?.email);

    if (channel === "whatsapp" && buyer?.phone) {
      const r = await sendWhatsAppText(buyer.phone, message);
      if (!r.ok) throw new Error(`whatsapp_send_failed:${r.error?.code ?? r.rawStatus ?? "unknown"}`);
    } else if (channel === "facebook_page" && buyer?.email?.startsWith("fb-")) {
      const psid = buyer.email.replace("fb-", "").replace("@mdh.local", "");
      const r = await sendFbPageReply(psid, message);
      if (!r.ok) throw new Error(`facebook_send_failed:${r.error?.code ?? r.rawStatus ?? "unknown"}`);
    } else if (channel === "instagram_dm" && buyer?.email?.startsWith("ig-")) {
      const igsid = buyer.email.replace(/^igc?-/, "").replace("@mdh.local", "");
      const r = await sendInstagramDmReply(igsid, message);
      if (!r.ok) throw new Error(`instagram_dm_send_failed:${r.error?.code ?? r.rawStatus ?? "unknown"}`);
    } else if (channel === "instagram_comments") {
      const lastExternalComment = threadData?.messages.find((entry) => {
        const attachments = entry.attachments as { externalMessageId?: string; source?: string } | null;
        return Boolean(attachments?.externalMessageId && attachments.source === "instagram_comment");
      })?.attachments as { externalMessageId?: string } | undefined;

      if (!lastExternalComment?.externalMessageId) {
        throw new Error("instagram_comment_id_missing");
      }

      const r = await replyToInstagramComment(lastExternalComment.externalMessageId, message);
      if (!r.ok) throw new Error(`instagram_comment_send_failed:${r.error?.code ?? r.rawStatus ?? "unknown"}`);
    }
  } catch (bridgeErr) {
    logStructured("warn", "admin_inbox_channel_bridge_failed", {
      threadId,
      message: bridgeErr instanceof Error ? bridgeErr.message : "unknown",
    });
    await recordOperationalAlert({
      type: "send_failure",
      title: "Falha ao responder canal externo",
      body: "A resposta foi salva no inbox, mas o envio para o canal externo falhou.",
      threadId,
      severity: "warning",
      dedupeKey: `admin_bridge_failure:${threadId}`,
    });
  }

  return NextResponse.json({ ok: true, message: reply });
}

/**
 * PATCH /api/admin/inbox
 * Supported actions: resolve, archive, reopen, assign, unassign, mark_read, mark_unread, tag, note
 */
export async function PATCH(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const threadId = String(body.threadId || "").trim();
  const action = String(body.action || "").trim();

  if (!threadId || !action) {
    return NextResponse.json({ error: "threadId and action are required" }, { status: 400 });
  }

  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  let updateData: Record<string, unknown> = { updatedAt: new Date() };

  switch (action) {
    case "resolve":
      updateData.status = "resolved";
      updateData.unread = false;
      break;
    case "archive":
      updateData.status = "archived";
      updateData.unread = false;
      break;
    case "reopen":
      updateData.status = "open";
      break;
    case "needs_human":
      updateData.status = "needs_human";
      updateData.unread = true;
      break;
    case "assign":
      updateData.sellerId = user.id;
      updateData.status = "open";
      break;
    case "unassign":
      updateData.sellerId = null;
      break;
    case "mark_read":
      updateData.unread = false;
      break;
    case "mark_unread":
      updateData.unread = true;
      break;
    case "tag": {
      const tagValue = String(body.tag || "").trim().toLowerCase().slice(0, 32);
      if (!tagValue) return NextResponse.json({ error: "tag is required" }, { status: 400 });
      const existing = thread.tags ?? [];
      updateData.tags = existing.includes(tagValue) ? existing : [...existing, tagValue];
      break;
    }
    case "untag": {
      const tagValue = String(body.tag || "").trim().toLowerCase();
      updateData.tags = (thread.tags ?? []).filter((t) => t !== tagValue);
      break;
    }
    case "note": {
      const noteValue = String(body.note ?? "").trim().slice(0, 2000);
      updateData.notes = noteValue || null;
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await prisma.chatThread.update({
    where: { id: threadId },
    data: updateData,
  });

  return NextResponse.json({ ok: true, thread: { id: updated.id, status: updated.status, unread: updated.unread, tags: updated.tags, notes: updated.notes } });
}
