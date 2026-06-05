"use client";

export const commerceEventNames = [
  "view_item",
  "select_item",
  "add_to_cart",
  "begin_checkout",
  "purchase",
  "whatsapp_click",
  "support_chat_started",
  "support_message_sent",
  "support_product_suggested",
  "custom_quote_started",
  "intent_page_view",
  "game_play_started",
] as const;

export type CommerceEventName = (typeof commerceEventNames)[number];
export type CommerceEventPayload = Record<string, string | number | boolean | null | undefined | CommerceEventPayload[] | Record<string, unknown>>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    mdhTrack?: (eventName: CommerceEventName, payload?: CommerceEventPayload) => void;
  }
}

const metaEventMap: Partial<Record<CommerceEventName, string>> = {
  view_item: "ViewContent",
  select_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  whatsapp_click: "Contact",
  support_chat_started: "Contact",
  support_message_sent: "Contact",
  support_product_suggested: "ViewContent",
  custom_quote_started: "Lead",
  intent_page_view: "ViewContent",
  game_play_started: "ViewContent",
};

function sanitizePayload(payload?: CommerceEventPayload) {
  if (!payload) return {};
  const blocked = /email|phone|telefone|whatsapp|password|senha|token|secret|session|cpf|cnpj|address|endereco|cartao|card/i;

  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => !blocked.test(key) && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === "string") return [key, value.slice(0, 180)];
        return [key, value];
      })
  );
}

export function trackCommerceEvent(eventName: CommerceEventName, payload?: CommerceEventPayload) {
  if (typeof window === "undefined") return;

  const safePayload = sanitizePayload(payload);

  window.gtag?.("event", eventName, safePayload);
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...safePayload });
  }

  const metaEvent = metaEventMap[eventName];
  if (metaEvent) {
    window.fbq?.("track", metaEvent, safePayload);
  }

  if (eventName === "support_message_sent" || eventName === "custom_quote_started" || eventName === "game_play_started") {
    window.clarity?.("event", eventName);
  }
}
