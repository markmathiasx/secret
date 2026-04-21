import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { sendChatMessage } from "@/lib/live-chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WA_API_VERSION = "v23.0";

async function sendWhatsAppText(to: string, body: string): Promise<{ ok: boolean; reason?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    return { ok: false, reason: "missing_whatsapp_credentials" };
  }
  const digits = to.replace(/\D/g, "");
  if (!digits) return { ok: false, reason: "invalid_phone" };

  const res = await fetch(`https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: digits, type: "text", text: { body } }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, reason: JSON.stringify(data) };
  }
  return { ok: true };
}

/** Detect if a thread belongs to a WhatsApp user (created by the webhook) */
function isWhatsAppBuyer(email: string | null | undefined, phone: string | null | undefined) {
  return Boolean(
    email?.endsWith("@mdh.local") &&
      (email.startsWith("wa-") || (phone && phone.replace(/\D/g, "").length >= 11))
  );
}

async function requireAdmin() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("thread_id");

  if (threadId) {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        buyer: true,
        seller: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ thread });
  }

  const threads = await prisma.chatThread.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 50,
    include: {
      buyer: true,
      seller: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    threads: threads.map((thread) => {
      const waDetected = isWhatsAppBuyer(
        thread.buyer?.email,
        (thread.buyer as { phone?: string | null } | null)?.phone
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
        isWhatsApp: waDetected,
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const threadId = String(body.threadId || "").trim();
  const message = String(body.message || "").trim();

  if (!threadId || !message) {
    return NextResponse.json({ error: "threadId and message are required" }, { status: 400 });
  }

  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      sellerId: user.id,
      lastMessageAt: new Date(),
    },
  });

  const reply = await sendChatMessage({
    thread_id: threadId,
    sender_id: user.id,
    sender_type: "support_agent",
    message,
  });

  // If the thread belongs to a WhatsApp user, bridge the reply back via Cloud API
  try {
    const threadData = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { buyer: { select: { email: true, phone: true } } },
    });
    const buyer = threadData?.buyer;
    if (buyer && isWhatsAppBuyer(buyer.email, buyer.phone) && buyer.phone) {
      const waResult = await sendWhatsAppText(buyer.phone, message);
      if (!waResult.ok) {
        console.warn("[admin-inbox] WhatsApp reply failed:", waResult.reason);
      }
    }
  } catch (waErr) {
    console.error("[admin-inbox] WhatsApp bridge error:", waErr);
  }

  return NextResponse.json({ ok: true, message: reply });
}
