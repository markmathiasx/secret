"use client";

export type SmartStoreEventName =
  | "view_home"
  | "view_category"
  | "view_product"
  | "search_product"
  | "filter_product"
  | "add_to_cart"
  | "remove_from_cart"
  | "click_buy_nuvemshop"
  | "click_whatsapp_budget"
  | "start_checkout"
  | "checkout_whatsapp"
  | "purchase_lead"
  | "coupon_apply"
  | "share_product";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track?: (event: string, params?: Record<string, unknown>) => void;
    };
    mdhSmartStoreTrack?: (eventName: SmartStoreEventName, payload?: Record<string, unknown>) => void;
  }
}

const metaEventMap: Partial<Record<SmartStoreEventName, string>> = {
  view_product: "ViewContent",
  search_product: "Search",
  add_to_cart: "AddToCart",
  start_checkout: "InitiateCheckout",
  checkout_whatsapp: "InitiateCheckout",
  purchase_lead: "Lead",
};

const tiktokEventMap: Partial<Record<SmartStoreEventName, string>> = {
  view_product: "ViewContent",
  search_product: "Search",
  add_to_cart: "AddToCart",
  start_checkout: "InitiateCheckout",
  checkout_whatsapp: "InitiateCheckout",
  purchase_lead: "Contact",
};

export function trackSmartStoreEvent(eventName: SmartStoreEventName, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ecommerce: payload });

  const metaEvent = metaEventMap[eventName];
  if (metaEvent && window.fbq) {
    window.fbq("track", metaEvent, payload);
  }

  const tiktokEvent = tiktokEventMap[eventName];
  if (tiktokEvent && window.ttq?.track) {
    window.ttq.track(tiktokEvent, payload);
  }
}
