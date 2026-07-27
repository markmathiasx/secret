import "server-only";
import { enqueueJob } from "@/src/lib/platform/jobs/queue";
import { whatsappNumber } from "@/lib/constants";

export type OrderStatus =
  | "confirmed"
  | "payment_received"
  | "in_production"
  | "quality_check"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed";

export type CustomerNotification = {
  type: "whatsapp" | "email" | "push";
  scheduledFor: string;
  template: string;
};

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function scheduleLifecycleJob(
  type:
    | "order_post_purchase"
    | "order_status_notification"
    | "delivery_confirmation"
    | "verified_review_request"
    | "cart_recovery"
    | "browse_recovery"
    | "re_engagement"
    | "growth_b2b_batch"
    | "ops_digest",
  payload: Record<string, unknown>,
  subjectKey: string
) {
  return enqueueJob(type, payload, {
    idempotencyKey: `${type}:${subjectKey}`,
    lockKey: type,
  });
}

export async function startPostPurchaseFlow(
  orderId: string,
  customerData: {
    phone: string;
    email: string;
    name: string;
    postalCode: string;
  }
) {
  const now = new Date();
  return [
    scheduleLifecycleJob(
      "order_post_purchase",
      {
        orderId,
        channel: "whatsapp",
        template: "order_confirmation",
        customerData,
        scheduledFor: now.toISOString(),
        summary: `Pedido ${orderId} confirmado com pós-venda inicial.`,
      },
      `${orderId}:confirmation`
    ),
    scheduleLifecycleJob(
      "order_status_notification",
      {
        orderId,
        channel: "whatsapp",
        template: "production_status",
        customerData,
        scheduledFor: addDays(now, 1),
        status: "in_production",
      },
      `${orderId}:in_production`
    ),
    scheduleLifecycleJob(
      "verified_review_request",
      {
        orderId,
        channel: "whatsapp",
        template: "nps_survey",
        customerData,
        scheduledFor: addDays(now, 8),
        reviewUrl: `https://mdh3d.com.br/avaliar/${orderId}`,
      },
      `${orderId}:review`
    ),
    scheduleLifecycleJob(
      "re_engagement",
      {
        orderId,
        channel: "whatsapp",
        template: "re_engagement",
        customerData,
        scheduledFor: addDays(now, 45),
        couponCode: "VOLTEI15",
      },
      `${orderId}:re_engagement`
    ),
  ];
}

export async function sendDeliveryNotification(
  orderId: string,
  customerData: { phone: string; email: string },
  deliveryPhoto?: string
) {
  return scheduleLifecycleJob(
    "delivery_confirmation",
    {
      orderId,
      channel: "whatsapp",
      template: "delivery_confirmation",
      customerData,
      deliveryPhoto: deliveryPhoto || null,
      scheduledFor: new Date().toISOString(),
    },
    `${orderId}:delivery_confirmation`
  );
}

export async function sendReviewRequest(
  orderId: string,
  customerData: { phone: string; name: string },
  productName: string
) {
  return scheduleLifecycleJob(
    "verified_review_request",
    {
      orderId,
      channel: "whatsapp",
      template: "review_request",
      customerData,
      productName,
      scheduledFor: new Date().toISOString(),
      reviewUrl: `https://mdh3d.com.br/review/${orderId}`,
    },
    `${orderId}:verified_review_request`
  );
}

export function generateTrackingLink(
  carrier: "correios" | "jadlog" | "azul",
  trackingCode: string
) {
  const links: Record<string, string> = {
    correios: `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(trackingCode)}`,
    jadlog: `https://www.jadlog.com.br/siteInstitucional/tracking/tracking?cte=${encodeURIComponent(trackingCode)}`,
    azul: `https://www.azulcargo.com.br/rastreamento/${encodeURIComponent(trackingCode)}`,
  };

  return links[carrier] || links.correios;
}

export async function sendAbandonedCartRecovery(
  sessionId: string,
  customerData: { phone?: string; email?: string; name?: string },
  cartItems: { name: string; price: number; image?: string }[]
) {
  if (!customerData.phone || cartItems.length === 0) return null;

  return scheduleLifecycleJob(
    "cart_recovery",
    {
      sessionId,
      channel: "whatsapp",
      template: "abandoned_cart",
      customerData,
      cartItems,
      scheduledFor: addDays(new Date(), 0),
      checkoutUrl: `https://mdh3d.com.br/checkout?recover=${sessionId}`,
    },
    `${sessionId}:cart_recovery`
  );
}

export async function sendBrowseAbandonment(
  sessionId: string,
  customerData: { phone?: string; email?: string },
  viewedProducts: { name: string; slug: string }[]
) {
  if (!customerData.phone || viewedProducts.length === 0) return null;

  return scheduleLifecycleJob(
    "browse_recovery",
    {
      sessionId,
      channel: "whatsapp",
      template: "browse_abandonment",
      customerData,
      viewedProducts,
      scheduledFor: addDays(new Date(), 0),
      productUrl: `https://mdh3d.com.br/catalogo/${viewedProducts[0]?.slug || ""}`,
    },
    `${sessionId}:browse_recovery`
  );
}

export function getStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    confirmed: "Confirmado",
    payment_received: "Pagamento recebido",
    in_production: "Em produção",
    quality_check: "Controle de qualidade",
    shipped: "Enviado",
    out_for_delivery: "Saiu para entrega",
    delivered: "Entregue",
    completed: "Concluído",
  };
  return labels[status];
}

export function buildHumanFallbackMessage(orderId: string) {
  return `Se preferir tratar manualmente, responda no WhatsApp +${whatsappNumber} e mencione o pedido ${orderId}.`;
}
