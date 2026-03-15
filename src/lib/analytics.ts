export const analyticsEventNames = [
  "view_home",
  "view_category",
  "view_product",
  "search",
  "filter_change",
  "add_to_cart",
  "begin_checkout",
  "order_payment_selected",
  "create_order",
  "order_created",
  "click_whatsapp",
  "admin_order_status_updated"
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsEventPayload = Record<string, unknown>;

export type AnalyticsEventInput = {
  eventName: AnalyticsEventName;
  scope?: "store" | "admin";
  path?: string;
  sessionId?: string;
  orderId?: string;
  productId?: string;
  customerId?: string;
  adminSessionId?: string;
  payload?: AnalyticsEventPayload;
};

export function sanitizeAnalyticsPayload(payload: AnalyticsEventPayload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}
