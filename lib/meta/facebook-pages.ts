import "server-only";
import { sendFbPageReply, getFbUserProfile } from "./graph-api";
import { metaConfig, isFacebookPageReady } from "./config";
import { ensureChannelUser, ensureChannelThread, storeInboundMessage, storeReplyMessage } from "./normalizers";
import { buildCommerceFallbackReply } from "@/lib/commerce-assistant";
import { logStructured } from "@/lib/logger";
import { recordOperationalAlert } from "@/lib/operational-alerts";
import type { GraphApiResponse } from "./types";

const AI_BOT_ID = "ai-bot";

/**
 * Handle an inbound Facebook Page message (from Messenger).
 * Creates/updates a ChatThread, stores message, sends AI reply.
 */
export async function handleFbPageMessage(
  senderPsid: string,
  text: string,
  messageId?: string
): Promise<void> {
  if (!text?.trim()) return;

  // Fetch display name from Graph (non-blocking)
  let displayName: string | undefined;
  try {
    const profile = await getFbUserProfile(senderPsid);
    displayName = profile?.name ?? undefined;
  } catch { /* ignore */ }

  const user = await ensureChannelUser("facebook_page", senderPsid, displayName);
  const thread = await ensureChannelThread(user.id, "facebook_page", `FB Messenger ${senderPsid}`);
  const inbound = await storeInboundMessage(thread.id, user.id, text, {
    externalMessageId: messageId,
    channel: "facebook_page",
    source: "facebook_page_message",
  });
  if (inbound.duplicate) return;

  if (!isFacebookPageReady()) return;

  // AI reply
  try {
    const reply = await buildCommerceFallbackReply(text);
    const result = await sendFbPageReply(senderPsid, reply);
    if (result.ok) {
      await storeReplyMessage(thread.id, reply, AI_BOT_ID);
    } else {
      logStructured("warn", "facebook_page_reply_failed", {
        threadId: thread.id,
        rawStatus: result.rawStatus,
        errorCode: result.error?.code,
      });
      await recordOperationalAlert({
        type: "send_failure",
        title: "Falha ao responder Facebook",
        body: "A resposta automática da página não foi enviada. Verifique token/permissões Meta.",
        channel: "facebook_page",
        threadId: thread.id,
        severity: "warning",
        dedupeKey: `facebook_send_failure:${thread.id}`,
      });
    }
  } catch (err) {
    logStructured("error", "facebook_page_ai_reply_error", {
      threadId: thread.id,
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

/** Reply to a specific thread from admin. */
export async function sendFbPageAdminReply(
  recipientPsid: string,
  text: string
): Promise<GraphApiResponse> {
  return sendFbPageReply(recipientPsid, text);
}
