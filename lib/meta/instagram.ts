import "server-only";
import { sendInstagramDmReply, replyToInstagramComment, getInstagramProfile } from "./graph-api";
import { isInstagramReady, metaConfig } from "./config";
import { ensureChannelUser, ensureChannelThread, storeInboundMessage, storeReplyMessage } from "./normalizers";
import { buildCommerceFallbackReply } from "@/lib/commerce-assistant";
import { logStructured } from "@/lib/logger";
import { recordOperationalAlert } from "@/lib/operational-alerts";
import type { GraphApiResponse } from "./types";

const AI_BOT_ID = "ai-bot";

/** Handle an inbound Instagram DM. */
export async function handleInstagramDm(
  senderIgsid: string,
  text: string,
  messageId?: string
): Promise<void> {
  if (!text?.trim()) return;

  let displayName: string | undefined;
  try {
    const profile = await getInstagramProfile(senderIgsid);
    displayName = profile?.name ?? undefined;
  } catch { /* ignore */ }

  const user = await ensureChannelUser("instagram_dm", senderIgsid, displayName);
  const thread = await ensureChannelThread(user.id, "instagram_dm", `Instagram DM ${senderIgsid}`);
  const inbound = await storeInboundMessage(thread.id, user.id, text, {
    externalMessageId: messageId,
    channel: "instagram_dm",
    source: "instagram_dm",
  });
  if (inbound.duplicate) return;

  if (!isInstagramReady()) return;

  try {
    const reply = await buildCommerceFallbackReply(text);
    const result = await sendInstagramDmReply(senderIgsid, reply);
    if (result.ok) {
      await storeReplyMessage(thread.id, reply, AI_BOT_ID);
    } else {
      logStructured("warn", "instagram_dm_reply_failed", {
        threadId: thread.id,
        rawStatus: result.rawStatus,
        errorCode: result.error?.code,
      });
      await recordOperationalAlert({
        type: "send_failure",
        title: "Falha ao responder Instagram DM",
        body: "A resposta automática por DM não foi enviada. Verifique token/permissões Meta.",
        channel: "instagram_dm",
        threadId: thread.id,
        severity: "warning",
        dedupeKey: `instagram_dm_send_failure:${thread.id}`,
      });
    }
  } catch (err) {
    logStructured("error", "instagram_dm_ai_reply_error", {
      threadId: thread.id,
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

/**
 * Handle an inbound Instagram comment.
 * Stores the comment as a support thread message.
 * Auto-replies only if the comment contains a question or commercial keyword.
 */
export async function handleInstagramComment(change: {
  from: { id: string; username?: string };
  media: { id: string; media_product_type?: string };
  id: string;
  text: string;
  parent_id?: string;
}): Promise<void> {
  const { from, id: commentId, text, media } = change;
  if (!text?.trim()) return;

  const displayName = from.username ? `@${from.username}` : undefined;
  const user = await ensureChannelUser("instagram_comments", from.id, displayName);
  const subject = `Instagram Comment ${media.id}`;
  const thread = await ensureChannelThread(user.id, "instagram_comments", subject);
  const inbound = await storeInboundMessage(thread.id, user.id, `[Comentário em ${media.id}]: ${text}`, {
    externalMessageId: commentId,
    channel: "instagram_comments",
    source: "instagram_comment",
  });
  if (inbound.duplicate) return;

  // Auto-reply only for commercial questions / mentions
  const shouldAutoReply =
    isInstagramReady() &&
    /\?|preço|valor|quanto|disponível|entrega|comprar|encomenda|produto/i.test(text);

  if (!shouldAutoReply) return;

  try {
    const reply = await buildCommerceFallbackReply(text);
    const result = await replyToInstagramComment(commentId, reply);
    if (result.ok) {
      await storeReplyMessage(thread.id, reply, AI_BOT_ID);
    } else {
      logStructured("warn", "instagram_comment_reply_failed", {
        threadId: thread.id,
        rawStatus: result.rawStatus,
        errorCode: result.error?.code,
      });
      await recordOperationalAlert({
        type: "send_failure",
        title: "Falha ao responder comentário Instagram",
        body: "A resposta automática no comentário não foi enviada. Verifique permissões do Instagram.",
        channel: "instagram_comments",
        threadId: thread.id,
        severity: "warning",
        dedupeKey: `instagram_comment_send_failure:${thread.id}`,
      });
    }
  } catch (err) {
    logStructured("error", "instagram_comment_auto_reply_error", {
      threadId: thread.id,
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

/** Send Instagram DM reply from admin. */
export async function sendInstagramAdminReply(
  recipientIgsid: string,
  text: string
): Promise<GraphApiResponse> {
  return sendInstagramDmReply(recipientIgsid, text);
}
