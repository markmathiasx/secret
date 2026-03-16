import { NextResponse } from "next/server";
import { catalog, getProductUrl } from "@/lib/catalog";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { formatCurrency } from "@/lib/utils";
import { supportEmail, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

type Session = { distanceKm?: number; lastProductId?: string; wantsHuman?: boolean };
const sessions = new Map<string, Session>();

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

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
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
    "Me envie o nome do item que você quer. Alguns pedidos comuns:",
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
  const payload = await request.json().catch(() => ({}));
  const entries = payload?.entry || [];

  for (const entry of entries) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      const messages = value?.messages || [];

      for (const msg of messages) {
        const from = String(msg?.from || "");
        const text = String(msg?.text?.body || "").trim();
        if (!from || !text) continue;

        const session = sessions.get(from) || {};

        if (/^(oi|ol[aá]|menu|in[ií]cio|começar)$/i.test(text)) {
          await sendText(from, menuText());
          continue;
        }

        if (wantsHuman(text)) {
          session.wantsHuman = true;
          sessions.set(from, session);
          await sendText(
            from,
            [
              "Perfeito. Vou direcionar para atendimento humano.",
              `WhatsApp principal: +${whatsappNumber}`,
              `E-mail de apoio: ${supportEmail}`,
              "Se quiser agilizar, já me mande: item, cor, bairro/CEP e prazo desejado."
            ].join("\n")
          );
          continue;
        }

        const km = parseDistanceKm(text);
        if (km != null) session.distanceKm = km;

        const query = normalizeQuery(text);
        const product = findBestProduct(query) || (session.lastProductId ? catalog.find((p) => p.id === session.lastProductId) : null);

        if (!product) {
          sessions.set(from, session);
          await sendText(from, menuText());
          continue;
        }

        session.lastProductId = product.id;
        sessions.set(from, session);

        const publicSiteUrl = getSiteUrl({ allowLocalhost: true, fallback: new URL(request.url).origin });
        const link = `${publicSiteUrl}${getProductUrl(product)}`;
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

        await sendText(from, lines.join("\n"));
      }
    }
  }

  return NextResponse.json({ ok: true });
}
