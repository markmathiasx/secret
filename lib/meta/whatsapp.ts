import "server-only";
import { graphPost } from "./graph-api";
import { metaConfig } from "./config";
import type { GraphApiResponse } from "./types";

/** Send a WhatsApp OTP/notification via a pre-approved template. */
export async function sendWhatsAppTemplate(input: {
  to: string;
  templateName: string;
  locale?: string;
  bodyParams?: string[];
  copyCodeButton?: string;
}): Promise<GraphApiResponse> {
  const pid = metaConfig.phoneNumberId;
  const token = metaConfig.systemUserToken;
  if (!pid || !token) {
    return { ok: false, error: { message: "missing_credentials", type: "config", code: 0 } };
  }

  const components: unknown[] = [];
  if (input.bodyParams?.length) {
    components.push({
      type: "body",
      parameters: input.bodyParams.map((t) => ({ type: "text", text: t })),
    });
  }
  if (input.copyCodeButton) {
    components.push({
      type: "button",
      sub_type: "copy_code",
      index: 0,
      parameters: [{ type: "coupon_code", coupon_code: input.copyCodeButton }],
    });
  }

  return graphPost(`${pid}/messages`, {
    messaging_product: "whatsapp",
    to: input.to.replace(/\D/g, ""),
    type: "template",
    template: {
      name: input.templateName,
      language: { code: input.locale ?? "pt_BR" },
      ...(components.length ? { components } : {}),
    },
  });
}

/** Send a text message via WhatsApp Cloud API. */
export async function sendWhatsAppText(
  to: string,
  body: string
): Promise<GraphApiResponse> {
  const pid = metaConfig.phoneNumberId;
  if (!pid) {
    return { ok: false, error: { message: "missing_phone_number_id", type: "config", code: 0 } };
  }
  return graphPost(`${pid}/messages`, {
    messaging_product: "whatsapp",
    to: to.replace(/\D/g, ""),
    type: "text",
    text: { body },
  });
}

/** Send order-update template (existing 3-var template: customer, order code, status). */
export async function sendOrderUpdateTemplate(input: {
  to: string;
  customerName: string;
  orderCode: string;
  status: string;
}): Promise<GraphApiResponse> {
  return sendWhatsAppTemplate({
    to: input.to,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME ?? "mdh_order_update",
    bodyParams: [input.customerName, input.orderCode, input.status],
  });
}
