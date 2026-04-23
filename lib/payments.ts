import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { getSiteUrl } from '@/lib/env';
import { createMercadoPagoPayment as createMercadoPagoPaymentCore, normalizeMpPaymentFormData } from "@/lib/mercadopago";
import { formatCurrency } from '@/lib/utils';

function getMercadoPagoConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    return null;
  }

  return new MercadoPagoConfig({ accessToken });
}

export async function createMercadoPagoPreference(input: {
  title?: string;
  unitPrice?: number;
  quantity?: number;
  items?: Array<{
    id?: string;
    title: string;
    quantity?: number;
    unitPrice: number;
  }>;
  externalReference: string;
  payerEmail?: string;
  notificationUrl?: string;
  backUrls?: {
    success?: string;
    pending?: string;
    failure?: string;
  };
  autoReturn?: "approved" | "all";
}) {
  const siteUrl = getSiteUrl();
  const items =
    input.items && input.items.length > 0
      ? input.items.map((item, index) => ({
          id: item.id || `${input.externalReference}-${index + 1}`,
          title: item.title,
          quantity: item.quantity || 1,
          currency_id: "BRL",
          unit_price: item.unitPrice,
        }))
      : [
          {
            id: input.externalReference,
            title: input.title || "Pedido MDH 3D",
            quantity: input.quantity || 1,
            currency_id: "BRL",
            unit_price: input.unitPrice || 0,
          },
        ];
  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const client = getMercadoPagoConfig();

  if (!client) {
    return {
      ok: false,
      reason: 'missing_access_token',
      fallbackMessage: `Configure o MERCADOPAGO_ACCESS_TOKEN para gerar checkout real. Valor estimado: ${formatCurrency(total)}.`
    } as const;
  }

  try {
    const preference = new Preference(client);
    const backQuery = `order=${encodeURIComponent(input.externalReference)}`;
    const successUrl = input.backUrls?.success || `${siteUrl}/checkout?status=success&${backQuery}`;
    const pendingUrl = input.backUrls?.pending || `${siteUrl}/checkout?status=pending&${backQuery}`;
    const failureUrl = input.backUrls?.failure || `${siteUrl}/checkout?status=failure&${backQuery}`;

    const response = await preference.create({
      body: {
        external_reference: input.externalReference,
        items,
        payer: input.payerEmail ? { email: input.payerEmail } : undefined,
        back_urls: {
          success: successUrl,
          pending: pendingUrl,
          failure: failureUrl
        },
        auto_return: input.autoReturn || 'approved',
        notification_url: input.notificationUrl || `${siteUrl}/api/webhooks/mercadopago`
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

export async function createMercadoPagoPixPayment(input: {
  title: string;
  amount: number;
  externalReference: string;
  payerEmail?: string | null;
  customerName?: string | null;
}) {
  const siteUrl = getSiteUrl();
  const client = getMercadoPagoConfig();

  if (!client) {
    return {
      ok: false,
      reason: "missing_access_token",
      fallbackMessage: `Configure o MERCADOPAGO_ACCESS_TOKEN para gerar Pix dinâmico. Valor estimado: ${formatCurrency(input.amount)}.`,
    } as const;
  }

  const expirationMinutes = Number(process.env.MERCADOPAGO_PIX_EXPIRES_MINUTES || 60);
  const expiresAt = new Date(Date.now() + Math.max(15, expirationMinutes) * 60_000).toISOString();
  const [firstName, ...restName] = (input.customerName || "").trim().split(/\s+/).filter(Boolean);
  const lastName = restName.join(" ") || undefined;

  try {
    const payment = new Payment(client);
    const response = await payment.create({
      body: {
        transaction_amount: Number(input.amount.toFixed(2)),
        description: input.title,
        external_reference: input.externalReference,
        payment_method_id: "pix",
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        date_of_expiration: expiresAt,
        payer: {
          email: input.payerEmail || process.env.MERCADOPAGO_FALLBACK_EMAIL || "checkout@mdh3d.com.br",
          first_name: firstName || undefined,
          last_name: lastName,
        },
        metadata: {
          channel: "mdh-3d-store",
          orderCode: input.externalReference,
          paymentKind: "pix",
        },
      },
    });

    return {
      ok: true,
      paymentId: response.id ? String(response.id) : null,
      payload: response.point_of_interaction?.transaction_data?.qr_code || null,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url || null,
      status: response.status || "pending",
      statusDetail: response.status_detail || null,
      expiresAt: response.date_of_expiration || expiresAt,
      response,
    } as const;
  } catch (error) {
    return {
      ok: false,
      reason: "mercadopago_error",
      fallbackMessage: `Não foi possível abrir o Pix dinâmico agora. Continue com o Pix manual temporário. Valor estimado: ${formatCurrency(input.amount)}.`,
      details: error instanceof Error ? error.message : "Falha desconhecida ao criar o Pix dinâmico.",
    } as const;
  }
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  const client = getMercadoPagoConfig();

  if (!client) {
    return {
      ok: false,
      reason: 'missing_access_token'
    } as const;
  }

  try {
    const payment = new Payment(client);
    const response = await payment.get({ id: paymentId });

    return {
      ok: true,
      payment: response
    } as const;
  } catch (error) {
    return {
      ok: false,
      reason: 'mercadopago_error',
      details: error instanceof Error ? error.message : 'Falha desconhecida ao consultar pagamento.'
    } as const;
  }
}

export async function createMercadoPagoPayment(input: {
  title: string;
  amount: number;
  externalReference: string;
  paymentMethodId: string;
  payerEmail?: string | null;
  payerName?: string | null;
  paymentData?: unknown;
  notificationUrl?: string | null;
  dateOfExpiration?: string | null;
}) {
  const normalized = normalizeMpPaymentFormData(input.paymentData);
  return createMercadoPagoPaymentCore({
    title: input.title,
    amount: input.amount,
    externalReference: input.externalReference,
    paymentMethodId: input.paymentMethodId,
    payerEmail: input.payerEmail || normalized.payer.email || null,
    payerName: input.payerName || `${normalized.payer.firstName || ""} ${normalized.payer.lastName || ""}`.trim() || null,
    token: normalized.token,
    issuerId: normalized.issuerId,
    installments: normalized.installments,
    paymentMethodOptionId: normalized.paymentMethodOptionId,
    identification: normalized.identification,
    notificationUrl: input.notificationUrl,
    dateOfExpiration: input.dateOfExpiration,
    metadata: {
      paymentData: normalized.raw,
    },
  });
}
