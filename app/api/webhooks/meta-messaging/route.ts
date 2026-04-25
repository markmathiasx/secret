import { NextRequest, NextResponse } from "next/server";
import { isValidMetaSignature, isValidVerifyToken } from "@/lib/meta/signature";
import { handleFbPageMessage } from "@/lib/meta/facebook-pages";
import { logStructured } from "@/lib/logger";
import type { FbPageWebhookPayload } from "@/lib/meta/types";

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

  // Process each messaging event asynchronously (respond immediately to avoid 20s timeout)
  void (async () => {
    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        // Skip echo messages (from the page itself)
        if ((event as any).message?.is_echo) continue;
        // Skip delivery/read receipts
        if (event.delivery || event.read) continue;

        const text =
          event.message?.text ??
          (event.postback ? `[Postback] ${event.postback.title}` : null);

        if (!text) continue;

        try {
          await handleFbPageMessage(
            event.sender.id,
            text,
            event.message?.mid
          );
        } catch (err) {
          logStructured("error", "meta_messaging_handler_failed", {
            senderPsid: event.sender.id,
            error: err instanceof Error ? err.message : "unknown",
          });
        }
      }
    }
  })();

  return NextResponse.json({ ok: true });
}
