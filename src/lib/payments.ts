import MercadoPagoConfig, { Preference } from "mercadopago";
import { formatCurrency } from "@/lib/utils";

export async function createMercadoPagoPreference(input: {
  title: string;
  unitPrice?: number;
  quantity?: number;
  externalReference: string;
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
  payer?: {
    name?: string;
    email?: string;
  };
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const items =
    input.items?.length
      ? input.items
      : [
          {
            id: input.externalReference,
            title: input.title,
            quantity: input.quantity || 1,
            unitPrice: input.unitPrice || 0
          }
        ];
  const estimatedAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (!accessToken) {
    return {
      ok: false,
      reason: "missing_access_token",
      fallbackMessage: `Cartao esta indisponivel neste ambiente. O pedido continua salvo e voce pode fechar por Pix ou atendimento. Valor estimado: ${formatCurrency(estimatedAmount)}.`
    } as const;
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      external_reference: input.externalReference,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        currency_id: "BRL",
        unit_price: item.unitPrice
      })),
      payer: input.payer,
      back_urls: {
        success: `${siteUrl}/checkout/sucesso?order=${input.externalReference}`,
        pending: `${siteUrl}/checkout?status=pending&order=${input.externalReference}`,
        failure: `${siteUrl}/checkout?status=failure&order=${input.externalReference}`
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`
    }
  });

  return {
    ok: true,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
    id: response.id
  } as const;
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar pagamento ${paymentId} no Mercado Pago.`);
  }

  return response.json();
}
