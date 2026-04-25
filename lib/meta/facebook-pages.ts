import "server-only";
import { sendFbPageReply, getFbUserProfile } from "./graph-api";
import { metaConfig, isFacebookPageReady } from "./config";
import { ensureChannelUser, ensureChannelThread, storeInboundMessage, storeReplyMessage } from "./normalizers";
import { buildCommerceFallbackReply } from "@/lib/commerce-assistant";
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
  await storeInboundMessage(thread.id, user.id, text, { externalMessageId: messageId });

  if (!isFacebookPageReady()) return;

  // AI reply
  try {
    const reply = await buildCommerceFallbackReply(text);
    const result = await sendFbPageReply(senderPsid, reply);
    if (result.ok) {
      await storeReplyMessage(thread.id, reply, AI_BOT_ID);
    } else {
      console.warn("[meta/facebook-pages] reply failed", result.error);
    }
  } catch (err) {
    console.error("[meta/facebook-pages] AI reply error", err);
  }
}

/** Reply to a specific thread from admin. */
export async function sendFbPageAdminReply(
  recipientPsid: string,
  text: string
): Promise<GraphApiResponse> {
  return sendFbPageReply(recipientPsid, text);
}
