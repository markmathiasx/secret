import "server-only";
import { metaConfig, META_GRAPH_VERSION } from "./config";
import type { GraphApiResponse } from "./types";

const GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

function authHeader(): Record<string, string> {
  return {
    Authorization: `Bearer ${metaConfig.systemUserToken}`,
    "Content-Type": "application/json",
  };
}

/** Generic POST to Graph API. Returns structured result; never throws. */
export async function graphPost<T = unknown>(
  path: string,
  body: unknown
): Promise<GraphApiResponse<T>> {
  if (!metaConfig.systemUserToken) {
    return { ok: false, error: { message: "META_SYSTEM_USER_TOKEN/WHATSAPP_ACCESS_TOKEN not set", type: "config", code: 0 } };
  }

  try {
    const res = await fetch(`${GRAPH_BASE}/${path}`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error, rawStatus: res.status };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "network_error",
        type: "network",
        code: 0,
      },
    };
  }
}

/** Generic GET from Graph API. Returns structured result; never throws. */
export async function graphGet<T = unknown>(
  path: string,
  params?: Record<string, string>
): Promise<GraphApiResponse<T>> {
  if (!metaConfig.systemUserToken) {
    return { ok: false, error: { message: "META_SYSTEM_USER_TOKEN/WHATSAPP_ACCESS_TOKEN not set", type: "config", code: 0 } };
  }

  try {
    const url = new URL(`${GRAPH_BASE}/${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString(), { headers: authHeader() });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error, rawStatus: res.status };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "network_error",
        type: "network",
        code: 0,
      },
    };
  }
}

/** Send a plain-text message to a WhatsApp number. */
export async function sendWhatsAppText(
  to: string,
  text: string,
  phoneNumberId?: string
): Promise<GraphApiResponse> {
  const pid = phoneNumberId ?? metaConfig.phoneNumberId;
  if (!pid) {
    return { ok: false, error: { message: "META_PHONE_NUMBER_ID not set", type: "config", code: 0 } };
  }
  return graphPost(`${pid}/messages`, {
    messaging_product: "whatsapp",
    to: to.replace(/\D/g, ""),
    type: "text",
    text: { body: text },
  });
}

/** Send a Facebook Page text reply to a PSID. */
export async function sendFbPageReply(
  recipientPsid: string,
  text: string
): Promise<GraphApiResponse> {
  return graphPost("me/messages", {
    recipient: { id: recipientPsid },
    message: { text },
    messaging_type: "RESPONSE",
  });
}

/** Send an Instagram DM reply to a sender IGSID. */
export async function sendInstagramDmReply(
  recipientIgsid: string,
  text: string
): Promise<GraphApiResponse> {
  return graphPost("me/messages", {
    recipient: { id: recipientIgsid },
    message: { text },
  });
}

/** Reply to an Instagram comment. */
export async function replyToInstagramComment(
  commentId: string,
  text: string
): Promise<GraphApiResponse> {
  return graphPost(`${commentId}/replies`, { message: text });
}

/** Mark a WhatsApp message as read and show typing indicator. */
export async function markWaMessageRead(
  messageId: string,
  phoneNumberId?: string
): Promise<void> {
  const pid = phoneNumberId ?? metaConfig.phoneNumberId;
  if (!pid) return;
  await graphPost(`${pid}/messages`, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  }).catch(() => {});
}

/** Get user profile from Instagram (name + profile picture). */
export async function getInstagramProfile(
  igsid: string
): Promise<{ name?: string; profile_pic?: string } | null> {
  const res = await graphGet<{ name: string; profile_pic: string }>(igsid, {
    fields: "name,profile_pic",
  });
  return res.ok ? (res.data ?? null) : null;
}

/** Get Facebook Page user profile (first_name, last_name, profile_pic). */
export async function getFbUserProfile(
  psid: string
): Promise<{ name?: string; pic?: string } | null> {
  const res = await graphGet<{
    first_name: string;
    last_name: string;
    profile_pic: string;
  }>(psid, { fields: "first_name,last_name,profile_pic" });
  if (!res.ok || !res.data) return null;
  const { first_name, last_name, profile_pic } = res.data;
  return { name: [first_name, last_name].filter(Boolean).join(" "), pic: profile_pic };
}
