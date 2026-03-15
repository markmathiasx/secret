export async function sendWhatsAppTemplate(input: {
  to: string;
  customerName: string;
  orderCode: string;
  status: string;
}) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "mdh_order_update";

  if (!phoneNumberId || !accessToken) {
    return { ok: false, reason: "missing_whatsapp_credentials" } as const;
  }

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to.replace(/\D/g, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: "pt_BR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: input.customerName },
              { type: "text", text: input.orderCode },
              { type: "text", text: input.status }
            ]
          }
        ]
      }
    })
  });

  if (!response.ok) {
    return { ok: false, reason: await response.text() } as const;
  }

  return { ok: true, data: await response.json() } as const;
}

export function buildWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
