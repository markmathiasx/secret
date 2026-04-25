/** Shared TypeScript types for Meta Cloud API / Graph API integrations. */

export type MetaChannel = "site" | "whatsapp" | "facebook_page" | "instagram_dm" | "instagram_comments";
export type LegacyMetaChannel = MetaChannel | "instagram_comment";

export function normalizeMetaChannel(channel?: string | null): MetaChannel {
  if (channel === "instagram_comment" || channel === "instagram_comments") return "instagram_comments";
  if (channel === "whatsapp") return "whatsapp";
  if (channel === "facebook_page") return "facebook_page";
  if (channel === "instagram_dm") return "instagram_dm";
  return "site";
}

// ─── WhatsApp Cloud API ───────────────────────────────────────────────────────

export interface WaMessage {
  id: string;
  from: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "document" | "video" | "interactive" | "button";
  text?: { body: string };
  image?: { id: string; caption?: string };
  interactive?: { type: string; button_reply?: { id: string; title: string } };
}

export interface WaStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}

export interface WaWebhookPayload {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: { display_phone_number: string; phone_number_id: string };
        messages?: WaMessage[];
        statuses?: WaStatus[];
      };
      field: "messages";
    }>;
  }>;
}

// ─── Facebook Page Messaging ──────────────────────────────────────────────────

export interface FbMessagingEntry {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text?: string; attachments?: Array<{ type: string; payload: { url?: string } }> };
  postback?: { title: string; payload: string };
  read?: { watermark: number };
  delivery?: { watermark: number };
}

export interface FbPageWebhookPayload {
  object: "page";
  entry: Array<{
    id: string;
    time: number;
    messaging: FbMessagingEntry[];
  }>;
}

// ─── Instagram Messaging ──────────────────────────────────────────────────────

export interface IgMessagingEntry {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text?: string; attachments?: Array<{ type: string; payload: { url?: string } }> };
}

export interface IgCommentChange {
  field: "comments";
  value: {
    from: { id: string; username?: string };
    media: { id: string; media_product_type?: string };
    id: string;
    text: string;
    parent_id?: string; // reply-to-comment
  };
}

export interface IgWebhookPayload {
  object: "instagram";
  entry: Array<{
    id: string;
    time?: number;
    messaging?: IgMessagingEntry[];
    changes?: IgCommentChange[];
  }>;
}

// ─── Graph API ────────────────────────────────────────────────────────────────

export interface GraphApiError {
  message: string;
  type: string;
  code: number;
  fbtrace_id?: string;
}

export interface GraphApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: GraphApiError;
  rawStatus?: number;
}

// ─── Business Login ───────────────────────────────────────────────────────────

export interface BusinessLoginToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface BusinessLoginUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: { data: { url: string } };
}
