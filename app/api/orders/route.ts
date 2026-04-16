import { NextResponse } from "next/server";
import { Prisma, PaymentMethod, PaymentProvider, PaymentStatus, ShipmentStatus, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { addressInputSchema, normalizeAddressInput } from "@/lib/address-book";
import { findProduct } from "@/lib/catalog";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getClientIp, checkRateLimit } from "@/lib/security";
import { getServerSessionUser } from "@/lib/server-session";
import { buildShippingQuote } from "@/lib/shipping";
import { storeRecord } from "@/lib/storage";

const orderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
  customerName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().trim().min(10).max(20),
  notes: z.string().max(600).optional().default(""),
  purpose: z.string().trim().max(40).optional().default("Uso próprio"),
  paymentMethod: z.enum(["pix", "cartao", "boleto"]),
  saveAddress: z.boolean().optional().default(false),
  addressId: z.string().optional(),
  shippingOptionId: z.enum(["standard", "express"]).default("standard"),
  address: addressInputSchema.extend({
    phone: z.string().trim().min(8).max(20).optional().default(""),
  }),
});

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function createOrderCode() {
  return `MDH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function mapPaymentMethod(method: "pix" | "cartao" | "boleto") {
  if (method === "cartao") return PaymentMethod.CARD;
  if (method === "boleto") return PaymentMethod.BOLETO;
  return PaymentMethod.PIX;
}

function buildOrderState(method: "pix" | "cartao" | "boleto") {
  if (method === "cartao") {
    return {
      status: OrderStatus.PENDING_PAYMENT,
      paymentProvider: PaymentProvider.MERCADO_PAGO,
      paymentStatus: PaymentStatus.PENDING,
      paymentStatusDetail: "checkout_pending",
      orderLabel: "aguardando pagamento no cartao",
    } as const;
  }

  if (method === "boleto") {
    return {
      status: OrderStatus.PENDING_PAYMENT,
      paymentProvider: PaymentProvider.MANUAL,
      paymentStatus: PaymentStatus.PENDING,
      paymentStatusDetail: "awaiting_boleto",
      orderLabel: "aguardando boleto",
    } as const;
  }

  return {
    status: OrderStatus.PENDING_PAYMENT,
    paymentProvider: PaymentProvider.MANUAL,
    paymentStatus: PaymentStatus.PENDING,
    paymentStatusDetail: "awaiting_payment",
    orderLabel: "aguardando pix",
  } as const;
}

async function maybePersistAddress(input: {
  userId: string | null | undefined;
  addressId?: string;
  saveAddress: boolean;
  address: z.infer<typeof orderSchema>["address"];
}) {
  const userId = input.userId;

  if (!userId || !(await canConnectToDatabase())) {
    return null;
  }

  const normalized = normalizeAddressInput(input.address);
  const shouldPersist = input.saveAddress || Boolean(input.addressId);

  if (!shouldPersist) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (normalized.isDefaultShipping) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefaultShipping: false },
      });
    }

    if (normalized.isDefaultBilling) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefaultBilling: false },
      });
    }

    if (input.addressId) {
      const existing = await tx.address.findFirst({
        where: {
          id: input.addressId,
          userId,
        },
      });

      if (existing) {
        return tx.address.update({
          where: { id: existing.id },
          data: normalized,
        });
      }
    }

    return tx.address.create({
      data: {
        userId,
        ...normalized,
      },
    });
  });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`order:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ ok: false, message: "Produto não encontrado." }, { status: 404 });
  }

  const address = normalizeAddressInput(parsed.data.address);
  const shippingQuote = buildShippingQuote({
    cep: address.zipCode,
    subtotal: Number((product.pricePix * parsed.data.quantity).toFixed(2)),
    quantity: parsed.data.quantity,
    weightGrams: product.grams,
  });
  const shippingOption = shippingQuote.options.find((option) => option.id === parsed.data.shippingOptionId) || shippingQuote.options[0];

  const orderCode = createOrderCode();
  const subtotalPix = Number((product.pricePix * parsed.data.quantity).toFixed(2));
  const subtotalCard = Number((product.priceCard * parsed.data.quantity).toFixed(2));
  const totalPix = Number((subtotalPix + shippingOption.price).toFixed(2));
  const totalCard = Number((subtotalCard + shippingOption.price).toFixed(2));
  const createdAt = new Date().toISOString();
  const orderState = buildOrderState(parsed.data.paymentMethod);
  const buyerId = user?.id || null;
  const savedAddress = await maybePersistAddress({
    userId: buyerId,
    addressId: parsed.data.addressId,
    saveAddress: parsed.data.saveAddress,
    address: parsed.data.address,
  });

  if (await canConnectToDatabase()) {
    try {
      const productRecord = await prisma.product.findUnique({
        where: { id: product.id },
        select: { id: true, sellerId: true, title: true, sku: true },
      });

      const paymentMethod = mapPaymentMethod(parsed.data.paymentMethod);
      const unitPrice = parsed.data.paymentMethod === "cartao" ? product.priceCard : product.pricePix;
      const grandTotal = parsed.data.paymentMethod === "cartao" ? totalCard : totalPix;

      const order = await prisma.order.create({
        data: {
          orderNumber: orderCode,
          buyerId,
          sellerId: productRecord?.sellerId || null,
          customerName: parsed.data.customerName,
          customerEmail: parsed.data.email.trim().toLowerCase(),
          customerPhone: parsed.data.phone,
          postalCode: address.zipCode,
          neighborhood: address.neighborhood,
          shippingAddressId: savedAddress?.id || null,
          billingAddressId: savedAddress?.id || null,
          status: orderState.status,
          paymentMethod,
          subtotal: toDecimal(parsed.data.paymentMethod === "cartao" ? subtotalCard : subtotalPix),
          shippingTotal: toDecimal(shippingOption.price),
          grandTotal: toDecimal(grandTotal),
          notes: [parsed.data.purpose, parsed.data.notes].filter(Boolean).join(" • ") || null,
          items: {
            create: {
              productId: productRecord?.id || null,
              title: productRecord?.title || product.name,
              sku: productRecord?.sku || product.sku,
              quantity: parsed.data.quantity,
              unitPrice: toDecimal(unitPrice),
              totalPrice: toDecimal(unitPrice * parsed.data.quantity),
              color: product.colors[0] || null,
              material: product.material,
            },
          },
          payments: {
            create: {
              method: paymentMethod,
              provider: orderState.paymentProvider,
              status: orderState.paymentStatus,
              amount: toDecimal(grandTotal),
              externalReference: orderCode,
              metadata: {
                shippingOptionId: shippingOption.id,
                shippingRegion: shippingOption.region,
                shippingEta: shippingOption.eta,
                purpose: parsed.data.purpose,
              },
            },
          },
          shipment: {
            create: {
              status: ShipmentStatus.DRAFT,
              carrier: "MDH Local",
              serviceLevel: shippingOption.id,
              quotedPrice: toDecimal(shippingOption.price),
              addressSnapshot: {
                ...address,
                phone: parsed.data.phone,
              },
              metadata: {
                region: shippingOption.region,
                eta: shippingOption.eta,
                provider: shippingOption.provider,
              },
            },
          },
        },
      });

      return NextResponse.json({
        ok: true,
        orderCode,
        storage: "prisma",
        totalPix,
        totalCard,
        shippingPrice: shippingOption.price,
        shippingEta: shippingOption.eta,
        shippingRegion: shippingOption.region,
        product: {
          id: product.id,
          name: product.name,
        },
        orderId: order.id,
      });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error instanceof Error ? error.message : "Falha ao criar pedido no banco.",
        },
        { status: 500 }
      );
    }
  }

  const result = await storeRecord("orders", {
    order_code: orderCode,
    product_id: product.id,
    product_name: product.name,
    quantity: parsed.data.quantity,
    customer_name: parsed.data.customerName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    neighborhood: address.neighborhood,
    cep: address.zipCode,
    address_label: address.label,
    address_line1: address.line1,
    address_line2: address.line2,
    city: address.city,
    state: address.state,
    country: address.country,
    shipping_option_id: shippingOption.id,
    shipping_region: shippingOption.region,
    shipping_eta: shippingOption.eta,
    shipping_price: shippingOption.price,
    purpose: parsed.data.purpose,
    payment_method: parsed.data.paymentMethod,
    notes: parsed.data.notes,
    total_pix: totalPix,
    total_card: totalCard,
    payment_provider: orderState.paymentProvider.toLowerCase(),
    payment_reference: null,
    payment_status: orderState.paymentStatus.toLowerCase(),
    payment_status_detail: orderState.paymentStatusDetail,
    payment_approved_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    status: orderState.orderLabel,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: "Falha ao criar pedido." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderCode,
    storage: result.storage,
    totalPix,
    totalCard,
    shippingPrice: shippingOption.price,
    shippingEta: shippingOption.eta,
    shippingRegion: shippingOption.region,
    product: {
      id: product.id,
      name: product.name,
    },
  });
}
