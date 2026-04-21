/**
 * Live Chat & AI Support Service
 *
 * Reuses the existing Prisma chat models and the assistant route so the site,
 * admin inbox and WhatsApp alerts stay on one flow instead of splitting into
 * a second support stack.
 */

import { prisma } from "./prisma";
import { getDatabaseUrl, getSiteUrl } from "./env";
import { whatsappNumber } from "./constants";

export interface ChatMessage {
  id?: string;
  thread_id: string;
  sender_id: string;
  sender_type: "customer" | "support_agent" | "ai";
  message: string;
  attachments?: string[];
  is_ai_generated?: boolean;
  confidence_score?: number;
  created_at?: Date;
}

export interface ChatSession {
  id: string;
  customer_id: string;
  visitor_id?: string;
  subject: string;
  status: "active" | "waiting" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  assigned_agent_id?: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

const AI_BOT_ID = "ai-bot";
const AI_BOT_EMAIL = "ai-bot@mdh.local";
const VISITOR_EMAIL_DOMAIN = "guest.mdh.local";

function normalizeVisitorId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").slice(0, 48) || "visitor";
}

function getSiteSupportUrl(threadId: string) {
  return `${getSiteUrl()}/admin/inbox?thread=${encodeURIComponent(threadId)}`;
}

async function ensureSupportBotUser() {
  return prisma.user.upsert({
    where: { id: AI_BOT_ID },
    update: {
      name: "Assistente MDH",
      role: "ADMIN",
      isActive: true,
      isInternalSeller: true,
    },
    create: {
      id: AI_BOT_ID,
      email: AI_BOT_EMAIL,
      name: "Assistente MDH",
      role: "ADMIN",
      isActive: true,
      isInternalSeller: true,
    },
    select: { id: true },
  });
}

async function ensureVisitorUser(visitorId: string) {
  const normalized = normalizeVisitorId(visitorId);
  const email = `${normalized}@${VISITOR_EMAIL_DOMAIN}`;

  return prisma.user.upsert({
    where: { email },
    update: {
      name: `Visitante ${normalized.slice(0, 8).toUpperCase()}`,
      phone: null,
      role: "BUYER",
      isActive: true,
    },
    create: {
      email,
      name: `Visitante ${normalized.slice(0, 8).toUpperCase()}`,
      role: "BUYER",
      isActive: true,
      phone: null,
    },
    select: { id: true, email: true, name: true },
  });
}

async function notifySupportOnWhatsApp(input: {
  threadId: string;
  customerLabel: string;
  message: string;
}) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken || !whatsappNumber) {
    return { ok: false, reason: "missing_whatsapp_credentials" } as const;
  }

  const payload = [
    "Nova conversa no site MDH 3D",
    `Cliente: ${input.customerLabel}`,
    `Conversa: ${input.threadId}`,
    `Mensagem: ${input.message}`,
    `Inbox: ${getSiteSupportUrl(input.threadId)}`,
  ].join("\n");

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: whatsappNumber.replace(/\D/g, ""),
      type: "text",
      text: { body: payload },
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: await response.text() } as const;
  }

  return { ok: true, data: await response.json() } as const;
}

async function getAssistantReply(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  const response = await fetch(`${getSiteUrl()}/api/assistant/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.message) {
    throw new Error(payload?.error || "assistant_unavailable");
  }

  return String(payload.message);
}

async function createBotMessage(threadId: string, body: string) {
  await ensureSupportBotUser();
  return prisma.chatMessage.create({
    data: {
      threadId,
      senderId: AI_BOT_ID,
      body,
    },
  });
}

async function generateAIResponse(threadId: string, customerMessage: string) {
  const history = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: {
      senderId: true,
      body: true,
    },
    take: 12,
  });

  const messages = history.map((entry) => ({
    role: entry.senderId === AI_BOT_ID ? ("assistant" as const) : ("user" as const),
    content: entry.body,
  }));

  if (messages[messages.length - 1]?.content !== customerMessage) {
    messages.push({ role: "user", content: customerMessage });
  }

  const reply = await getAssistantReply(messages);
  await createBotMessage(threadId, reply);
}

async function syncThreadLastMessage(threadId: string) {
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date() },
  });
}

export async function startChatSession(visitorId: string, subject: string, priority: string = "normal"): Promise<ChatSession> {
  const visitor = await ensureVisitorUser(visitorId);
  const thread = await prisma.chatThread.create({
    data: {
      buyerId: visitor.id,
      type: "SUPPORT",
      subject: subject?.trim() || "Atendimento comercial",
      lastMessageAt: new Date(),
    },
  });

  return {
    id: thread.id,
    customer_id: visitor.id,
    visitor_id: normalizeVisitorId(visitorId),
    subject: thread.subject || "Atendimento comercial",
    status: "active",
    priority: (["low", "normal", "high", "urgent"].includes(priority) ? priority : "normal") as ChatSession["priority"],
    messages: [],
    created_at: thread.createdAt,
    updated_at: thread.updatedAt,
  };
}

export async function sendChatMessage(message: ChatMessage): Promise<ChatMessage> {
  const thread = await prisma.chatThread.findUnique({
    where: { id: message.thread_id },
    select: { id: true, buyerId: true, sellerId: true, subject: true },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  let senderId = message.sender_id.trim();
  if (message.sender_type === "ai") {
    await ensureSupportBotUser();
    senderId = AI_BOT_ID;
  } else if (message.sender_type === "customer") {
    senderId = thread.buyerId || senderId;
  } else if (!senderId) {
    throw new Error("Missing sender id");
  }

  if (!senderId) {
    throw new Error("Missing thread owner");
  }

  const saved = await prisma.chatMessage.create({
    data: {
      threadId: message.thread_id,
      senderId,
      body: message.message,
      attachments: message.attachments ? { attachments: message.attachments } : undefined,
    },
  });

  await syncThreadLastMessage(message.thread_id);

  if (message.sender_type === "customer") {
    const customer = await prisma.user.findUnique({
      where: { id: thread.buyerId || senderId },
      select: { name: true, email: true },
    });

    void notifySupportOnWhatsApp({
      threadId: message.thread_id,
      customerLabel: customer?.name || customer?.email || thread.subject || "Visitante",
      message: message.message,
    }).catch((error) => {
      console.error("WhatsApp support notification failed:", error);
    });

    setTimeout(() => {
      generateAIResponse(message.thread_id, message.message).catch((error) => {
        console.error("AI response error:", error);
      });
    }, 400);
  }

  return {
    id: saved.id,
    thread_id: saved.threadId,
    sender_id: saved.senderId,
    sender_type: message.sender_type,
    message: saved.body,
    attachments: message.attachments,
    created_at: saved.createdAt,
  };
}

export async function getChatSession(threadId: string): Promise<ChatSession | null> {
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

  if (!thread) return null;

  return {
    id: thread.id,
    customer_id: thread.buyerId || "",
    visitor_id: thread.buyer?.email?.endsWith(`@${VISITOR_EMAIL_DOMAIN}`)
      ? thread.buyer.email.slice(0, thread.buyer.email.indexOf("@"))
      : undefined,
    subject: thread.subject || "",
    status: "active",
    priority: "normal",
    assigned_agent_id: thread.sellerId || undefined,
    messages: thread.messages.map((entry) => ({
      id: entry.id,
      thread_id: entry.threadId,
      sender_id: entry.senderId,
      sender_type:
        entry.senderId === AI_BOT_ID
          ? "ai"
          : entry.senderId === thread.buyerId
            ? "customer"
            : "support_agent",
      message: entry.body,
      created_at: entry.createdAt,
    })),
    created_at: thread.createdAt,
    updated_at: thread.updatedAt,
  };
}

export async function getActiveChats(customerId: string): Promise<ChatSession[]> {
  const threads = await prisma.chatThread.findMany({
    where: {
      buyerId: customerId,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return threads.map((thread) => ({
    id: thread.id,
    customer_id: thread.buyerId || "",
    visitor_id: thread.buyerId || undefined,
    subject: thread.subject || "",
    status: "active",
    priority: "normal",
    assigned_agent_id: thread.sellerId || undefined,
    messages: [],
    created_at: thread.createdAt,
    updated_at: thread.updatedAt,
  }));
}

export async function closeChatSession(threadId: string, rating?: number): Promise<void> {
  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      updatedAt: new Date(),
    },
  });

  if (typeof rating === "number" && Number.isFinite(rating)) {
    await createBotMessage(threadId, `Obrigado pelo feedback. Vou registrar sua avaliação como ${rating}/5.`);
  }
}

export async function getChatThreadAccess(threadId: string) {
  return prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      buyerId: true,
    },
  });
}

export async function assignAgentToChat(threadId: string, agentId: string): Promise<void> {
  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      sellerId: agentId,
      updatedAt: new Date(),
    },
  });

  await createBotMessage(threadId, "Atendente humano assumiu esta conversa.");
}

export async function getSuggestedFAQs(query: string): Promise<any[]> {
  return [];
}

export async function getSupportStatus(): Promise<{
  available: boolean;
  average_wait_time: number;
  active_agents: number;
  queue_length: number;
}> {
  if (!getDatabaseUrl()) {
    return {
      available: false,
      average_wait_time: 30,
      active_agents: 0,
      queue_length: 0,
    };
  }

  try {
    const activeChats = await prisma.chatThread.count();
    const activeAgents = await prisma.user.count({
      where: {
        role: { in: ["ADMIN"] },
      },
    });

    return {
      available: activeAgents > 0,
      average_wait_time: activeAgents > 0 ? Math.ceil(activeChats / activeAgents) * 5 : 30,
      active_agents: activeAgents,
      queue_length: activeChats,
    };
  } catch (error) {
    console.error("Support status unavailable:", error);

    return {
      available: false,
      average_wait_time: 30,
      active_agents: 0,
      queue_length: 0,
    };
  }
}

export async function getChatAnalytics(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const chats = await prisma.chatThread.findMany({
    where: { createdAt: { gte: since } },
  });

  const messages = await prisma.chatMessage.findMany({
    where: { createdAt: { gte: since } },
  });

  return {
    total_chats: chats.length,
    closed_chats: 0,
    total_messages: messages.length,
    ai_messages: 0,
    average_resolution_time: 0,
    customer_satisfaction: 0,
  };
}
