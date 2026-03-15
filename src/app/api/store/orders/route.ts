import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { customerAuthConfig, whatsappNumber } from "@/lib/constants";
import { getCustomerSession } from "@/lib/customer-auth";
import { createMercadoPagoPreference } from "@/lib/payments";
import { makePixPayload } from "@/lib/pix";
import {
  appendRateLimitHeaders,
  assessOrderRisk,
  checkRateLimit,
  enforceSameOrigin,
  getClientIp,
  isSecurityError,
  peekRateLimit
} from "@/lib/security";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { attachPaymentProviderData, buildOrderWhatsAppSummary, createOrder, createOrderSchema } from "@/lib/order-service";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";

function readCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  try {
    enforceSameOrigin(request);
    const rateLimit = checkRateLimit(`store_order:${ip}`, 10, 60_000);
    const hourlyLimit = checkRateLimit(`store_order_hour:${ip}`, 6, 60 * 60_000);

    if (!rateLimit.ok) {
      return appendRateLimitHeaders(
        NextResponse.json({ ok: false, message: "Muitas tentativas de checkout. Tente novamente em instantes." }, { status: 429 }),
        rateLimit
      );
    }

    if (!hourlyLimit.ok) {
      return appendRateLimitHeaders(
        NextResponse.json({ ok: false, message: "Limite de pedidos por hora atingido para este IP." }, { status: 429 }),
        hourlyLimit
      );
    }

    const body = await request.json();
    const input = createOrderSchema.parse(body);
    const sessionCookie = readCookieValue(request.headers.get("cookie") || "", customerAuthConfig.sessionCookieName);
    const customerSession = await getCustomerSession(sessionCookie);
    const risk = assessOrderRisk({
      ipAddress: ip,
      headers: request.headers,
      paymentMethod: input.paymentMethod,
      state: input.customer.state,
      shippingAmount: input.shippingAmount,
      hasEmail: Boolean(input.customer.email),
      ordersThisHour: peekRateLimit(`store_order_hour:${ip}`)
    });
    const created = await createOrder(input, {
      customerAccountId: customerSession?.account.id || null,
      risk: {
        ...risk,
        note: risk.reviewRequired ? "Pedido sinalizado automaticamente por regras de risco." : null,
        ipAddress: ip
      }
    });
    const whatsappSummary = await buildOrderWhatsAppSummary(created.order.id);
    const whatsappUrl = buildWhatsAppLink(whatsappNumber, whatsappSummary?.message || `Pedido ${created.order.orderNumber}`);

    await recordAnalyticsEvent({
      eventName: "create_order",
      orderId: created.order.id,
      path: "/checkout",
      ipAddress: ip,
      userAgent,
      payload: {
        orderNumber: created.order.orderNumber,
        paymentMethod: input.paymentMethod,
        sourceChannelId: input.sourceChannelId,
        totalAmount: created.order.totalAmount,
        itemCount: created.items.length
      }
    });

    await appendAuditLog({
      actorType: customerSession?.account.id ? "customer" : "anonymous",
      actorId: customerSession?.account.id || null,
      action: "order_created",
      resourceType: "order",
      resourceId: created.order.id,
      ipAddress: ip,
      userAgent,
      payload: {
        orderNumber: created.order.orderNumber,
        paymentMethod: input.paymentMethod,
        sourceChannelId: input.sourceChannelId,
        riskScore: risk.score,
        reviewRequired: risk.reviewRequired
      }
    });

    if (input.paymentMethod === "pix") {
      const pixPayload = makePixPayload({
        amount: created.order.totalAmount,
        description: created.order.orderNumber
      });
      const qrCodeDataUrl = await QRCode.toDataURL(pixPayload);

      await attachPaymentProviderData({
        orderId: created.order.id,
        provider: "pix",
        providerPaymentId: created.order.orderNumber,
        verificationNote: "Pix gerado pelo storefront.",
        rawPayload: { pixPayload }
      });

      await recordAnalyticsEvent({
        eventName: "order_created",
        orderId: created.order.id,
        path: "/checkout",
        ipAddress: ip,
        userAgent,
        payload: {
          orderNumber: created.order.orderNumber,
          paymentMethod: "pix",
          totalAmount: created.order.totalAmount
        }
      });

      return appendRateLimitHeaders(
        NextResponse.json(
        {
          ok: true,
          orderId: created.order.id,
          orderNumber: created.order.orderNumber,
          whatsappUrl,
          payment: {
            method: "pix",
            pixPayload,
            qrCodeDataUrl
          }
        },
        { status: 201 }
        ),
        rateLimit
      );
    }

    if (input.paymentMethod === "card") {
      const preference = await createMercadoPagoPreference({
        title: `Pedido ${created.order.orderNumber} - MDH 3D`,
        externalReference: created.order.orderNumber,
        items: created.items.map((item) => ({
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.priceCard
        })),
        payer: {
          name: input.customer.fullName,
          email: input.customer.email || undefined
        }
      });

      if (preference.ok) {
        await attachPaymentProviderData({
          orderId: created.order.id,
          provider: "mercadopago",
          providerPaymentId: preference.id,
          verificationNote: "Preferência Mercado Pago criada.",
          rawPayload: preference
        });
      }

      await recordAnalyticsEvent({
        eventName: "order_created",
        orderId: created.order.id,
        path: "/checkout",
        ipAddress: ip,
        userAgent,
        payload: {
          orderNumber: created.order.orderNumber,
          paymentMethod: "card",
          gatewayReady: preference.ok
        }
      });

      return appendRateLimitHeaders(
        NextResponse.json(
        {
          ok: true,
          orderId: created.order.id,
          orderNumber: created.order.orderNumber,
          whatsappUrl,
          payment: {
            method: "card",
            initPoint: preference.ok ? preference.initPoint : null,
            sandboxInitPoint: preference.ok ? preference.sandboxInitPoint : null,
            gatewayReady: preference.ok,
            fallbackMessage: preference.ok ? null : preference.fallbackMessage
          }
        },
        { status: 201 }
        ),
        rateLimit
      );
    }

    await recordAnalyticsEvent({
      eventName: "order_created",
      orderId: created.order.id,
      path: "/checkout",
      ipAddress: ip,
      userAgent,
      payload: {
        orderNumber: created.order.orderNumber,
        paymentMethod: input.paymentMethod,
        totalAmount: created.order.totalAmount
      }
    });

    return appendRateLimitHeaders(
      NextResponse.json(
      {
        ok: true,
        orderId: created.order.id,
        orderNumber: created.order.orderNumber,
        whatsappUrl,
        payment: {
          method: input.paymentMethod
        }
      },
      { status: 201 }
      ),
      rateLimit
    );
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }
    const databaseUnavailable = isDatabaseRuntimeError(error);
    return NextResponse.json(
      {
        ok: false,
        message: databaseUnavailable
          ? databaseUnavailableMessage
          : error instanceof Error
            ? error.message
            : "Falha ao criar pedido."
      },
      { status: databaseUnavailable ? 503 : 400 }
    );
  }
}
