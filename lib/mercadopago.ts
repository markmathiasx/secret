import { createHmac, timingSafeEqual } from "node:crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { getMercadoPagoAccessToken, getMercadoPagoAppId, getMercadoPagoPublicKey, getMercadoPagoStatementDescriptor, getMercadoPagoTimeoutMs, getMercadoPagoWebhookSecret, getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export type MercadoPagoInternalStatus =
  | "draft"
  | "pending_payment"
  | "pending_review"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "chargeback_open"
  | "chargeback_closed";

export type MercadoPagoPaymentMethod = string;

export type MercadoPagoPaymentInput = {
  title: string;
  amount: number;
  externalReference: string;
  paymentMethodId: MercadoPagoPaymentMethod;
  payerEmail?: string | null;
  payerName?: string | null;
  token?: string | null;
  issuerId?: string | number | null;
  installments?: number | null;
  paymentMethodOptionId?: string | null;
  identification?: {
    type?: string | null;
    number?: string | null;
  } | null;
  notificationUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  dateOfExpiration?: string | null;
  /** Prevents duplicate charges on network retries — pass a stable unique key per user+order */
  idempotencyKey?: string | null;
};

export function maskCredential(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (raw.length <= 8) return `${raw.slice(0, 2)}***`;
  return `${raw.slice(0, 4)}***${raw.slice(-4)}`;
}

export function createStableExternalReference(orderNumber: string) {
  return orderNumber.trim().toUpperCase();
}

export function normalizeMercadoPagoError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }
  if (typeof error === "string") {
    return { message: error, name: "MercadoPagoError" };
  }
  return { message: "Falha desconhecida no Mercado Pago.", name: "MercadoPagoError" };
}

export function getMercadoPagoClient() {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) return null;
  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: getMercadoPagoTimeoutMs(),
    },
  });
}

export function getMercadoPagoPublicSettings() {
  return {
    publicKey: getMercadoPagoPublicKey(),
    appId: getMercadoPagoAppId(),
    statementDescriptor: getMercadoPagoStatementDescriptor(),
  };
}

export function mapMercadoPagoPaymentStatus(status?: string | null, detail?: string | null): MercadoPagoInternalStatus {
  const normalized = (status || "").toLowerCase();
  const normalizedDetail = (detail || "").toLowerCase();

  if (normalized === "approved") return "paid";
  if (normalized === "pending" || normalized === "in_process" || normalized === "authorized") return "pending_payment";
  if (normalized === "rejected" || normalized === "cancelled") return "failed";
  if (normalized === "refunded") return "refunded";
  if (normalized === "charged_back") return "chargeback_open";
  if (normalizedDetail.includes("manual_review")) return "pending_review";
  if (normalizedDetail.includes("chargeback")) return "chargeback_open";
  if (normalizedDetail.includes("refund")) return "refunded";
  return "draft";
}

export function parseMercadoPagoSignature(signature: string) {
  return signature
    .split(",")
    .map((part) => part.trim().split("="))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {});
}

function matchesDigest(candidate: string, expected: string) {
  const left = Buffer.from(candidate, "hex");
  const right = Buffer.from(expected, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyMercadoPagoSignature(input: {
  secret: string;
  signature: string;
  requestId: string;
  dataId: string;
}) {
  const parts = parseMercadoPagoSignature(input.signature);
  const ts = parts.ts || "";
  const expected = parts.v1 || "";
  if (!ts || !expected || !input.dataId) return false;

  const candidates = [
    `id:${input.dataId};request-id:${input.requestId};ts:${ts};`,
    `id:${input.dataId};request-id:${input.requestId};ts:${ts}`,
    `id:${input.dataId};ts:${ts};`,
    `id:${input.dataId};ts:${ts}`,
  ];

  return candidates.some((manifest) => {
    const digest = createHmac("sha256", input.secret).update(manifest).digest("hex");
    return matchesDigest(digest, expected);
  });
}

export function normalizeMpPaymentFormData(value: unknown) {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const payer = data.payer && typeof data.payer === "object" ? (data.payer as Record<string, unknown>) : {};
  const identification = data.identification && typeof data.identification === "object" ? (data.identification as Record<string, unknown>) : {};

  const paymentMethodId = String(
    data.payment_method_id ||
      data.paymentMethodId ||
      data.paymentMethod ||
      data.type ||
    ""
  ).trim().toLowerCase();

  return {
    paymentMethodId: paymentMethodId as MercadoPagoPaymentMethod,
    token: String(data.token || data.card_token || "").trim() || null,
    issuerId: (() => {
      const value = data.issuer_id ?? data.issuerId;
      if (typeof value === "string" || typeof value === "number") return value;
      return null;
    })(),
    installments: Number(data.installments || data.issuerInstallments || 1) || 1,
    paymentMethodOptionId: String(data.payment_method_option_id || data.paymentMethodOptionId || "").trim() || null,
    payer: {
      email: String(payer.email || data.email || "").trim() || null,
      firstName: String(payer.first_name || payer.firstName || data.firstName || "").trim() || null,
      lastName: String(payer.last_name || payer.lastName || data.lastName || "").trim() || null,
    },
    identification: {
      type: String(identification.type || "").trim() || null,
      number: String(identification.number || "").trim() || null,
    },
    raw: data,
  };
}

export async function createMercadoPagoPayment(input: MercadoPagoPaymentInput) {
  const client = getMercadoPagoClient();
  if (!client) {
    return {
      ok: false,
      reason: "missing_access_token" as const,
      fallbackMessage: `Configure o MERCADOPAGO_ACCESS_TOKEN para gerar o pagamento. Valor estimado: ${formatCurrency(input.amount)}.`,
    };
  }

  const payment = new Payment(client);
  const body: Record<string, unknown> = {
    transaction_amount: Number(input.amount.toFixed(2)),
    description: input.title,
    external_reference: createStableExternalReference(input.externalReference),
    payment_method_id: input.paymentMethodId,
    notification_url: input.notificationUrl || `${getSiteUrl()}/api/webhooks/mercadopago`,
    statement_descriptor: getMercadoPagoStatementDescriptor(),
    metadata: {
      ...(input.metadata || {}),
      externalReference: createStableExternalReference(input.externalReference),
      appId: getMercadoPagoAppId() || undefined,
    },
    payer: input.payerEmail
      ? {
          email: input.payerEmail,
          first_name: input.payerName?.split(/\s+/)[0] || undefined,
          last_name: input.payerName?.split(/\s+/).slice(1).join(" ") || undefined,
        }
      : undefined,
  };

  if (input.paymentMethodId === "pix") {
    body.date_of_expiration = input.dateOfExpiration || undefined;
    if (input.payerEmail) {
      body.payer = {
        email: input.payerEmail,
        first_name: input.payerName?.split(/\s+/)[0] || undefined,
        last_name: input.payerName?.split(/\s+/).slice(1).join(" ") || undefined,
      };
    }
  } else {
    if (input.token) body.token = input.token;
    if (input.issuerId !== undefined && input.issuerId !== null) body.issuer_id = input.issuerId;
    if (input.installments) body.installments = input.installments;
    if (input.paymentMethodOptionId) body.payment_method_option_id = input.paymentMethodOptionId;
    if (input.identification?.type && input.identification?.number) {
      body.payer = {
        ...(body.payer as Record<string, unknown> | undefined),
        identification: {
          type: input.identification.type,
          number: input.identification.number,
        },
      };
    }
  }

  try {
    const response = await payment.create({
      body,
      requestOptions: input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    });
    return {
      ok: true as const,
      paymentId: response.id ? String(response.id) : null,
      status: response.status || null,
      statusDetail: response.status_detail || null,
      externalReference: String(response.external_reference || input.externalReference),
      paidAt: response.date_approved || null,
      pixPayload: response.point_of_interaction?.transaction_data?.qr_code || null,
      pixQrCode: response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url || null,
      dateOfExpiration: response.date_of_expiration || null,
      raw: response,
    } as const;
  } catch (error) {
    return {
      ok: false as const,
      reason: "mercadopago_error" as const,
      fallbackMessage: `Não foi possível concluir o pagamento agora. Valor estimado: ${formatCurrency(input.amount)}.`,
      details: normalizeMercadoPagoError(error),
    };
  }
}
