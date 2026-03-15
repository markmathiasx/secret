import "server-only";

import { and, asc, desc, eq, ilike, inArray, like, or } from "drizzle-orm";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db/client";
import {
  addresses,
  adminNotes,
  customers,
  orderEvents,
  orderItems,
  orders,
  paymentRecords,
  products,
  sourceChannels,
  type AdminNoteRow,
  type CustomerRow,
  type OrderEventRow,
  type OrderItemRow,
  type OrderRow,
  type PaymentRecordRow,
  type ProductRow
} from "@/db/schema";
import {
  contactPreferenceLabels,
  operationalStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  sourceChannelLabels,
  type ContactPreference,
  type OperationalStatus,
  type PaymentMethod,
  type PaymentStatus,
  type SourceChannelId
} from "@/lib/commerce";
import { type Product } from "@/lib/catalog";

export const customerSchema = z.object({
  fullName: z.string().min(3).max(160),
  whatsapp: z.string().min(10).max(20),
  email: z.string().email().max(160).optional().or(z.literal("")),
  contactPreference: z.enum(["whatsapp", "email", "phone"]).default("whatsapp"),
  notes: z.string().max(400).optional().or(z.literal("")),
  postalCode: z.string().min(8).max(10),
  street: z.string().min(3).max(180),
  number: z.string().min(1).max(20),
  complement: z.string().max(120).optional().or(z.literal("")),
  reference: z.string().max(160).optional().or(z.literal("")),
  neighborhood: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(2)
});

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(50)
});

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(checkoutItemSchema).min(1).max(50),
  paymentMethod: z.enum(["pix", "card", "cash", "other"]),
  sourceChannelId: z
    .enum(["site", "whatsapp", "instagram", "shopee", "mercado_livre", "amazon", "americanas", "other"])
    .default("site"),
  shippingAmount: z.coerce.number().min(0).max(500).default(0),
  customerNotes: z.string().max(600).optional().or(z.literal("")),
  whatsappReference: z.string().max(160).optional().or(z.literal("")),
  marketplaceReference: z.string().max(160).optional().or(z.literal(""))
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().min(5).max(32),
  credential: z.string().min(5).max(160)
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

type OrderListFilters = {
  query?: string;
  operationalStatus?: OperationalStatus | "";
  paymentStatus?: PaymentStatus | "";
  paymentMethod?: PaymentMethod | "";
  sourceChannelId?: SourceChannelId | "";
};

type OrderJoined = {
  order: OrderRow;
  customer: CustomerRow;
  address: {
    postalCode: string;
    street: string;
    number: string;
    complement: string | null;
    reference: string | null;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  items: OrderItemRow[];
  payments: PaymentRecordRow[];
  events: OrderEventRow[];
  notes: AdminNoteRow[];
};

function assertDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL não configurada. Configure o banco antes de operar pedidos reais.");
  }
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function toDateSegment(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function formatAddressSummary(address: OrderJoined["address"]) {
  if (!address) return "Retirada/combinar";
  return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ""} - ${address.neighborhood}, ${address.city}/${address.state}`;
}

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    category: row.category,
    theme: row.theme,
    collection: row.collection,
    colors: row.colors,
    grams: row.grams,
    hours: row.hours,
    complexity: row.complexity,
    featured: row.featured,
    published: row.published,
    description: row.description,
    merchandising: row.merchandising || "",
    tags: row.tags,
    materials: row.materials,
    finishNotes: row.finishNotes || "",
    pricePix: row.pricePix,
    priceCard: row.priceCard,
    marketplaceSuggested: row.marketplaceSuggested ?? row.priceCard,
    productionWindow: row.productionWindow,
    imageHint: row.name,
    imageQuery: row.name,
    imagePath: row.imagePath,
    imageAlt: row.imageAlt || row.name,
    imageStatus: row.imageStatus,
    sortOrder: row.sortOrder,
    metadata: row.metadata
  };
}

async function nextOrderNumber(tx: any) {
  const segment = toDateSegment();
  const existing = await tx
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(like(orders.orderNumber, `MDH-${segment}-%`));

  const next = String(existing.length + 1).padStart(4, "0");
  return `MDH-${segment}-${next}`;
}

async function upsertCustomerAndAddress(tx: any, input: CreateOrderInput["customer"]) {
  const whatsapp = normalizePhone(input.whatsapp);
  const email = input.email?.trim().toLowerCase() || null;

  const [existingCustomer] = await tx
    .select()
    .from(customers)
    .where(email ? or(eq(customers.whatsapp, whatsapp), eq(customers.email, email)) : eq(customers.whatsapp, whatsapp))
    .limit(1);

  let customerId = existingCustomer?.id;

  if (existingCustomer) {
    await tx
      .update(customers)
      .set({
        fullName: input.fullName,
        whatsapp,
        email,
        contactPreference: input.contactPreference as ContactPreference,
        notes: input.notes || null,
        updatedAt: new Date()
      })
      .where(eq(customers.id, existingCustomer.id));
  } else {
    const [createdCustomer] = await tx
      .insert(customers)
      .values({
        fullName: input.fullName,
        whatsapp,
        email,
        contactPreference: input.contactPreference as ContactPreference,
        notes: input.notes || null
      })
      .returning({ id: customers.id });

    customerId = createdCustomer.id;
  }

  const [address] = await tx
    .insert(addresses)
    .values({
      customerId: customerId!,
      postalCode: input.postalCode,
      street: input.street,
      number: input.number,
      complement: input.complement || null,
      reference: input.reference || null,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state.toUpperCase()
    })
    .returning({ id: addresses.id });

  return {
    customerId: customerId!,
    addressId: address.id,
    normalizedWhatsapp: whatsapp,
    email
  };
}

export async function upsertCustomerProfile(input: z.infer<typeof customerSchema>) {
  assertDatabase();
  const parsed = customerSchema.parse(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    const data = await upsertCustomerAndAddress(tx, parsed);
    return data;
  });
}

export async function createOrder(input: CreateOrderInput) {
  assertDatabase();
  const parsed = createOrderSchema.parse(input);
  const db = getDb();

  return db.transaction(async (tx) => {
    const requestedIds = parsed.items.map((item) => item.productId);
    const productRows = await tx.select().from(products).where(inArray(products.id, requestedIds));

    if (productRows.length !== requestedIds.length) {
      throw new Error("Um ou mais produtos do pedido não foram encontrados.");
    }

    const productMap = new Map(productRows.map((product) => [product.id, product]));
    const itemLines = parsed.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("Produto ausente no catálogo.");
      return {
        product,
        quantity: item.quantity,
        lineTotalPix: Number((product.pricePix * item.quantity).toFixed(2)),
        lineTotalCard: Number((product.priceCard * item.quantity).toFixed(2))
      };
    });

    const subtotalPix = Number(itemLines.reduce((sum, line) => sum + line.lineTotalPix, 0).toFixed(2));
    const subtotalCard = Number(itemLines.reduce((sum, line) => sum + line.lineTotalCard, 0).toFixed(2));
    const totalAmount = Number(
      (
        (parsed.paymentMethod === "card" ? subtotalCard : subtotalPix) +
        parsed.shippingAmount
      ).toFixed(2)
    );

    const operationalStatus: OperationalStatus = "waiting_payment";
    const paymentStatus: PaymentStatus = "pending";
    const { customerId, addressId } = await upsertCustomerAndAddress(tx, parsed.customer);
    const orderNumber = await nextOrderNumber(tx);

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        customerId,
        addressId,
        sourceChannelId: parsed.sourceChannelId,
        operationalStatus,
        paymentStatus,
        paymentMethod: parsed.paymentMethod,
        subtotalPix,
        subtotalCard,
        shippingAmount: parsed.shippingAmount,
        totalAmount,
        customerNotes: parsed.customerNotes || null,
        whatsappReference: parsed.whatsappReference || null,
        marketplaceReference: parsed.marketplaceReference || null
      })
      .returning();

    await tx.insert(orderItems).values(
      itemLines.map((line) => ({
        orderId: order.id,
        productId: line.product.id,
        productName: line.product.name,
        sku: line.product.sku,
        quantity: line.quantity,
        unitPricePix: line.product.pricePix,
        unitPriceCard: line.product.priceCard,
        lineTotalPix: line.lineTotalPix,
        lineTotalCard: line.lineTotalCard,
        imagePath: line.product.imagePath
      }))
    );

    await tx.insert(paymentRecords).values({
      orderId: order.id,
      method: parsed.paymentMethod,
      status: paymentStatus,
      provider: parsed.paymentMethod === "card" ? "mercadopago" : "manual",
      amount: totalAmount,
      pixReference: parsed.paymentMethod === "pix" ? orderNumber : null
    });

    await tx.insert(orderEvents).values({
      orderId: order.id,
      eventType: "order_created",
      description: `Pedido criado no canal ${sourceChannelLabels[parsed.sourceChannelId]}.`,
      nextOperationalStatus: operationalStatus,
      nextPaymentStatus: paymentStatus
    });

    return {
      order,
      items: itemLines.map((line) => ({
        product: mapProductRow(line.product),
        quantity: line.quantity,
        lineTotalPix: line.lineTotalPix,
        lineTotalCard: line.lineTotalCard
      }))
    };
  });
}

export async function getOrderDetail(orderId: string) {
  assertDatabase();
  const db = getDb();

  const [orderRow] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!orderRow) return null;

  const [customerRow] = await db.select().from(customers).where(eq(customers.id, orderRow.customerId)).limit(1);
  const [addressRow] = orderRow.addressId
    ? await db.select().from(addresses).where(eq(addresses.id, orderRow.addressId)).limit(1)
    : [null];

  const [items, payments, events, notes, [channel]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.createdAt)),
    db.select().from(paymentRecords).where(eq(paymentRecords.orderId, orderId)).orderBy(desc(paymentRecords.createdAt)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, orderId)).orderBy(desc(orderEvents.createdAt)),
    db.select().from(adminNotes).where(eq(adminNotes.orderId, orderId)).orderBy(desc(adminNotes.createdAt)),
    db.select().from(sourceChannels).where(eq(sourceChannels.id, orderRow.sourceChannelId)).limit(1)
  ]);

  return {
    order: orderRow,
    customer: customerRow!,
    address: addressRow,
    items,
    payments,
    events,
    notes,
    channel
  };
}

export async function getOrderByNumber(orderNumber: string) {
  assertDatabase();
  const db = getDb();
  const [orderRow] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return orderRow ? getOrderDetail(orderRow.id) : null;
}

export async function lookupPublicOrder(input: z.infer<typeof orderLookupSchema>) {
  assertDatabase();
  const parsed = orderLookupSchema.parse(input);
  const normalizedCredential = normalizePhone(parsed.credential);
  const db = getDb();

  const [orderRow] = await db.select().from(orders).where(eq(orders.orderNumber, parsed.orderNumber)).limit(1);
  if (!orderRow) return null;

  const [customerRow] = await db.select().from(customers).where(eq(customers.id, orderRow.customerId)).limit(1);
  if (!customerRow) return null;

  const credentialMatches =
    customerRow.email?.toLowerCase() === parsed.credential.trim().toLowerCase() ||
    normalizePhone(customerRow.whatsapp) === normalizedCredential;

  if (!credentialMatches) return null;

  return getOrderDetail(orderRow.id);
}

export async function listOrders(filters: OrderListFilters = {}) {
  assertDatabase();
  const db = getDb();
  const rows = await db
    .select({
      order: orders,
      customer: customers,
      channel: sourceChannels
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(sourceChannels, eq(sourceChannels.id, orders.sourceChannelId))
    .where(
      and(
        filters.operationalStatus ? eq(orders.operationalStatus, filters.operationalStatus) : undefined,
        filters.paymentStatus ? eq(orders.paymentStatus, filters.paymentStatus) : undefined,
        filters.paymentMethod ? eq(orders.paymentMethod, filters.paymentMethod) : undefined,
        filters.sourceChannelId ? eq(orders.sourceChannelId, filters.sourceChannelId) : undefined,
        filters.query
          ? or(
              ilike(orders.orderNumber, `%${filters.query}%`),
              ilike(customers.fullName, `%${filters.query}%`),
              ilike(customers.whatsapp, `%${filters.query}%`),
              ilike(customers.email, `%${filters.query}%`)
            )
          : undefined
      )
    )
    .orderBy(desc(orders.placedAt));

  const orderIds = rows.map((row) => row.order.id);
  const paymentMap = new Map<string, PaymentRecordRow[]>();

  if (orderIds.length) {
    const paymentRows = await db
      .select()
      .from(paymentRecords)
      .where(inArray(paymentRecords.orderId, orderIds))
      .orderBy(desc(paymentRecords.createdAt));

    for (const payment of paymentRows) {
      const list = paymentMap.get(payment.orderId) || [];
      list.push(payment);
      paymentMap.set(payment.orderId, list);
    }
  }

  return rows.map((row) => ({
    ...row,
    latestPayment: paymentMap.get(row.order.id)?.[0] || null
  }));
}

export async function getDashboardStats() {
  const items = await listOrders();
  const todaySegment = new Date().toISOString().slice(0, 10);
  const totalSold = items.reduce((sum, item) => sum + item.order.totalAmount, 0);

  return {
    totalOrders: items.length,
    totalSold,
    ordersToday: items.filter((item) => item.order.placedAt.toISOString().slice(0, 10) === todaySegment).length,
    pendingOrders: items.filter(
      (item) => !["completed", "delivered", "canceled"].includes(item.order.operationalStatus)
    ).length,
    waitingPayment: items.filter((item) => item.order.paymentStatus === "pending" || item.order.paymentStatus === "waiting_proof").length,
    inProduction: items.filter((item) => item.order.operationalStatus === "in_production").length,
    completed: items.filter((item) => item.order.operationalStatus === "completed").length,
    delivered: items.filter((item) => item.order.operationalStatus === "delivered").length,
    canceled: items.filter((item) => item.order.operationalStatus === "canceled").length
  };
}

export async function appendOrderEvent(input: {
  orderId: string;
  eventType:
    | "order_created"
    | "payment_status_changed"
    | "operational_status_changed"
    | "note_added"
    | "manual_order_created"
    | "payment_reference_created"
    | "payment_webhook_received"
    | "customer_updated";
  description: string;
  previousOperationalStatus?: OperationalStatus | null;
  nextOperationalStatus?: OperationalStatus | null;
  previousPaymentStatus?: PaymentStatus | null;
  nextPaymentStatus?: PaymentStatus | null;
  adminActor?: string | null;
}) {
  assertDatabase();
  const db = getDb();

  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: input.eventType,
    description: input.description,
    previousOperationalStatus: input.previousOperationalStatus || null,
    nextOperationalStatus: input.nextOperationalStatus || null,
    previousPaymentStatus: input.previousPaymentStatus || null,
    nextPaymentStatus: input.nextPaymentStatus || null,
    adminActor: input.adminActor || null
  });
}

export async function updateOrderOperationalStatus(input: {
  orderId: string;
  nextStatus: OperationalStatus;
  adminActor: string;
}) {
  assertDatabase();
  const db = getDb();
  const detail = await getOrderDetail(input.orderId);
  if (!detail) throw new Error("Pedido não encontrado.");

  await db
    .update(orders)
    .set({ operationalStatus: input.nextStatus, updatedAt: new Date() })
    .where(eq(orders.id, input.orderId));

  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: "operational_status_changed",
    description: `Status operacional alterado para ${operationalStatusLabels[input.nextStatus]}.`,
    previousOperationalStatus: detail.order.operationalStatus,
    nextOperationalStatus: input.nextStatus,
    adminActor: input.adminActor
  });
}

export async function updateOrderPayment(input: {
  orderId: string;
  status: PaymentStatus;
  verificationNote?: string;
  pixReference?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardHolderName?: string;
  adminActor: string;
}) {
  assertDatabase();
  const db = getDb();
  const detail = await getOrderDetail(input.orderId);
  if (!detail) throw new Error("Pedido não encontrado.");

  const latestPayment = detail.payments[0];

  if (latestPayment) {
    await db
      .update(paymentRecords)
      .set({
        status: input.status,
        verificationNote: input.verificationNote || latestPayment.verificationNote,
        pixReference: input.pixReference || latestPayment.pixReference,
        cardBrand: input.cardBrand || latestPayment.cardBrand,
        cardLast4: input.cardLast4 || latestPayment.cardLast4,
        cardHolderName: input.cardHolderName || latestPayment.cardHolderName,
        confirmedAt: input.status === "paid" ? new Date() : latestPayment.confirmedAt,
        updatedAt: new Date()
      })
      .where(eq(paymentRecords.id, latestPayment.id));
  }

  await db
    .update(orders)
    .set({ paymentStatus: input.status, updatedAt: new Date() })
    .where(eq(orders.id, input.orderId));

  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: "payment_status_changed",
    description: `Pagamento alterado para ${paymentStatusLabels[input.status]}.`,
    previousPaymentStatus: detail.order.paymentStatus,
    nextPaymentStatus: input.status,
    adminActor: input.adminActor
  });
}

export async function createAdminNote(input: { orderId: string; content: string; author: string }) {
  assertDatabase();
  const db = getDb();

  await db.insert(adminNotes).values({
    orderId: input.orderId,
    author: input.author,
    content: input.content
  });

  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: "note_added",
    description: "Nota interna adicionada ao pedido.",
    adminActor: input.author
  });
}

export async function attachPaymentProviderData(input: {
  orderId: string;
  provider: string;
  providerPaymentId?: string;
  verificationNote?: string;
  rawPayload?: Record<string, unknown>;
}) {
  assertDatabase();
  const db = getDb();
  const detail = await getOrderDetail(input.orderId);
  if (!detail?.payments[0]) throw new Error("Registro de pagamento não encontrado.");

  await db
    .update(paymentRecords)
    .set({
      provider: input.provider,
      providerPaymentId: input.providerPaymentId || detail.payments[0].providerPaymentId,
      verificationNote: input.verificationNote || detail.payments[0].verificationNote,
      rawPayload: input.rawPayload || detail.payments[0].rawPayload,
      updatedAt: new Date()
    })
    .where(eq(paymentRecords.id, detail.payments[0].id));

  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: "payment_reference_created",
    description: `Referência de pagamento registrada no provedor ${input.provider}.`
  });
}

export async function buildOrderWhatsAppSummary(orderId: string) {
  const detail = await getOrderDetail(orderId);
  if (!detail) return null;

  const items = detail.items
    .map((item) => `- ${item.productName} x${item.quantity} (${item.lineTotalPix.toFixed(2)} no Pix)`)
    .join("\n");

  const paymentMethodLabel = paymentMethodLabels[detail.order.paymentMethod];
  const sourceLabel = sourceChannelLabels[detail.order.sourceChannelId as SourceChannelId] || detail.order.sourceChannelId;
  const addressSummary = formatAddressSummary(detail.address);

  const message = [
    `Pedido ${detail.order.orderNumber} - MDH 3D`,
    ``,
    `Nome: ${detail.customer.fullName}`,
    `WhatsApp: ${detail.customer.whatsapp}`,
    `Email: ${detail.customer.email || "nao informado"}`,
    `Contato preferido: ${contactPreferenceLabels[detail.customer.contactPreference as ContactPreference]}`,
    `Cidade/UF: ${detail.address ? `${detail.address.city}/${detail.address.state}` : "combinar"}`,
    `Endereco resumido: ${addressSummary}`,
    `Origem: ${sourceLabel}`,
    `Forma de pagamento: ${paymentMethodLabel}`,
    `Total Pix: R$ ${detail.order.subtotalPix.toFixed(2)}`,
    `Total Cartao: R$ ${detail.order.subtotalCard.toFixed(2)}`,
    `Frete: R$ ${detail.order.shippingAmount.toFixed(2)}`,
    `Total pedido: R$ ${detail.order.totalAmount.toFixed(2)}`,
    ``,
    `Itens:`,
    items,
    detail.order.customerNotes ? `` : "",
    detail.order.customerNotes ? `Observacoes: ${detail.order.customerNotes}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return {
    detail,
    message
  };
}
