import { NextRequest, NextResponse } from "next/server";
import { isValidMetaSignature, isValidVerifyToken } from "@/lib/meta/signature";
import { handleFbPageMessage } from "@/lib/meta/facebook-pages";
import { logStructured } from "@/lib/logger";
import type { FbPageWebhookPayload } from "@/lib/meta/types";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { recordOperationalAlert } from "@/lib/operational-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — Facebook webhook verification handshake.
 * Meta calls this when you register the webhook subscription.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && isValidVerifyToken(token) && challenge) {
    logStructured("info", "meta_messaging_webhook_verified", {});
    return new Response(challenge, { status: 200 });
  }

  logStructured("warn", "meta_messaging_webhook_verify_failed", { mode, hasToken: !!token });
  return NextResponse.json({ ok: false }, { status: 403 });
}

/**
 * POST — Inbound Facebook Page messages.
 * Validates x-hub-signature-256, routes to handler, always responds 200.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`webhook:meta_messaging:${ip}`, 600, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (!isValidMetaSignature(rawBody, signatureHeader)) {
    logStructured("warn", "meta_messaging_invalid_signature", {});
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: FbPageWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (payload.object !== "page") {
    // Wrong object type — not our concern but acknowledge
    return NextResponse.json({ ok: true });
  }

  const jobs: Array<Promise<void>> = [];
  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      if ((event as any).message?.is_echo) continue;
      if (event.delivery || event.read) continue;

      const text =
        event.message?.text ??
        (event.postback ? `[Postback] ${event.postback.title}` : null);

      if (!text) continue;

      jobs.push(
        handleFbPageMessage(event.sender.id, text, event.message?.mid).catch(async (err) => {
          logStructured("error", "meta_messaging_handler_failed", {
            eventId: event.message?.mid,
            error: err instanceof Error ? err.message : "unknown",
          });
          await recordOperationalAlert({
            type: "webhook_error",
            title: "Erro no webhook Facebook",
            body: "Um evento de mensagem da página não foi processado.",
            channel: "facebook_page",
            severity: "critical",
            dedupeKey: `facebook_webhook_error:${event.message?.mid ?? entry.id}`,
            metadata: { eventId: event.message?.mid },
          });
        })
      );
    }
  }

  if (jobs.length) await Promise.allSettled(jobs);

  return NextResponse.json({ ok: true });
}
