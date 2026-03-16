import MercadoPagoConfig, { Preference } from "mercadopago";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_PRODUCTION_SITE_URL, siteUrl } from "@/lib/site";

export async function createMercadoPagoPreference(input: {
  title: string;
  unitPrice: number;
  quantity?: number;
  externalReference: string;
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      ok: false,
      reason: "missing_access_token",
      fallbackMessage: `Configure o MERCADOPAGO_ACCESS_TOKEN para gerar checkout real. Valor estimado: ${formatCurrency(input.unitPrice)}.`
    } as const;
  }

  if (siteUrl === DEFAULT_PRODUCTION_SITE_URL) {
    return {
      ok: false,
      reason: "missing_site_url",
      fallbackMessage: "Configure NEXT_PUBLIC_SITE_URL com o dominio publico da loja para ativar o checkout do Mercado Pago."
    } as const;
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      external_reference: input.externalReference,
      items: [
        {
          id: input.externalReference,
          title: input.title,
          quantity: input.quantity || 1,
          currency_id: "BRL",
          unit_price: input.unitPrice
        }
      ],
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
