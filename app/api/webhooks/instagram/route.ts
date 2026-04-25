import { NextRequest, NextResponse } from "next/server";
import { isValidMetaSignature, isValidVerifyToken } from "@/lib/meta/signature";
import { handleInstagramDm, handleInstagramComment } from "@/lib/meta/instagram";
import { logStructured } from "@/lib/logger";
import type { IgWebhookPayload, IgCommentChange } from "@/lib/meta/types";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { recordOperationalAlert } from "@/lib/operational-alerts";

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
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`webhook:instagram:${ip}`, 600, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

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

  const jobs: Array<Promise<void>> = [];
  for (const entry of payload.entry ?? []) {
    for (const msg of entry.messaging ?? []) {
      if ((msg as any).message?.is_echo) continue;
      if ((msg as any).read || (msg as any).delivery) continue;

      const text = msg.message?.text;
      if (!text) continue;

      jobs.push(
        handleInstagramDm(msg.sender.id, text, msg.message?.mid).catch(async (err) => {
          logStructured("error", "instagram_dm_handler_failed", {
            eventId: msg.message?.mid,
            error: err instanceof Error ? err.message : "unknown",
          });
          await recordOperationalAlert({
            type: "webhook_error",
            title: "Erro no webhook Instagram DM",
            body: "Um evento de DM do Instagram não foi processado.",
            channel: "instagram_dm",
            severity: "critical",
            dedupeKey: `instagram_dm_webhook_error:${msg.message?.mid ?? entry.id}`,
            metadata: { eventId: msg.message?.mid },
          });
        })
      );
    }

    for (const change of entry.changes ?? []) {
      if (change.field !== "comments") continue;
      const val = change.value as IgCommentChange["value"];
      if (!val?.text) continue;

      jobs.push(
        handleInstagramComment({
          from: val.from,
          media: val.media,
          id: val.id,
          text: val.text,
          parent_id: val.parent_id,
        }).catch(async (err) => {
          logStructured("error", "instagram_comment_handler_failed", {
            commentId: val.id,
            error: err instanceof Error ? err.message : "unknown",
          });
          await recordOperationalAlert({
            type: "webhook_error",
            title: "Erro no webhook Instagram comentário",
            body: "Um comentário do Instagram não foi processado.",
            channel: "instagram_comments",
            severity: "critical",
            dedupeKey: `instagram_comment_webhook_error:${val.id}`,
            metadata: { eventId: val.id },
          });
        })
      );
    }
  }

  if (jobs.length) await Promise.allSettled(jobs);

  return NextResponse.json({ ok: true });
}
