import "server-only";
import { sendInstagramDmReply, replyToInstagramComment, getInstagramProfile } from "./graph-api";
import { isInstagramReady, metaConfig } from "./config";
import { ensureChannelUser, ensureChannelThread, storeInboundMessage, storeReplyMessage } from "./normalizers";
import { buildCommerceFallbackReply } from "@/lib/commerce-assistant";
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
  await storeInboundMessage(thread.id, user.id, text, { externalMessageId: messageId });

  if (!isInstagramReady()) return;

  try {
    const reply = await buildCommerceFallbackReply(text);
    const result = await sendInstagramDmReply(senderIgsid, reply);
    if (result.ok) {
      await storeReplyMessage(thread.id, reply, AI_BOT_ID);
    } else {
      console.warn("[meta/instagram] DM reply failed", result.error);
    }
  } catch (err) {
    console.error("[meta/instagram] DM AI reply error", err);
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
  const user = await ensureChannelUser("instagram_comment", from.id, displayName);
  const subject = `Instagram Comment ${media.id}`;
  const thread = await ensureChannelThread(user.id, "instagram_comment", subject);
  await storeInboundMessage(thread.id, user.id, `[Comentário em ${media.id}]: ${text}`, {
    externalMessageId: commentId,
  });

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
      console.warn("[meta/instagram] comment reply failed", result.error);
    }
  } catch (err) {
    console.error("[meta/instagram] comment auto-reply error", err);
  }
}

/** Send Instagram DM reply from admin. */
export async function sendInstagramAdminReply(
  recipientIgsid: string,
  text: string
): Promise<GraphApiResponse> {
  return sendInstagramDmReply(recipientIgsid, text);
}
