import { NextRequest, NextResponse } from "next/server";
import { catalog, getProductUrl } from "@/lib/catalog";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { getSiteUrl } from "@/lib/env";
import { isMetaVerifyTokenConfigured, isWhatsAppOutboundReady } from "@/lib/meta/config";
import { sendWhatsAppText, markWaMessageRead } from "@/lib/meta/graph-api";
import { isValidMetaSignature, isValidVerifyToken } from "@/lib/meta/signature";
import { ensureChannelThread, ensureChannelUser, loadThreadHistory, storeInboundMessage, storeReplyMessage } from "@/lib/meta/normalizers";
import type { WaMessage, WaStatus, WaWebhookPayload } from "@/lib/meta/types";
import { recordOperationalAlert } from "@/lib/operational-alerts";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { formatCurrency } from "@/lib/utils";
import { whatsappNumber } from "@/lib/constants";
import { getStaffNotifyEmail } from "@/lib/server-config";
import { prisma } from "@/lib/prisma";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Session = { distanceKm?: number; lastProductId?: string; wantsHuman?: boolean };

const sessionsCache = new Map<string, Session>();
const AI_BOT_ID = "ai-bot";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!isMetaVerifyTokenConfigured()) {
    return NextResponse.json(
      { ok: false, error: "WHATSAPP_VERIFY_TOKEN ou META_VERIFY_TOKEN não configurado." },
      { status: 503 }
    );
  }

  if (mode === "subscribe" && isValidVerifyToken(token) && challenge) {
    logStructured("info", "whatsapp_webhook_verified", {});
    return new Response(challenge, { status: 200 });
  }

  logStructured("warn", "whatsapp_webhook_verify_failed", { mode, hasToken: !!token });
  return NextResponse.json({ ok: false }, { status: 403 });
}

function scoreItem(item: any, tokens: string[]) {
  const blob = [item.name, item.category, item.theme, item.description, item.collection, ...(item.tags || [])]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (item.name.toLowerCase().includes(token)) score += 5;
    if (item.theme.toLowerCase().includes(token)) score += 4;
    if (blob.includes(token)) score += 1;
  }
  return score;
}

function findBestProduct(query: string) {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;
  const tokens = normalized.split(/\s+/).filter(Boolean);
  let best: { item: any; score: number } | null = null;

  for (const item of catalog) {
    const score = scoreItem(item, tokens);
    if (!best || score > best.score) best = { item, score };
  }

  if (!best || best.score <= 0) return null;
  return best.item;
}

function parseDistanceKm(text: string) {
  const match = text.toLowerCase().replaceAll(",", ".").match(/(\d+(?:\.\d+)?)\s*(?:km)?/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0 || value > 300) return null;
  return value;
}

function wantsHuman(text: string) {
  return /(humano|atendente|pessoa|falar com algu[eé]m|suporte humano)/i.test(text);
}

function menuText() {
  return [
    "MDH 3D | Atendimento automático",
    "Me envie o nome do item que você quer, por exemplo:",
    "- dichavador hello kitty",
    "- suporte controle ps5",
    "- vaso geométrico",
    "- chaveiro personalizado",
    "",
    "Se quiser, envie também a distância em km pelo Google Maps.",
    "Para falar com humano, escreva HUMANO.",
  ].join("\n");
}

function normalizeQuery(text: string) {
  return text
    .toLowerCase()
    .replace(/[!?.,;:]/g, " ")
    .replace(/\b(quero|uma|um|impressao|impressão|3d|por favor|pfv)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMessageText(message: WaMessage) {
  if (message.text?.body) return message.text.body.trim();
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title.trim();
  if (message.image?.caption) return message.image.caption.trim();
  return "";
}

async function loadSessionFromDB(threadId: string): Promise<Session> {
  const messages = await loadThreadHistory(threadId, 24);
  const session: Session = {};

  for (const msg of [...messages].reverse()) {
    if (!session.distanceKm) {
      const km = parseDistanceKm(msg.body);
      if (km != null) session.distanceKm = km;
    }
    if (msg.senderId === AI_BOT_ID) {
      if (!session.wantsHuman && /atendimento humano|atendente|falar com humano/i.test(msg.body)) {
        session.wantsHuman = true;
      }
      if (!session.lastProductId) {
        for (const item of catalog) {
          if (msg.body.includes(item.name) || msg.body.includes(item.id) || msg.body.includes(item.sku)) {
            session.lastProductId = item.id;
            break;
          }
        }
      }
    }
    if (session.lastProductId && session.distanceKm !== undefined) break;
  }

  return session;
}

async function getSession(from: string, threadId: string): Promise<Session> {
  const cached = sessionsCache.get(from);
  if (cached) return cached;
  const session = await loadSessionFromDB(threadId);
  sessionsCache.set(from, session);
  return session;
}

function saveSession(from: string, session: Session) {
  sessionsCache.set(from, session);
}

async function sendAndStoreReply(to: string, threadId: string, reply: string) {
  if (!isWhatsAppOutboundReady()) {
    await recordOperationalAlert({
      type: "send_failure",
      title: "WhatsApp outbound pendente",
      body: "Mensagem automática não enviada porque as envs de outbound WhatsApp não estão completas.",
      channel: "whatsapp",
      threadId,
      severity: "warning",
      dedupeKey: `whatsapp_outbound_missing:${threadId}`,
    });
    return;
  }

  const result = await sendWhatsAppText(to, reply);
  if (result.ok) {
    await storeReplyMessage(threadId, reply, AI_BOT_ID);
    return;
  }

  logStructured("warn", "whatsapp_reply_failed", {
    threadId,
    rawStatus: result.rawStatus,
    errorCode: result.error?.code,
  });
  await recordOperationalAlert({
    type: "send_failure",
    title: "Falha ao responder WhatsApp",
    body: "A Cloud API não aceitou o envio da resposta. Verifique token, phone_number_id e permissões.",
    channel: "whatsapp",
    threadId,
    severity: "warning",
    dedupeKey: `whatsapp_send_failure:${threadId}`,
  });
}

async function handleStatus(status: WaStatus) {
  await prisma.adminActionLog.create({
    data: {
      action: `whatsapp.message.${status.status}`,
      entityType: "WhatsAppMessage",
      entityId: status.id,
      summary: `WhatsApp delivery status: ${status.status}`,
      metadata: {
        messageId: status.id,
        status: status.status,
        errorCode: status.errors?.[0]?.code,
        errorTitle: status.errors?.[0]?.title,
      },
    },
  }).catch(() => null);

  if (status.status === "failed") {
    logStructured("warn", "whatsapp_delivery_failed", {
      messageId: status.id,
      errorCode: status.errors?.[0]?.code,
    });
    await recordOperationalAlert({
      type: "send_failure",
      title: "Entrega WhatsApp falhou",
      body: "Uma mensagem enviada pelo WhatsApp retornou status failed.",
      channel: "whatsapp",
      severity: "warning",
      dedupeKey: `whatsapp_status_failed:${status.id}`,
      metadata: { messageId: status.id, errorCode: status.errors?.[0]?.code },
    });
  }
}

async function handleInboundMessage(message: WaMessage) {
  const from = String(message.from || "").trim();
  const text = getMessageText(message);
  if (!from || !text) return;

  const digits = from.replace(/\D/g, "");
  const contact = await ensureChannelUser("whatsapp", digits, `WhatsApp ${digits.slice(-4)}`, `+${digits}`);
  const thread = await ensureChannelThread(contact.id, "whatsapp", `WhatsApp ${digits}`);
  const inbound = await storeInboundMessage(thread.id, contact.id, text, {
    externalMessageId: message.id,
    channel: "whatsapp",
    source: "whatsapp_message",
  });
  if (inbound.duplicate) return;

  await markWaMessageRead(message.id).catch(() => {});

  const session = await getSession(from, thread.id);

  if (/^(oi|ol[aá]|menu|in[ií]cio|começar)$/i.test(text)) {
    await sendAndStoreReply(from, thread.id, menuText());
    return;
  }

  if (wantsHuman(text)) {
    session.wantsHuman = true;
    saveSession(from, session);
    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { status: "needs_human", unread: true, channel: "whatsapp" },
    });
    await recordOperationalAlert({
      type: "handoff_requested",
      title: "Cliente pediu humano no WhatsApp",
      body: "Conversa marcada como needs_human no inbox.",
      channel: "whatsapp",
      threadId: thread.id,
      severity: "critical",
      dedupeKey: `whatsapp_handoff:${thread.id}`,
    });
    await sendAndStoreReply(
      from,
      thread.id,
      [
        "Perfeito. Vou direcionar para atendimento humano.",
        `WhatsApp principal: +${whatsappNumber}`,
        `E-mail de apoio: ${getStaffNotifyEmail()}`,
        "Se quiser agilizar, já me mande: item, cor, bairro/CEP e prazo desejado.",
      ].join("\n")
    );
    return;
  }

  const km = parseDistanceKm(text);
  if (km != null) session.distanceKm = km;

  const query = normalizeQuery(text);
  const product = findBestProduct(query) || (session.lastProductId ? catalog.find((item) => item.id === session.lastProductId) : null);

  if (!product) {
    saveSession(from, session);
    await sendAndStoreReply(from, thread.id, menuText());
    return;
  }

  session.lastProductId = product.id;
  saveSession(from, session);

  const link = `${getSiteUrl()}${getProductUrl(product)}`;
  const deliveryFee = session.distanceKm ? estimateDeliveryFeeKm(session.distanceKm) : 0;
  const total = Number((product.pricePix + deliveryFee).toFixed(2));

  await sendAndStoreReply(
    from,
    thread.id,
    [
      `MDH 3D | ${product.name}`,
      `Preço base no Pix: ${formatCurrency(product.pricePix)}`,
      deliveryFee > 0
        ? `Frete estimado (${session.distanceKm} km): ${formatCurrency(deliveryFee)}`
        : "Frete: me envie km ou calcule pelo CEP no site.",
      `Total estimado: ${formatCurrency(total)}`,
      `Link do produto: ${link}`,
      "",
      "Quer seguir? Responda com cor, bairro/CEP e forma de pagamento.",
      "Se quiser atendimento humano, escreva HUMANO.",
    ].join("\n")
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`webhook:whatsapp:${ip}`, 600, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (!isValidMetaSignature(rawBody, signatureHeader)) {
    logStructured("warn", "whatsapp_webhook_invalid_signature", {});
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: WaWebhookPayload;
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true });
  }

  const jobs: Array<Promise<void>> = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      for (const status of value.statuses ?? []) {
        jobs.push(handleStatus(status));
      }
      for (const message of value.messages ?? []) {
        jobs.push(
          handleInboundMessage(message).catch(async (error) => {
            logStructured("error", "whatsapp_message_handler_failed", {
              messageId: message.id,
              message: error instanceof Error ? error.message : "unknown",
            });
            await recordOperationalAlert({
              type: "webhook_error",
              title: "Erro no webhook WhatsApp",
              body: "Uma mensagem inbound do WhatsApp não foi processada.",
              channel: "whatsapp",
              severity: "critical",
              dedupeKey: `whatsapp_webhook_error:${message.id}`,
              metadata: { messageId: message.id },
            });
          })
        );
      }
    }
  }

  if (jobs.length) await Promise.allSettled(jobs);
  return NextResponse.json({ ok: true });
}
