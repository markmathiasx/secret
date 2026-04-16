import { createClient } from "@supabase/supabase-js";
import { OrderStatus, PaymentMethod, PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { storeBlobRecord, updateBlobOrderRecord } from "@/lib/blob-store";
import { getSupabaseEnv } from "@/lib/env";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export type StorageKind = "quotes" | "orders" | "quoteRequests";

type MemoryStore = {
  quotes: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  quoteRequests: Array<Record<string, unknown>>;
};

function getMemoryStore() {
  const scope = globalThis as typeof globalThis & { __mdhMemoryStore?: MemoryStore };

  if (!scope.__mdhMemoryStore) {
    scope.__mdhMemoryStore = {
      quotes: [],
      orders: [],
      quoteRequests: [],
    };
  }

  return scope.__mdhMemoryStore;
}

function getSupabaseAdmin() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getTableName(kind: StorageKind) {
  if (kind === "quotes") return process.env.SUPABASE_QUOTES_TABLE || "quotes";
  if (kind === "quoteRequests") return process.env.SUPABASE_QUOTE_REQUESTS_TABLE || "quote_requests";
  return process.env.SUPABASE_ORDERS_TABLE || "orders";
}

const SUPABASE_COLUMNS = {
  quotes: [
    "quote_id",
    "product_id",
    "product_name",
    "customername",
    "phone",
    "cep",
    "neighborhood",
    "distancekm",
    "colorpreference",
    "paymentmethod",
    "notes",
    "estimated_price_pix",
    "estimated_price_card",
    "estimated_delivery_fee",
    "estimated_total_pix",
    "created_at",
  ],
  quoteRequests: [
    "quote_id",
    "request_type",
    "customer_name",
    "phone",
    "email",
    "project_description",
    "project_size",
    "preferred_material",
    "preferred_color",
    "desired_deadline",
    "quantity",
    "reference_image_name",
    "reference_image_size",
    "model_file_name",
    "model_file_size",
    "source",
    "storage_mode",
    "details",
    "status",
    "created_at",
  ],
  ordersModern: [
    "order_code",
    "product_id",
    "product_name",
    "quantity",
    "customer_name",
    "email",
    "phone",
    "neighborhood",
    "cep",
    "payment_method",
    "notes",
    "total_pix",
    "total_card",
    "status",
    "created_at",
    "payment_provider",
    "payment_reference",
    "payment_status",
    "payment_status_detail",
    "payment_approved_at",
    "updated_at",
  ],
  ordersLegacy: [
    "order_code",
    "product_id",
    "product_name",
    "quantity",
    "customer_name",
    "email",
    "phone",
    "neighborhood",
    "cep",
    "payment_method",
    "notes",
    "total_pix",
    "total_card",
    "status",
    "created_at",
  ],
  ordersUpdateModern: [
    "status",
    "payment_method",
    "notes",
    "payment_provider",
    "payment_reference",
    "payment_status",
    "payment_status_detail",
    "payment_approved_at",
    "updated_at",
  ],
  ordersUpdateLegacy: ["status", "payment_method", "notes"],
} as const;

function pickSupabaseColumns(
  payload: Record<string, unknown>,
  columns: readonly string[]
) {
  const data: Record<string, unknown> = {};

  for (const column of columns) {
    const value = payload[column];
    if (value !== undefined) {
      data[column] = value;
    }
  }

  return data;
}

function buildSupabaseOrderNotes(payload: Record<string, unknown>) {
  const purpose = toStringValue(payload.purpose).trim();
  const notes = toStringValue(payload.notes).trim();
  const combined = [purpose, notes].filter(Boolean).join(" • ");
  return combined || undefined;
}

function getSupabaseInsertCandidates(kind: StorageKind, payload: Record<string, unknown>) {
  if (kind === "quotes") {
    return [pickSupabaseColumns(payload, SUPABASE_COLUMNS.quotes)];
  }

  if (kind === "quoteRequests") {
    return [pickSupabaseColumns(payload, SUPABASE_COLUMNS.quoteRequests)];
  }

  const sharedPayload = {
    ...payload,
    notes: buildSupabaseOrderNotes(payload) ?? payload.notes,
  };

  return [
    pickSupabaseColumns(sharedPayload, SUPABASE_COLUMNS.ordersModern),
    pickSupabaseColumns(sharedPayload, SUPABASE_COLUMNS.ordersLegacy),
  ].filter((candidate, index, list) => {
    const serialized = JSON.stringify(candidate);
    return serialized !== "{}" && list.findIndex((item) => JSON.stringify(item) === serialized) === index;
  });
}

function getSupabaseOrderUpdateCandidates(payload: Record<string, unknown>) {
  const sharedPayload = {
    ...payload,
    notes: buildSupabaseOrderNotes(payload) ?? payload.notes,
  };

  return [
    pickSupabaseColumns(sharedPayload, SUPABASE_COLUMNS.ordersUpdateModern),
    pickSupabaseColumns(sharedPayload, SUPABASE_COLUMNS.ordersUpdateLegacy),
  ].filter((candidate, index, list) => {
    const serialized = JSON.stringify(candidate);
    return serialized !== "{}" && list.findIndex((item) => JSON.stringify(item) === serialized) === index;
  });
}

function storeRecordInMemory(kind: StorageKind, payload: Record<string, unknown>) {
  const data = {
    id: crypto.randomUUID(),
    ...payload,
  };

  getMemoryStore()[kind].push(data);

  return {
    ok: true,
    storage: "memory" as const,
    data,
  };
}

function updateMemoryOrderRecord(orderCode: string, payload: Record<string, unknown>) {
  const order = getMemoryStore().orders.find((item) => item.order_code === orderCode);
  if (!order) {
    return {
      ok: false,
      storage: "memory" as const,
      error: "Pedido não encontrado.",
    };
  }

  Object.assign(order, payload);

  return {
    ok: true,
    storage: "memory" as const,
    data: order,
  };
}

export function getMemoryRecords(kind: StorageKind) {
  return [...getMemoryStore()[kind]];
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDecimal(value: unknown, fallback = 0) {
  return new Prisma.Decimal(toNumberValue(value, fallback).toFixed(2));
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function mapPaymentMethod(method: unknown) {
  const normalized = toStringValue(method).toLowerCase();
  if (normalized === "cartao" || normalized === "card") return PaymentMethod.CARD;
  if (normalized === "boleto") return PaymentMethod.BOLETO;
  return PaymentMethod.PIX;
}

function mapPaymentProvider(provider: unknown) {
  const normalized = toStringValue(provider).toLowerCase();
  if (normalized.includes("stripe")) return PaymentProvider.STRIPE;
  if (normalized.includes("mercado")) return PaymentProvider.MERCADO_PAGO;
  if (normalized.includes("pagseguro")) return PaymentProvider.PAGSEGURO;
  return PaymentProvider.MANUAL;
}

function mapPaymentStatus(status: unknown) {
  const normalized = toStringValue(status).toLowerCase();
  if (normalized.includes("paid") || normalized.includes("aprov")) return PaymentStatus.PAID;
  if (normalized.includes("refund")) return PaymentStatus.REFUNDED;
  if (normalized.includes("fail")) return PaymentStatus.FAILED;
  if (normalized.includes("action")) return PaymentStatus.REQUIRES_ACTION;
  if (normalized.includes("cancel")) return PaymentStatus.CANCELED;
  return PaymentStatus.PENDING;
}

function mapOrderStatus(status: unknown) {
  const normalized = toStringValue(status).toLowerCase();
  if (normalized.includes("entreg")) return OrderStatus.DELIVERED;
  if (normalized.includes("enviado")) return OrderStatus.SHIPPED;
  if (normalized.includes("imprim")) return OrderStatus.PRINTING;
  if (normalized.includes("paid") || normalized.includes("aprov")) return OrderStatus.PAID;
  if (normalized.includes("cancel")) return OrderStatus.CANCELED;
  if (normalized.includes("refund")) return OrderStatus.REFUNDED;
  return OrderStatus.PENDING_PAYMENT;
}

async function storeOrderInPrisma(payload: Record<string, unknown>) {
  const orderNumber = toStringValue(payload.order_code || payload.orderNumber);
  const paymentMethod = mapPaymentMethod(payload.payment_method);
  const totalPix = toNumberValue(payload.total_pix);
  const totalCard = toNumberValue(payload.total_card, totalPix);
  const amount = paymentMethod === PaymentMethod.CARD ? totalCard : totalPix;

  const order = await prisma.order.upsert({
    where: { orderNumber },
    update: {
      status: mapOrderStatus(payload.status),
      paymentMethod,
      customerName: toStringValue(payload.customer_name),
      customerEmail: toStringValue(payload.email).toLowerCase(),
      customerPhone: toStringValue(payload.phone),
      postalCode: toStringValue(payload.cep),
      neighborhood: toStringValue(payload.neighborhood),
      notes: toStringValue(payload.notes) || null,
      subtotal: toDecimal(totalPix || amount),
      grandTotal: toDecimal(amount),
      updatedAt: new Date(),
      paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : null,
    },
    create: {
      orderNumber,
      status: mapOrderStatus(payload.status),
      paymentMethod,
      customerName: toStringValue(payload.customer_name) || null,
      customerEmail: toStringValue(payload.email).toLowerCase() || null,
      customerPhone: toStringValue(payload.phone) || null,
      postalCode: toStringValue(payload.cep) || null,
      neighborhood: toStringValue(payload.neighborhood) || null,
      notes: toStringValue(payload.notes) || null,
      subtotal: toDecimal(totalPix || amount),
      grandTotal: toDecimal(amount),
      paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : null,
    },
  });

  await prisma.payment.upsert({
    where: { externalReference: orderNumber },
    update: {
      orderId: order.id,
      method: paymentMethod,
      provider: mapPaymentProvider(payload.payment_provider),
      status: mapPaymentStatus(payload.payment_status),
      amount: toDecimal(amount),
      providerPaymentId: toStringValue(payload.payment_reference) || null,
      pixPayload: toStringValue(payload.pix_payload) || null,
      paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : null,
      metadata: toJsonValue(payload),
    },
    create: {
      orderId: order.id,
      method: paymentMethod,
      provider: mapPaymentProvider(payload.payment_provider),
      status: mapPaymentStatus(payload.payment_status),
      amount: toDecimal(amount),
      externalReference: orderNumber,
      providerPaymentId: toStringValue(payload.payment_reference) || null,
      pixPayload: toStringValue(payload.pix_payload) || null,
      paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : null,
      metadata: toJsonValue(payload),
    },
  });

  return {
    id: order.id,
    order_code: order.orderNumber,
  };
}

async function storeQuoteInPrisma(payload: Record<string, unknown>) {
  const quote = await prisma.quoteEstimate.create({
    data: {
      quoteCode: toStringValue(payload.quote_id),
      customerName: toStringValue(payload.customername),
      email: toStringValue(payload.email) || null,
      phone: toStringValue(payload.phone) || null,
      neighborhood: toStringValue(payload.neighborhood) || null,
      postalCode: toStringValue(payload.cep) || null,
      distanceKm: toNumberValue(payload.distancekm, 0) || null,
      colorPreference: toStringValue(payload.colorpreference) || null,
      paymentMethod: mapPaymentMethod(payload.paymentmethod),
      notes: toStringValue(payload.notes) || null,
      estimatedPricePix: toDecimal(payload.estimated_price_pix),
      estimatedPriceCard: toDecimal(payload.estimated_price_card),
      estimatedDeliveryFee: toDecimal(payload.estimated_delivery_fee),
      estimatedTotalPix: toDecimal(payload.estimated_total_pix),
      productId: toStringValue(payload.product_id) || null,
    },
  });

  return {
    id: quote.id,
    quote_id: quote.quoteCode,
  };
}

async function storeQuoteRequestInPrisma(payload: Record<string, unknown>) {
  const quoteRequest = await prisma.quoteRequest.create({
    data: {
      quoteCode: toStringValue(payload.quote_id) || null,
      requestType: toStringValue(payload.request_type, "image-to-3d"),
      customerName: toStringValue(payload.customer_name) || null,
      phone: toStringValue(payload.phone) || null,
      email: toStringValue(payload.email) || null,
      projectDescription: toStringValue(payload.project_description) || null,
      projectSize: toStringValue(payload.project_size) || null,
      preferredMaterial: toStringValue(payload.preferred_material) || null,
      preferredColor: toStringValue(payload.preferred_color) || null,
      desiredDeadline: toStringValue(payload.desired_deadline) || null,
      quantity: toNumberValue(payload.quantity, 1),
      referenceImageName: toStringValue(payload.reference_image_name) || null,
      referenceImageSize: toNumberValue(payload.reference_image_size, 0) || null,
      modelFileName: toStringValue(payload.model_file_name) || null,
      modelFileSize: toNumberValue(payload.model_file_size, 0) || null,
      source: toStringValue(payload.source) || null,
      storageMode: toStringValue(payload.storage_mode) || null,
      status: toStringValue(payload.status, "recebido"),
      details: payload.details ? toJsonValue(payload.details) : undefined,
    },
  });

  return {
    id: quoteRequest.id,
    quote_id: quoteRequest.quoteCode,
  };
}

export async function storeRecord(kind: StorageKind, payload: Record<string, unknown>) {
  if (await canConnectToDatabase()) {
    try {
      const data =
        kind === "orders"
          ? await storeOrderInPrisma(payload)
          : kind === "quotes"
            ? await storeQuoteInPrisma(payload)
            : await storeQuoteRequestInPrisma(payload);

      return {
        ok: true,
        storage: "prisma" as const,
        data,
      };
    } catch {
      // Fall through to Supabase / memory so the storefront can still accept requests.
    }
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return storeRecordInMemory(kind, payload);
  }

  try {
    for (const candidate of getSupabaseInsertCandidates(kind, payload)) {
      const { data, error } = await supabase.from(getTableName(kind)).insert(candidate).select().single();

      if (!error) {
        return { ok: true, storage: "supabase" as const, data };
      }

      console.error("[storage] Supabase insert failed", {
        kind,
        table: getTableName(kind),
        columns: Object.keys(candidate),
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }
  } catch {
    console.error("[storage] Supabase insert threw", {
      kind,
      table: getTableName(kind),
    });
  }

  const blobResult = await storeBlobRecord(kind, payload);
  if (blobResult.ok) {
    return blobResult;
  }

  return storeRecordInMemory(kind, payload);
}

export async function updateOrderRecord(orderCode: string, payload: Record<string, unknown>) {
  const normalizedCode = orderCode.trim();
  if (!normalizedCode) {
    return {
      ok: false,
      storage: "memory" as const,
      error: "Código do pedido ausente.",
    };
  }

  if (await canConnectToDatabase()) {
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: normalizedCode },
      });

      if (existingOrder) {
        const order = await prisma.order.update({
          where: { orderNumber: normalizedCode },
          data: {
            status: payload.status ? mapOrderStatus(payload.status) : undefined,
            notes: payload.notes ? toStringValue(payload.notes) : undefined,
            paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : undefined,
            updatedAt: new Date(),
          },
        });

        await prisma.payment.upsert({
          where: { externalReference: normalizedCode },
          update: {
            orderId: order.id,
            method: payload.payment_method ? mapPaymentMethod(payload.payment_method) : undefined,
            provider: payload.payment_provider ? mapPaymentProvider(payload.payment_provider) : undefined,
            status: payload.payment_status ? mapPaymentStatus(payload.payment_status) : undefined,
            providerPaymentId: payload.payment_reference ? toStringValue(payload.payment_reference) : undefined,
            pixPayload: payload.pix_payload ? toStringValue(payload.pix_payload) : undefined,
            pixQrCode: payload.pix_qr_code ? toStringValue(payload.pix_qr_code) : undefined,
            boletoUrl: payload.boleto_url ? toStringValue(payload.boleto_url) : undefined,
            paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : undefined,
            metadata: toJsonValue(payload),
          },
          create: {
            orderId: order.id,
            method: mapPaymentMethod(payload.payment_method),
            provider: mapPaymentProvider(payload.payment_provider),
            status: mapPaymentStatus(payload.payment_status),
            amount: new Prisma.Decimal(order.grandTotal.toString()),
            externalReference: normalizedCode,
            providerPaymentId: toStringValue(payload.payment_reference) || null,
            pixPayload: toStringValue(payload.pix_payload) || null,
            pixQrCode: toStringValue(payload.pix_qr_code) || null,
            boletoUrl: toStringValue(payload.boleto_url) || null,
            paidAt: payload.payment_approved_at ? new Date(toStringValue(payload.payment_approved_at)) : null,
            metadata: toJsonValue(payload),
          },
        });

        return {
          ok: true,
          storage: "prisma" as const,
          data: {
            id: order.id,
            order_code: order.orderNumber,
          },
        };
      }
    } catch {
      // Fall through to Supabase / memory so checkout updates continue to work.
    }
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return updateMemoryOrderRecord(normalizedCode, payload);
  }

  try {
    for (const candidate of getSupabaseOrderUpdateCandidates(payload)) {
      const { data, error } = await supabase
        .from(getTableName("orders"))
        .update(candidate)
        .eq("order_code", normalizedCode)
        .select()
        .maybeSingle();

      if (!error && data) {
        return { ok: true, storage: "supabase" as const, data };
      }

      if (error) {
        console.error("[storage] Supabase update failed", {
          table: getTableName("orders"),
          orderCode: normalizedCode,
          columns: Object.keys(candidate),
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }
    }
  } catch {
    console.error("[storage] Supabase update threw", {
      table: getTableName("orders"),
      orderCode: normalizedCode,
    });
  }

  const blobResult = await updateBlobOrderRecord(normalizedCode, payload);
  if (blobResult.ok) {
    return blobResult;
  }

  return updateMemoryOrderRecord(normalizedCode, payload);
}
