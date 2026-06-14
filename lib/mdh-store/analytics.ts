"use client";

export type SmartStoreEventName =
  | "view_product"
  | "search_product"
  | "add_to_cart"
  | "click_buy_nuvemshop"
  | "click_whatsapp_budget"
  | "checkout_whatsapp";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    mdhSmartStoreTrack?: (eventName: SmartStoreEventName, payload?: Record<string, unknown>) => void;
  }
}

const metaEventMap: Partial<Record<SmartStoreEventName, string>> = {
  view_product: "ViewContent",
  search_product: "Search",
  add_to_cart: "AddToCart",
  checkout_whatsapp: "InitiateCheckout",
};

export function trackSmartStoreEvent(eventName: SmartStoreEventName, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ecommerce: payload });

  const metaEvent = metaEventMap[eventName];
  if (metaEvent && window.fbq) {
    window.fbq("track", metaEvent, payload);
  }
}
