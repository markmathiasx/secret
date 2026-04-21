import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { sendChatMessage } from "@/lib/live-chat-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    threads: threads.map((thread) => ({
      id: thread.id,
      subject: thread.subject || "Atendimento comercial",
      buyerName: thread.buyer?.name || thread.buyer?.email || "Visitante",
      buyerEmail: thread.buyer?.email || "",
      sellerName: thread.seller?.name || "",
      lastMessageAt: thread.lastMessageAt || thread.updatedAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      lastMessage: thread.messages[0]
        ? {
            id: thread.messages[0].id,
            body: thread.messages[0].body,
            createdAt: thread.messages[0].createdAt,
            senderId: thread.messages[0].senderId,
          }
        : null,
    })),
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

  return NextResponse.json({ ok: true, message: reply });
}
