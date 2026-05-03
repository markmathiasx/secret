import { NextResponse } from "next/server";
import { OrderStatus, PaymentMethod, PaymentProvider, PaymentStatus, Prisma, ShipmentStatus } from "@prisma/client";
import { z } from "zod";
import { addressInputSchema, normalizeAddressInput } from "@/lib/address-book";
import type { CartItemInput } from "@/lib/cart-types";
import { calculateCartTotals, summarizeCartItems } from "@/lib/checkout";
import { createOrderAccessToken, orderAccessCookieName, orderAccessMaxAgeSeconds } from "@/lib/order-access";
import { createMercadoPagoPreference } from "@/lib/payments";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getClientIp, checkRateLimit } from "@/lib/security";
import { sendMail } from "@/lib/mailer";
import { orderConfirmationHtml } from "@/lib/email-templates";
import { getSiteUrl } from "@/lib/env";
import { findStorefrontProductById } from "@/lib/products";
import { findProduct } from "@/lib/catalog";
import { quoteBestShipping } from "@/lib/melhor-envio";
import { storeRecord } from "@/lib/storage";

const preferenceSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
        personalizationText: z.string().trim().max(240).optional().default(""),
      })
    )
    .min(1)
    .max(20),
  customerName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().trim().min(10).max(20),
  notes: z.string().trim().max(600).optional().default(""),
  address: addressInputSchema.extend({
    phone: z.string().trim().min(8).max(20).optional().default(""),
  }),
});

type ResolvedOrderItem = CartItemInput & {
  sku: string;
  sourceProductId: string | null;
  productionWindow: string;
  material: string;
  grams: number;
  dimensions: string;
};

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function createOrderCode() {
  return `MDH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getOrderHeadline(items: ResolvedOrderItem[]) {
  if (items.length === 1) {
    return items[0]?.title || "Pedido MDH 3D";
  }

  const [first, ...rest] = items;
  return `${first.title} + ${rest.length} ${rest.length === 1 ? "item" : "itens"}`;
}

function getProductionWindowLabel(items: ResolvedOrderItem[]) {
  return Array.from(new Set(items.map((item) => item.productionWindow))).join(" • ");
}

function buildOrderResponse(payload: Record<string, unknown>, access: { orderCode: string; email: string; customerName: string }) {
  return (async () => {
    const response = NextResponse.json(payload);
    const token = await createOrderAccessToken({
      orderCode: access.orderCode,
      customerEmail: access.email,
      customerName: access.customerName,
    });

    if (token) {
      response.cookies.set({
        name: orderAccessCookieName,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: orderAccessMaxAgeSeconds,
      });
    }

    return response;
  })();
}

function resolveOrderItems(items: z.infer<typeof preferenceSchema>["items"]) {
  return items.map<ResolvedOrderItem>((item) => {
    const storefrontProduct = findStorefrontProductById(item.productId);
    if (storefrontProduct) {
      const catalogProduct = storefrontProduct.sourceId ? findProduct(storefrontProduct.sourceId) : findProduct(item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        title: storefrontProduct.name,
        pricePix: storefrontProduct.pricePix,
        priceCard: storefrontProduct.priceCard,
        image: storefrontProduct.images[0],
        personalizationText: item.personalizationText || undefined,
        sku: storefrontProduct.sku,
        sourceProductId: storefrontProduct.sourceId,
        productionWindow: storefrontProduct.productionWindow,
        material: storefrontProduct.material,
        grams: catalogProduct?.grams || 120,
        dimensions: catalogProduct?.dimensions || "16x12x8cm",
      };
    }

    const catalogProduct = findProduct(item.productId);
    if (!catalogProduct) {
      throw new Error(`Produto inválido: ${item.productId}`);
    }

    return {
      productId: item.productId,
      quantity: item.quantity,
      title: catalogProduct.name,
      pricePix: catalogProduct.pricePix,
      priceCard: catalogProduct.priceCard,
      image: catalogProduct.images?.[0] || catalogProduct.image,
      personalizationText: item.personalizationText || undefined,
      sku: catalogProduct.sku,
      sourceProductId: catalogProduct.id,
      productionWindow: catalogProduct.productionWindow,
      material: catalogProduct.material,
      grams: catalogProduct.grams,
      dimensions: catalogProduct.dimensions,
    };
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`checkout:preference:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Aguarde alguns instantes." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = preferenceSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Dados inválidos para gerar o checkout.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let orderItems: ResolvedOrderItem[];

  try {
    orderItems = resolveOrderItems(parsed.data.items);
  } catch {
    return NextResponse.json({ ok: false, message: "Um ou mais produtos não estão disponíveis." }, { status: 404 });
  }

  const orderCode = createOrderCode();
  const address = normalizeAddressInput(parsed.data.address);
  const shippingQuote = await quoteBestShipping({
    cep: address.zipCode,
    products: orderItems.map((item) => ({
      id: item.sku,
      name: item.title,
      quantity: item.quantity,
      unitPrice: item.pricePix,
      weightGrams: item.grams,
      dimensions: item.dimensions,
    })),
  });
  const selectedShipping =
    shippingQuote.quote.options.find((option) => option.id === shippingQuote.quote.recommendedOptionId) ||
    shippingQuote.quote.options[0];
  const totals = calculateCartTotals(orderItems, selectedShipping?.price ?? undefined);
  const orderHeadline = getOrderHeadline(orderItems);
  const productionWindow = getProductionWindowLabel(orderItems);
  const itemSummary = summarizeCartItems(orderItems);
  const siteUrl = getSiteUrl();

  if (await canConnectToDatabase()) {
    for (const item of orderItems) {
      if (!item.sourceProductId) continue;

      const productRecord = await prisma.product.findUnique({
        where: { id: item.sourceProductId },
        select: { id: true, stock: true },
      });

      if (productRecord?.stock && productRecord.stock > 0 && productRecord.stock < item.quantity) {
        return NextResponse.json(
          {
            ok: false,
            message: `Estoque insuficiente para ${item.title}. Ajuste a quantidade e tente novamente.`,
          },
          { status: 409 }
        );
      }
    }
  }

  if (await canConnectToDatabase()) {
    try {
      await prisma.order.create({
        data: {
          orderNumber: orderCode,
          customerName: parsed.data.customerName,
          customerEmail: parsed.data.email.trim().toLowerCase(),
          customerPhone: parsed.data.phone,
          postalCode: address.zipCode,
          neighborhood: address.neighborhood,
          status: OrderStatus.PENDING_PAYMENT,
          paymentMethod: PaymentMethod.PIX,
          subtotal: toDecimal(totals.subtotalPix),
          shippingTotal: toDecimal(totals.shipping),
          grandTotal: toDecimal(totals.totalPix),
          notes: [parsed.data.notes, itemSummary].filter(Boolean).join(" • ") || null,
          items: {
            create: orderItems.map((item) => ({
              productId: item.sourceProductId,
              title: item.title,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: toDecimal(item.pricePix),
              totalPrice: toDecimal(item.pricePix * item.quantity),
              material: item.material,
              customizationNotes: item.personalizationText || null,
            })),
          },
          payments: {
            create: {
              method: PaymentMethod.PIX,
              provider: PaymentProvider.MERCADO_PAGO,
              status: PaymentStatus.PENDING,
              amount: toDecimal(totals.totalPix),
              externalReference: orderCode,
              metadata: {
                checkoutMode: "wallet_brick",
                items: orderItems,
                referenceTotalCard: totals.totalCard,
              },
            },
          },
          shipment: {
            create: {
              status: ShipmentStatus.DRAFT,
              carrier: selectedShipping?.company || (selectedShipping?.provider === "melhor-envio" ? "Melhor Envio" : "MDH Local"),
              serviceLevel: selectedShipping?.title || "frete-fixo",
              quotedPrice: toDecimal(totals.shipping),
              addressSnapshot: {
                ...address,
                phone: parsed.data.phone,
              },
              metadata: {
                type: shippingQuote.source,
                provider: selectedShipping?.provider,
                serviceId: selectedShipping?.serviceId,
                company: selectedShipping?.company,
                eta: selectedShipping?.eta,
                price: totals.shipping,
              },
            },
          },
        },
      });
    } catch {
      return NextResponse.json(
        { ok: false, message: "Não foi possível criar o pedido agora. Tente novamente." },
        { status: 500 }
      );
    }
  } else {
    const fallbackRecord = await storeRecord("orders", {
      order_code: orderCode,
      product_id: orderItems[0]?.sourceProductId || orderItems[0]?.productId || "multi-item",
      product_name: orderHeadline,
      quantity: totals.quantity,
      customer_name: parsed.data.customerName,
      email: parsed.data.email.trim().toLowerCase(),
      phone: parsed.data.phone,
      neighborhood: address.neighborhood,
      cep: address.zipCode,
      address_label: address.label,
      address_line1: address.line1,
      address_line2: address.line2,
      city: address.city,
      state: address.state,
      country: address.country,
      shipping_price: totals.shipping,
      shipping_provider: selectedShipping?.provider,
      shipping_service: selectedShipping?.title,
      payment_method: "pix",
      payment_provider: "mercado-pago",
      payment_status: "pending",
      payment_status_detail: "preference_created",
      notes: [parsed.data.notes, itemSummary].filter(Boolean).join(" • "),
      total_pix: totals.totalPix,
      total_card: totals.totalCard,
      status: "pending_payment",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!fallbackRecord.ok) {
      return NextResponse.json(
        { ok: false, message: "Não foi possível salvar o pedido agora. Tente novamente." },
        { status: 500 }
      );
    }
  }

  const preference = await createMercadoPagoPreference({
    items: orderItems.map((item) => ({
      id: item.sku,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.pricePix,
    })).concat(
      totals.shipping > 0
        ? [
            {
              id: "frete",
              title: selectedShipping?.title || "Frete",
              quantity: 1,
              unitPrice: totals.shipping,
            },
          ]
        : []
    ),
    externalReference: orderCode,
    payerEmail: parsed.data.email.trim().toLowerCase(),
    notificationUrl: `${siteUrl}/api/webhooks/mercadopago`,
    backUrls: {
      success: `${siteUrl}/sucesso?order=${encodeURIComponent(orderCode)}`,
      pending: `${siteUrl}/pendente?order=${encodeURIComponent(orderCode)}`,
      failure: `${siteUrl}/falha?order=${encodeURIComponent(orderCode)}`,
    },
    autoReturn: "approved",
  });

  if (!preference.ok) {
    sendMail({
      to: parsed.data.email.trim().toLowerCase(),
      subject: `Pedido ${orderCode} recebido — MDH 3D Store`,
      html: orderConfirmationHtml({
        orderCode,
        customerName: parsed.data.customerName,
        productName: orderHeadline,
        quantity: totals.quantity,
        totalPix: totals.totalPix,
        paymentMethod: "pix",
        productionWindow,
      }),
    }).catch(() => null);

    return buildOrderResponse(
      {
        ok: true,
        paymentFallback: true,
        orderCode,
        message: preference.fallbackMessage || "Não foi possível gerar o checkout agora.",
        reason: preference.reason,
        totalPix: totals.totalPix,
        totalCard: totals.totalCard,
        shippingPrice: totals.shipping,
      },
      {
        orderCode,
        email: parsed.data.email.trim().toLowerCase(),
        customerName: parsed.data.customerName,
      }
    );
  }

  sendMail({
    to: parsed.data.email.trim().toLowerCase(),
    subject: `Pedido ${orderCode} recebido — MDH 3D Store`,
    html: orderConfirmationHtml({
      orderCode,
      customerName: parsed.data.customerName,
      productName: orderHeadline,
      quantity: totals.quantity,
      totalPix: totals.totalPix,
      paymentMethod: "pix",
      productionWindow,
    }),
  }).catch(() => null);

  return buildOrderResponse(
    {
      ok: true,
      orderCode,
      preferenceId: preference.id,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint,
      totalPix: totals.totalPix,
      totalCard: totals.totalCard,
      shippingPrice: totals.shipping,
    },
    {
      orderCode,
      email: parsed.data.email.trim().toLowerCase(),
      customerName: parsed.data.customerName,
    }
  );
}
