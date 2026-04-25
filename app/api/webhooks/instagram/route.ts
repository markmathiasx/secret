import { NextRequest, NextResponse } from "next/server";
import { isValidMetaSignature, isValidVerifyToken } from "@/lib/meta/signature";
import { handleInstagramDm, handleInstagramComment } from "@/lib/meta/instagram";
import { logStructured } from "@/lib/logger";
import type { IgWebhookPayload, IgCommentChange } from "@/lib/meta/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — Instagram webhook verification handshake.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && isValidVerifyToken(token) && challenge) {
    logStructured("info", "instagram_webhook_verified", {});
    return new Response(challenge, { status: 200 });
  }

  logStructured("warn", "instagram_webhook_verify_failed", { mode, hasToken: !!token });
  return NextResponse.json({ ok: false }, { status: 403 });
}

/**
 * POST — Inbound Instagram DMs and comment events.
 * Validates x-hub-signature-256, routes to handlers.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (!isValidMetaSignature(rawBody, signatureHeader)) {
    logStructured("warn", "instagram_webhook_invalid_signature", {});
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: IgWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (payload.object !== "instagram") {
    return NextResponse.json({ ok: true });
  }

  void (async () => {
    for (const entry of payload.entry ?? []) {
      // ── Direct Messages ──────────────────────────────────────────────────
      for (const msg of entry.messaging ?? []) {
        if ((msg as any).message?.is_echo) continue;
        if ((msg as any).read || (msg as any).delivery) continue;

        const text = msg.message?.text;
        if (!text) continue;

        try {
          await handleInstagramDm(msg.sender.id, text, msg.message?.mid);
        } catch (err) {
          logStructured("error", "instagram_dm_handler_failed", {
            sender: msg.sender.id,
            error: err instanceof Error ? err.message : "unknown",
          });
        }
      }

      // ── Comments ─────────────────────────────────────────────────────────
      for (const change of entry.changes ?? []) {
        if (change.field !== "comments") continue;
        const val = change.value as IgCommentChange["value"];
        if (!val?.text) continue;

        try {
          await handleInstagramComment({
            from: val.from,
            media: val.media,
            id: val.id,
            text: val.text,
            parent_id: val.parent_id,
          });
        } catch (err) {
          logStructured("error", "instagram_comment_handler_failed", {
            commentId: val.id,
            error: err instanceof Error ? err.message : "unknown",
          });
        }
      }
    }
  })();

  return NextResponse.json({ ok: true });
}
