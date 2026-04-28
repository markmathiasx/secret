import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  buildCommerceFallbackReply,
  commerceAssistantTools,
  createCommerceAssistantInstructions,
  executeCommerceTool,
  type AssistantChatMessage,
} from "@/lib/commerce-assistant";
import { whatsappNumber } from "@/lib/constants";
import {
  getAiAssistantModel,
  getAiAssistantProvider,
  getGroqApiKey,
  getOllamaBaseUrl,
  getOpenAiApiKey,
  isAiAssistantConfigured,
} from "@/lib/env";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { recordOperationalAlert } from "@/lib/operational-alerts";
import { normalizeMetaChannel } from "@/lib/meta/types";
import { logStructured } from "@/lib/logger";
import { storeReplyMessage } from "@/lib/meta/normalizers";

export const runtime = "nodejs";

type AssistantChatPayload = {
  messages?: AssistantChatMessage[];
  previousResponseId?: string | null;
  threadId?: string | null;
  channel?: string | null;
  productId?: string | null;
  visitorId?: string | null;
  source?: "assistant_dialog" | "live_chat" | null;
};

type ProviderConfig = {
  provider: "openai" | "groq" | "ollama";
  model: string;
  apiKey: string;
  baseURL?: string;
  supportsStatefulResponses: boolean;
  supportsStore: boolean;
  supportsReasoningField: boolean;
};

function sanitizeMessages(messages: AssistantChatPayload["messages"]) {
  return (messages || [])
    .filter((message): message is AssistantChatMessage => {
      if (!message) return false;
      if (message.role !== "user" && message.role !== "assistant") return false;
      return typeof message.content === "string" && message.content.trim().length > 0;
    })
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}

function toResponseInput(messages: AssistantChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: [
      {
        type: "input_text" as const,
        text: message.content,
      },
    ],
  }));
}

function getAssistantText(response: any) {
  const outputText = response?.output_text?.trim();
  if (outputText) return outputText;

  const message = response?.output?.find((item: any) => item?.type === "message");
  const content = message?.content?.find((item: any) => item?.type === "output_text");
  return content?.text?.trim() || "";
}

function getToolCalls(response: any) {
  return (response?.output || []).filter((item: any) => item?.type === "function_call");
}

function getProviderConfig(): ProviderConfig | null {
  const provider = getAiAssistantProvider();
  const model = getAiAssistantModel();

  switch (provider) {
    case "openai":
      return {
        provider,
        model,
        apiKey: getOpenAiApiKey(),
        supportsStatefulResponses: true,
        supportsStore: true,
        supportsReasoningField: true,
      };
    case "groq":
      return {
        provider,
        model,
        apiKey: getGroqApiKey(),
        baseURL: "https://api.groq.com/openai/v1",
        supportsStatefulResponses: false,
        supportsStore: false,
        supportsReasoningField: false,
      };
    case "ollama":
      return {
        provider,
        model,
        apiKey: "ollama",
        baseURL: `${getOllamaBaseUrl()}/v1`,
        supportsStatefulResponses: false,
        supportsStore: false,
        supportsReasoningField: false,
      };
    default:
      return null;
  }
}

function asksForHuman(text: string) {
  return /(humano|atendente|pessoa|falar com algu[eé]m|suporte humano)/i.test(text);
}

function normalizeVisitorId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "assistant";
}

async function ensureAssistantDialogThread(payload: AssistantChatPayload, latestText: string) {
  if (payload.source !== "assistant_dialog") return payload.threadId?.trim() || null;
  if (!(await canConnectToDatabase())) return payload.threadId?.trim() || null;

  const existingThreadId = payload.threadId?.trim();
  const channel = normalizeMetaChannel(payload.channel);
  const needsHuman = asksForHuman(latestText);

  if (existingThreadId) {
    const existingThread = await prisma.chatThread.findUnique({
      where: { id: existingThreadId },
      select: { buyerId: true, buyer: { select: { email: true } } },
    });
    if (!existingThread?.buyerId || !existingThread.buyer?.email?.endsWith("@guest.mdh.local")) {
      return null;
    }

    await prisma.chatThread.update({
      where: { id: existingThreadId },
      data: {
        channel,
        lastMessageAt: new Date(),
        unread: true,
        ...(needsHuman ? { status: "needs_human" } : { status: "open" }),
        ...(payload.productId ? { productId: payload.productId } : {}),
      },
    }).catch(() => null);

    await prisma.chatMessage.create({
      data: {
        threadId: existingThreadId,
        senderId: existingThread.buyerId,
        body: latestText,
        attachments: { source: "assistant_dialog" },
      },
    }).catch(() => null);
    return existingThreadId;
  }

  const visitorId = normalizeVisitorId(payload.visitorId || `assistant-${crypto.randomUUID()}`);
  const email = `${visitorId}@guest.mdh.local`;
  const visitor = await prisma.user.upsert({
    where: { email },
    update: { name: `Visitante ${visitorId.slice(0, 8).toUpperCase()}`, isActive: true },
    create: {
      email,
      name: `Visitante ${visitorId.slice(0, 8).toUpperCase()}`,
      role: "BUYER",
      isActive: true,
    },
    select: { id: true },
  });

  const thread = await prisma.chatThread.create({
    data: {
      buyerId: visitor.id,
      type: "SUPPORT",
      channel,
      status: needsHuman ? "needs_human" : "open",
      unread: true,
      subject: "Consultor MDH no site",
      lastMessageAt: new Date(),
      ...(payload.productId ? { productId: payload.productId } : {}),
    },
    select: { id: true },
  });

  await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      senderId: visitor.id,
      body: latestText,
      attachments: { source: "assistant_dialog" },
    },
  });

  await recordOperationalAlert({
    type: needsHuman ? "handoff_requested" : "new_site_lead",
    title: needsHuman ? "Consultor MDH pediu atendimento humano" : "Novo lead pelo consultor MDH",
    body: "Conversa persistida no inbox omnichannel.",
    channel,
    threadId: thread.id,
    severity: needsHuman ? "critical" : "info",
    dedupeKey: `${needsHuman ? "assistant_handoff" : "assistant_lead"}:${thread.id}`,
    metadata: { productId: payload.productId ?? undefined },
  });

  return thread.id;
}

async function markAssistantHandoff(payload: AssistantChatPayload, latestText: string) {
  const threadId = payload.threadId?.trim();
  if (!threadId || !asksForHuman(latestText)) return;
  if (!(await canConnectToDatabase())) return;

  const channel = normalizeMetaChannel(payload.channel);
  try {
    const existingThread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { buyer: { select: { email: true } } },
    });
    if (!existingThread?.buyer?.email?.endsWith("@guest.mdh.local")) return;

    const thread = await prisma.chatThread.update({
      where: { id: threadId },
      data: {
        status: "needs_human",
        unread: true,
        channel,
        ...(payload.productId ? { productId: payload.productId } : {}),
      },
      select: { id: true, subject: true },
    });

    await recordOperationalAlert({
      type: "handoff_requested",
      title: "Consultor MDH pediu atendimento humano",
      body: thread.subject || "Conversa marcada para atendimento humano.",
      channel,
      threadId: thread.id,
      severity: "critical",
      dedupeKey: `assistant_handoff:${thread.id}`,
      metadata: { productId: payload.productId ?? undefined },
    });
  } catch (error) {
    logStructured("warn", "assistant_handoff_mark_failed", {
      threadId,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

async function persistAssistantReply(threadId: string | null, payload: AssistantChatPayload, message: string) {
  if (!threadId || payload.source !== "assistant_dialog") return;
  if (!(await canConnectToDatabase())) return;
  try {
    await storeReplyMessage(threadId, message);
  } catch (error) {
    logStructured("warn", "assistant_reply_persist_failed", {
      threadId,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

function buildResponseRequest(config: ProviderConfig, input: any, previousResponseId?: string | null, now?: Date) {
  return {
    model: config.model,
    instructions: createCommerceAssistantInstructions("site", now),
    input,
    tools: [...commerceAssistantTools],
    parallel_tool_calls: true,
    max_output_tokens: 700,
    ...(config.supportsStatefulResponses && previousResponseId ? { previous_response_id: previousResponseId } : {}),
    ...(config.supportsStore ? { store: false } : {}),
    ...(config.supportsReasoningField ? { reasoning: { effort: "low" as const } } : {}),
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`assistant_chat:${ip}`, 14, 60_000);

  if (!rateLimit.ok) {
    const response = applyNoStoreHeaders(
      NextResponse.json(
        {
          ok: false,
          error: "Muitas mensagens em sequência. Aguarde um pouco antes de continuar.",
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      )
    );
    response.headers.set("Retry-After", String(rateLimit.retryAfter));
    return response;
  }

  const payload = ((await request.json().catch(() => ({}))) || {}) as AssistantChatPayload;
  const messages = sanitizeMessages(payload.messages);
  const previousResponseId = payload.previousResponseId?.trim() || null;
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const requestTime = new Date();

  if (!latestUserMessage) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Envie uma mensagem para continuar." }, { status: 400 })
    );
  }

  let persistedThreadId: string | null = null;
  try {
    persistedThreadId = await ensureAssistantDialogThread(payload, latestUserMessage.content);
    await markAssistantHandoff({ ...payload, threadId: persistedThreadId ?? payload.threadId }, latestUserMessage.content);
  } catch (error) {
    logStructured("warn", "assistant_thread_persist_failed", {
      source: payload.source,
      channel: payload.channel,
      message: error instanceof Error ? error.message : "unknown",
    });
  }

  const providerConfig = getProviderConfig();
  if (!providerConfig || !isAiAssistantConfigured()) {
    const fallbackMessage = buildCommerceFallbackReply(latestUserMessage.content);
    await persistAssistantReply(persistedThreadId, payload, fallbackMessage);
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: false,
        source: "fallback",
        provider: "fallback",
        model: getAiAssistantModel(),
        responseId: null,
        threadId: persistedThreadId,
        message: fallbackMessage,
      })
    );
  }

  try {
    const client = new OpenAI({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.baseURL,
    });

    const initialInput =
      providerConfig.supportsStatefulResponses && previousResponseId
        ? toResponseInput([latestUserMessage])
        : toResponseInput(messages);

    let response = await client.responses.create(
      buildResponseRequest(providerConfig, initialInput, previousResponseId, requestTime)
    );

    for (let safety = 0; safety < 4; safety += 1) {
      const toolCalls = getToolCalls(response);
      if (!toolCalls.length) break;

      const outputs = await Promise.all(
        toolCalls.map(async (call: any) => {
          const args = JSON.parse(call.arguments || "{}");
          const output = await executeCommerceTool(call.name, args);
          return {
            type: "function_call_output" as const,
            call_id: call.call_id,
            output: JSON.stringify(output),
          };
        })
      );

      response = await client.responses.create(
        buildResponseRequest(
          providerConfig,
          outputs,
          providerConfig.supportsStatefulResponses ? response.id : null,
          requestTime
        )
      );
    }

    const message = getAssistantText(response) || buildCommerceFallbackReply(latestUserMessage.content);
    await persistAssistantReply(persistedThreadId, payload, message);

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: true,
        source: "ai",
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseId: providerConfig.supportsStatefulResponses ? response.id || null : null,
        threadId: persistedThreadId,
        message,
      })
    );
  } catch (error: any) {
    const status = Number(error?.status || error?.cause?.status || 0);
    const rateLimited = status === 429;
    const fallbackMessage = rateLimited
      ? `O consultor automático atingiu o limite atual do provedor. Posso continuar em modo guiado ou você pode fechar pelo WhatsApp: https://wa.me/${whatsappNumber}`
      : buildCommerceFallbackReply(latestUserMessage.content);
    await persistAssistantReply(persistedThreadId, payload, fallbackMessage);

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: false,
        source: "fallback",
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseId: null,
        threadId: persistedThreadId,
        message: fallbackMessage,
      })
    );
  }
}
