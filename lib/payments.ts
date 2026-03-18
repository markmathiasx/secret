import MercadoPagoConfig, { Preference } from 'mercadopago';
import { getSiteUrl } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';

export async function createMercadoPagoPreference(input: {
  title: string;
  unitPrice: number;
  quantity?: number;
  externalReference: string;
  payerEmail?: string;
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  const siteUrl = getSiteUrl();
  const quantity = input.quantity || 1;
  const total = input.unitPrice * quantity;

  if (!accessToken) {
    return {
      ok: false,
      reason: 'missing_access_token',
      fallbackMessage: `Configure o MERCADOPAGO_ACCESS_TOKEN para gerar checkout real. Valor estimado: ${formatCurrency(total)}.`
    } as const;
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        external_reference: input.externalReference,
        items: [
          {
            id: input.externalReference,
            title: input.title,
            quantity,
            currency_id: 'BRL',
            unit_price: input.unitPrice
          }
        ],
        payer: input.payerEmail ? { email: input.payerEmail } : undefined,
        back_urls: {
          success: `${siteUrl}/checkout?status=success`,
          pending: `${siteUrl}/checkout?status=pending`,
          failure: `${siteUrl}/checkout?status=failure`
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/webhooks/mercadopago`
      }
    });

    return {
      ok: true,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      id: response.id
    } as const;
  } catch (error) {
    return {
      ok: false,
      reason: 'mercadopago_error',
      fallbackMessage: `Não foi possível abrir o checkout agora. Continue por Pix ou WhatsApp. Valor estimado: ${formatCurrency(total)}.`,
      details: error instanceof Error ? error.message : 'Falha desconhecida no Mercado Pago.'
    } as const;
  }
}
