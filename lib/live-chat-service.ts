/**
 * Live Chat & AI Support Service
 *
 * Reuses the existing Prisma chat models and the assistant route so the site,
 * admin inbox and WhatsApp alerts stay on one flow instead of splitting into
 * a second support stack.
 */

import { prisma } from "./prisma";
import {
  getChatwootBaseUrl,
  getDatabaseUrl,
  getSiteUrl,
  isNativeSiteChatEnabled,
  isChatwootLiveAvailable,
  isChatwootWidgetConfigured,
} from "./env";
import { whatsappNumber } from "./constants";
import { buildCommerceFallbackReply } from "./commerce-assistant";
import { sendWhatsAppText } from "@/lib/meta/graph-api";
import { isWhatsAppOutboundReady } from "@/lib/meta/config";
import { recordOperationalAlert } from "@/lib/operational-alerts";
import { logStructured } from "@/lib/logger";

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
  if (!isWhatsAppOutboundReady() || !whatsappNumber) {
    return { ok: false, reason: "missing_whatsapp_credentials" } as const;
  }

  const payload = [
    "Nova conversa no site MDH 3D",
    `Cliente: ${input.customerLabel}`,
    `Conversa: ${input.threadId}`,
    `Mensagem: ${input.message}`,
    `Inbox: ${getSiteSupportUrl(input.threadId)}`,
  ].join("\n");

  const response = await sendWhatsAppText(whatsappNumber, payload);
  if (!response.ok) return { ok: false, reason: "send_failed" } as const;
  return { ok: true } as const;
}

async function getAssistantReply(threadId: string, messages: Array<{ role: "user" | "assistant"; content: string }>) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";

  try {
    const response = await fetch(`${getSiteUrl()}/api/assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, threadId, channel: "site" }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.message) {
      throw new Error(payload?.error || "assistant_unavailable");
    }

    return String(payload.message);
  } catch (error) {
    logStructured("warn", "assistant_route_unavailable", {
      threadId,
      message: error instanceof Error ? error.message : "unknown",
    });
    return buildCommerceFallbackReply(latestUserMessage);
  }
}

async function createBotMessage(threadId: string, body: string) {
  await ensureSupportBotUser();
  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId: AI_BOT_ID,
      body,
    },
  });
  await syncThreadLastMessage(threadId, { unread: false });
  return message;
}

async function generateAIResponse(threadId: string, customerMessage: string) {
  if (/(humano|atendente|pessoa|falar com algu[eé]m|suporte humano)/i.test(customerMessage)) {
    return;
  }

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

  const reply = await getAssistantReply(threadId, messages);
  await createBotMessage(threadId, reply);
}

async function syncThreadLastMessage(threadId: string, extra: Record<string, unknown> = {}) {
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date(), ...extra },
  });
}

export async function startChatSession(visitorId: string, subject: string, priority: string = "normal"): Promise<ChatSession> {
  const visitor = await ensureVisitorUser(visitorId);
  const thread = await prisma.chatThread.create({
    data: {
      buyerId: visitor.id,
      type: "SUPPORT",
      channel: "site",
      status: "open",
      unread: false,
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
    select: { id: true, buyerId: true, sellerId: true, subject: true, channel: true },
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

  const needsHuman = message.sender_type === "customer" && /(humano|atendente|pessoa|falar com algu[eé]m|suporte humano)/i.test(message.message);
  await syncThreadLastMessage(message.thread_id, {
    channel: thread.channel || "site",
    unread: message.sender_type === "customer",
    ...(message.sender_type === "customer" ? { status: needsHuman ? "needs_human" : "open" } : {}),
  });

  if (message.sender_type === "customer") {
    const customer = await prisma.user.findUnique({
      where: { id: thread.buyerId || senderId },
      select: { name: true, email: true },
    });

    await recordOperationalAlert({
      type: needsHuman ? "handoff_requested" : "new_site_lead",
      title: needsHuman ? "Cliente pediu humano no site" : "Nova mensagem no chat do site",
      body: customer?.name || customer?.email || thread.subject || "Visitante",
      channel: "site",
      threadId: message.thread_id,
      severity: needsHuman ? "critical" : "info",
      dedupeKey: `${needsHuman ? "site_handoff" : "site_message"}:${message.thread_id}:${saved.id}`,
    });

    void notifySupportOnWhatsApp({
      threadId: message.thread_id,
      customerLabel: customer?.name || customer?.email || thread.subject || "Visitante",
      message: message.message,
    }).catch((error) => {
      logStructured("warn", "whatsapp_support_notification_failed", {
        threadId: message.thread_id,
        message: error instanceof Error ? error.message : "unknown",
      });
    });

    if (needsHuman) {
      await createBotMessage(message.thread_id, "Entendi. Marquei esta conversa para atendimento humano no inbox da MDH 3D.");
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

    setTimeout(() => {
      generateAIResponse(message.thread_id, message.message).catch((error) => {
        logStructured("warn", "ai_response_error", {
          threadId: message.thread_id,
          message: error instanceof Error ? error.message : "unknown",
        });
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
      status: "resolved",
      unread: false,
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
      status: "open",
      unread: false,
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
  provider: "chatwoot" | "native" | "whatsapp";
  launchMode: "chatwoot" | "native" | "whatsapp";
  label: string;
  handoffUrl: string;
}> {
  if (isChatwootWidgetConfigured()) {
    const liveAvailable = isChatwootLiveAvailable();
    return {
      available: liveAvailable,
      average_wait_time: liveAvailable ? 5 : 15,
      active_agents: liveAvailable ? 1 : 0,
      queue_length: 0,
      provider: "chatwoot",
      launchMode: "chatwoot",
      label: liveAvailable
        ? "Atendimento ao vivo no widget"
        : "Inbox comercial no widget",
      handoffUrl: getChatwootBaseUrl() || `https://wa.me/${whatsappNumber}`,
    };
  }

  if (!isNativeSiteChatEnabled() || !getDatabaseUrl()) {
    return {
      available: false,
      average_wait_time: 30,
      active_agents: 0,
      queue_length: 0,
      provider: "whatsapp",
      launchMode: "whatsapp",
      label: "Atendimento humano no WhatsApp",
      handoffUrl: `https://wa.me/${whatsappNumber}`,
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
      provider: "native",
      launchMode: "native",
      label: activeAgents > 0 ? "Equipe no chat do site" : "Pré-atendimento no site",
      handoffUrl: `https://wa.me/${whatsappNumber}`,
    };
  } catch (error) {
    console.error("Support status unavailable:", error);

    return {
      available: false,
      average_wait_time: 30,
      active_agents: 0,
      queue_length: 0,
      provider: "whatsapp",
      launchMode: "whatsapp",
      label: "Atendimento humano no WhatsApp",
      handoffUrl: `https://wa.me/${whatsappNumber}`,
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
