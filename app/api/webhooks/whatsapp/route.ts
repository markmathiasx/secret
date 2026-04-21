import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { catalog, getProductUrl } from "@/lib/catalog";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { formatCurrency } from "@/lib/utils";
import { supportEmail, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type Session = { distanceKm?: number; lastProductId?: string; wantsHuman?: boolean };
// Keep the in-memory map as a fast-path cache; DB serves as persistent fallback.
const sessionsCache = new Map<string, Session>();
const AI_BOT_ID = "ai-bot";
const WA_API_VERSION = "v23.0";

function isValidWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const received = signatureHeader.slice("sha256=".length);
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}

async function ensureBotUser() {
  await prisma.user.upsert({
    where: { id: AI_BOT_ID },
    update: {
      name: "Assistente MDH",
      role: "ADMIN",
      isActive: true,
      isInternalSeller: true,
    },
    create: {
      id: AI_BOT_ID,
      email: "ai-bot@mdh.local",
      name: "Assistente MDH",
      role: "ADMIN",
      isActive: true,
      isInternalSeller: true,
    },
  });
}

async function ensureWhatsAppUser(from: string) {
  const digits = from.replace(/\D/g, "");
  const email = `wa-${digits}@mdh.local`;
  return prisma.user.upsert({
    where: { email },
    update: {
      phone: `+${digits}`,
      name: `WhatsApp ${digits.slice(-4)}`,
      role: "BUYER",
      isActive: true,
    },
    create: {
      email,
      phone: `+${digits}`,
      name: `WhatsApp ${digits.slice(-4)}`,
      role: "BUYER",
      isActive: true,
    },
  });
}

async function ensureWhatsAppThread(userId: string, subject: string) {
  const existing = await prisma.chatThread.findFirst({
    where: {
      buyerId: userId,
      type: "SUPPORT",
      subject: {
        contains: "WhatsApp",
        mode: "insensitive",
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.chatThread.create({
    data: {
      buyerId: userId,
      type: "SUPPORT",
      subject,
      lastMessageAt: new Date(),
    },
  });
}

async function storeMessage(threadId: string, senderId: string, body: string) {
  await ensureBotUser();
  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId,
      body,
    },
  });

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date() },
  });

  return message;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false }, { status: 403 });
}

async function sendText(to: string, body: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return { ok: false, error: "WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_ACCESS_TOKEN não configurados" };
  }

  const url = `https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, data };
  }
  return { ok: true };
}

/** Reconstruct session state from the thread's message history (serverless-safe). */
async function loadSessionFromDB(threadId: string): Promise<Session> {
  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: { senderId: true, body: true },
  });

  const session: Session = {};

  for (const msg of messages) {
    // Parse distance km from any message
    if (!session.distanceKm) {
      const km = parseDistanceKm(msg.body);
      if (km != null) session.distanceKm = km;
    }
    if (msg.senderId === AI_BOT_ID) {
      // Check if bot redirected to human support
      if (!session.wantsHuman && /atendimento humano|atendente|falar com algu/i.test(msg.body)) {
        session.wantsHuman = true;
      }
      // Infer last product from bot reply header "MDH 3D | ProductName"
      if (!session.lastProductId) {
        for (const item of catalog) {
          if (msg.body.includes(item.name) || msg.body.includes(item.id) || msg.body.includes(item.sku)) {
            session.lastProductId = item.id;
            break;
          }
        }
      }
    }
    // Once we have enough context, stop scanning
    if (session.lastProductId && session.distanceKm !== undefined) break;
  }

  return session;
}

async function getSession(from: string, threadId: string): Promise<Session> {
  const cached = sessionsCache.get(from);
  if (cached) return cached;
  // Fallback: reconstruct from DB (handles serverless cold starts)
  const session = await loadSessionFromDB(threadId);
  sessionsCache.set(from, session);
  return session;
}

function saveSession(from: string, session: Session) {
  sessionsCache.set(from, session);
}

function scoreItem(item: any, tokens: string[]) {
  const blob = [item.name, item.category, item.theme, item.description, item.collection, ...(item.tags || [])].join(" ").toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (item.name.toLowerCase().includes(t)) s += 5;
    if (item.theme.toLowerCase().includes(t)) s += 4;
    if (blob.includes(t)) s += 1;
  }
  return s;
}

function findBestProduct(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const tokens = q.split(/\s+/).filter(Boolean);
  let best: { item: any; score: number } | null = null;

  for (const item of catalog) {
    const s = scoreItem(item, tokens);
    if (!best || s > best.score) best = { item, score: s };
  }

  if (!best || best.score <= 0) return null;
  return best.item;
}

function parseDistanceKm(text: string) {
  const m = text.toLowerCase().replaceAll(",", ".").match(/(\d+(?:\.\d+)?)\s*(?:km)?/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 0 || n > 300) return null;
  return n;
}

function wantsHuman(text: string) {
  return /(humano|atendente|pessoa|falar com algu[eé]m|suporte humano)/i.test(text);
}

function menuText() {
  return [
    "MDH 3D | Atendimento automático",
    "Me envie o nome do item que você quer, por exemplo:",
    "• dichavador hello kitty",
    "• suporte controle ps5",
    "• vaso geométrico",
    "• chaveiro personalizado",
    "",
    "Se quiser, envie também a distância em km (Google Maps).",
    "Para falar com humano, escreva HUMANO."
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

export async function POST(request: Request) {
  try {
    const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;
    if (!appSecret) {
      console.error("[whatsapp-webhook] missing app secret");
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");

    if (!isValidWebhookSignature(rawBody, signatureHeader, appSecret)) {
      console.warn("[whatsapp-webhook] invalid signature");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || "{}");
    const entries = payload?.entry || [];

    for (const entry of entries) {
      for (const change of entry?.changes || []) {
        const value = change?.value || {};
        const messages = value?.messages || [];

        for (const msg of messages) {
          const from = String(msg?.from || "");
          const text = String(msg?.text?.body || "").trim();
          if (!from || !text) continue;

          const contact = await ensureWhatsAppUser(from);
          const thread = await ensureWhatsAppThread(contact.id, `WhatsApp ${from}`);
          await storeMessage(thread.id, contact.id, text);

          // Load session from cache or DB (persists across serverless invocations)
          const session = await getSession(from, thread.id);

          if (/^(oi|ol[aá]|menu|in[ií]cio|começar)$/i.test(text)) {
            const reply = menuText();
            const result = await sendText(from, reply);
            if (result.ok) {
              await storeMessage(thread.id, AI_BOT_ID, reply);
            } else {
              console.error("WhatsApp reply failed:", result);
            }
            continue;
          }

          if (wantsHuman(text)) {
            session.wantsHuman = true;
            saveSession(from, session);
            const reply = [
              "Perfeito. Vou direcionar para atendimento humano.",
              `WhatsApp principal: +${whatsappNumber}`,
              `E-mail de apoio: ${supportEmail}`,
              "Se quiser agilizar, já me mande: item, cor, bairro/CEP e prazo desejado."
            ].join("\n");
            const result = await sendText(from, reply);
            if (result.ok) {
              await storeMessage(thread.id, AI_BOT_ID, reply);
            } else {
              console.error("WhatsApp reply failed:", result);
            }
            continue;
          }

          const km = parseDistanceKm(text);
          if (km != null) session.distanceKm = km;

          const query = normalizeQuery(text);
          const product = findBestProduct(query) || (session.lastProductId ? catalog.find((p) => p.id === session.lastProductId) : null);

          if (!product) {
            saveSession(from, session);
            const reply = menuText();
            const result = await sendText(from, reply);
            if (result.ok) {
              await storeMessage(thread.id, AI_BOT_ID, reply);
            } else {
              console.error("WhatsApp reply failed:", result);
            }
            continue;
          }

          session.lastProductId = product.id;
          saveSession(from, session);

          const siteUrl = getSiteUrl();
          const link = `${siteUrl}${getProductUrl(product)}`;
          const deliveryFee = session.distanceKm ? estimateDeliveryFeeKm(session.distanceKm) : 0;
          const total = Number((product.pricePix + deliveryFee).toFixed(2));

          const lines = [
            `MDH 3D | ${product.name}`,
            `Preço base no Pix: ${formatCurrency(product.pricePix)}`,
            deliveryFee > 0 ? `Frete estimado (${session.distanceKm} km): ${formatCurrency(deliveryFee)}` : "Frete: me envie km ou calcule pelo CEP no site.",
            `Total estimado: ${formatCurrency(total)}`,
            `Link do produto: ${link}`,
            "",
            "Quer seguir? Responda com cor, bairro/CEP e forma de pagamento.",
            "Se quiser atendimento humano, escreva HUMANO."
          ];

          const reply = lines.join("\n");
          const result = await sendText(from, reply);
          if (result.ok) {
            await storeMessage(thread.id, AI_BOT_ID, reply);
          } else {
            console.error("WhatsApp reply failed:", result);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[whatsapp-webhook] processing failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
