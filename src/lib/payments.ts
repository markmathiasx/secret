import MercadoPagoConfig, { Preference } from "mercadopago";
import { getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

type MercadoPagoPreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export async function createMercadoPagoPreference(input: {
  items: MercadoPagoPreferenceItem[];
  externalReference: string;
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const siteUrl = getSiteUrl();
  const estimatedTotal = input.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

  if (!accessToken) {
    return {
      ok: false,
      reason: "missing_access_token",
      fallbackMessage: `Configure o MERCADOPAGO_ACCESS_TOKEN para gerar checkout real. Valor estimado: ${formatCurrency(estimatedTotal)}.`
    } as const;
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      external_reference: input.externalReference,
      items: input.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        currency_id: "BRL",
        unit_price: item.unitPrice
      })),
      back_urls: {
        success: `${siteUrl}/checkout?status=success`,
        pending: `${siteUrl}/checkout?status=pending`,
        failure: `${siteUrl}/checkout?status=failure`
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
