import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, sanitizeTextInput } from "@/lib/security";
import { buildSupportReply } from "@/lib/support/support-answer-engine";

export const runtime = "nodejs";

const MAX_CONTENT_LENGTH = 16_000;

const payloadSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().trim().max(120).optional(),
  sourcePage: z.string().trim().max(240).optional(),
  source: z.string().trim().max(80).optional(),
});

function json(payload: unknown, init?: ResponseInit) {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

function methodNotAllowed() {
  return json({ ok: false, error: "Método não suportado." }, { status: 405, headers: { Allow: "POST, OPTIONS" } });
}

export async function OPTIONS() {
  return json({ ok: true, methods: ["POST"] }, { headers: { Allow: "POST, OPTIONS" } });
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_CONTENT_LENGTH) {
      return json({ ok: false, error: "Mensagem acima do limite permitido." }, { status: 413 });
    }

    const ip = getClientIp(request.headers);
    const rawPayload = await request.json().catch(() => null);
    const parsed = payloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return json({ ok: false, error: "Envie uma mensagem válida para continuar." }, { status: 400 });
    }

    const sessionKey = parsed.data.sessionId || ip;
    const rateLimit = checkRateLimit(`support_chat:${ip}:${sessionKey}`, 18, 60_000);
    if (!rateLimit.ok) {
      const response = json(
        { ok: false, error: "Muitas mensagens em sequência. Aguarde um pouco antes de continuar.", retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(rateLimit.retryAfter));
      return response;
    }

    const message = sanitizeTextInput(parsed.data.message, 1000);
    const sourcePage = parsed.data.sourcePage ? sanitizeTextInput(parsed.data.sourcePage, 240) : undefined;
    const sessionId = parsed.data.sessionId ? sanitizeTextInput(parsed.data.sessionId, 120) : undefined;
    const answer = buildSupportReply(message, { sessionId, sourcePage });

    return json({
      ok: true,
      intent: answer.intent,
      reply: answer.reply,
      products: answer.products,
      suggestions: answer.suggestions,
      handoff: answer.handoff,
      whatsappUrl: answer.whatsappUrl,
      priceRange: answer.priceRange,
    });
  } catch {
    return json({ ok: false, error: "Não foi possível processar o atendimento agora." }, { status: 500 });
  }
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
