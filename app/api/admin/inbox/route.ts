import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { sendChatMessage } from "@/lib/live-chat-service";
import {
  sendWhatsAppText,
  sendFbPageReply,
  sendInstagramDmReply,
} from "@/lib/meta/graph-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Derive the channel from either the explicit DB field or the legacy email prefix heuristic. */
function resolveChannel(
  channel: string | null,
  email: string | null | undefined
): string {
  if (channel && channel !== "site") return channel;
  if (email?.endsWith("@mdh.local")) {
    if (email.startsWith("wa-")) return "whatsapp";
    if (email.startsWith("fb-")) return "facebook_page";
    if (email.startsWith("igc-")) return "instagram_comment";
    if (email.startsWith("ig-")) return "instagram_dm";
  }
  return channel ?? "site";
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

    const ch = resolveChannel(
      (thread as { channel?: string | null }).channel ?? null,
      thread.buyer?.email
    );
    return NextResponse.json({ thread: { ...thread, channel: ch } });
  }

  const threads = await prisma.chatThread.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 50,
    include: {
      buyer: true,
      seller: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({
    threads: threads.map((thread) => {
      const ch = resolveChannel(
        (thread as { channel?: string | null }).channel ?? null,
        thread.buyer?.email
      );
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
    data: { sellerId: user.id, lastMessageAt: new Date() },
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
      select: { channel: true, buyer: { select: { email: true, phone: true } } },
    });
    const buyer = threadData?.buyer;
    const channel = resolveChannel(
      (threadData as { channel?: string | null } | null)?.channel ?? null,
      buyer?.email
    );

    if (channel === "whatsapp" && buyer?.phone) {
      const r = await sendWhatsAppText(buyer.phone, message);
      if (!r.ok) console.warn("[admin-inbox] WA reply failed:", r.error);
    } else if (channel === "facebook_page" && buyer?.email?.startsWith("fb-")) {
      const psid = buyer.email.replace("fb-", "").replace("@mdh.local", "");
      const r = await sendFbPageReply(psid, message);
      if (!r.ok) console.warn("[admin-inbox] FB reply failed:", r.error);
    } else if (
      (channel === "instagram_dm" || channel === "instagram_comment") &&
      buyer?.email?.startsWith("ig")
    ) {
      const igsid = buyer.email.replace(/^igc?-/, "").replace("@mdh.local", "");
      const r = await sendInstagramDmReply(igsid, message);
      if (!r.ok) console.warn("[admin-inbox] IG reply failed:", r.error);
    }
  } catch (bridgeErr) {
    console.error("[admin-inbox] channel bridge error:", bridgeErr);
  }

  return NextResponse.json({ ok: true, message: reply });
}
