import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { appendOrderEvent, buildOrderWhatsAppSummary, createOrder, createOrderSchema } from "@/lib/order-service";
import { assessOrderRisk, enforceSameOrigin, getClientIp, isSecurityError, peekRateLimit } from "@/lib/security";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { whatsappNumber } from "@/lib/constants";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  try {
    enforceSameOrigin(request);
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Sessao expirada." }, { status: 401 });
    }

    const input = createOrderSchema.parse(await request.json());
    const risk = assessOrderRisk({
      ipAddress: ip,
      headers: request.headers,
      paymentMethod: input.paymentMethod,
      state: input.customer.state,
      shippingAmount: input.shippingAmount,
      hasEmail: Boolean(input.customer.email),
      ordersThisHour: peekRateLimit(`admin_manual_order_hour:${ip}`)
    });
    const created = await createOrder(input, {
      risk: {
        ...risk,
        note: risk.reviewRequired ? "Pedido manual sinalizado para revisão." : null,
        ipAddress: ip
      }
    });
    await appendOrderEvent({
      orderId: created.order.id,
      eventType: "manual_order_created",
      description: `Pedido manual cadastrado no admin a partir do canal ${input.sourceChannelId}.`,
      adminActor: session.email
    });
    const whatsappSummary = await buildOrderWhatsAppSummary(created.order.id);

    await recordAnalyticsEvent({
      eventName: "create_order",
      scope: "admin",
      orderId: created.order.id,
      path: "/admin/novo-pedido",
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      payload: {
        actor: session.email,
        orderNumber: created.order.orderNumber,
        sourceChannelId: input.sourceChannelId,
        paymentMethod: input.paymentMethod
      }
    });

    await appendAuditLog({
      actorType: "admin",
      actorId: session.email,
      action: "admin_manual_order_created",
      resourceType: "order",
      resourceId: created.order.id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      payload: {
        orderNumber: created.order.orderNumber,
        sourceChannelId: input.sourceChannelId,
        paymentMethod: input.paymentMethod
      }
    });

    return NextResponse.json({
      ok: true,
      orderId: created.order.id,
      orderNumber: created.order.orderNumber,
      redirectTo: `/admin/pedidos/${created.order.id}`,
      whatsappUrl: buildWhatsAppLink(whatsappNumber, whatsappSummary?.message || created.order.orderNumber)
    });
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
            : "Falha ao criar pedido manual."
      },
      { status: databaseUnavailable ? 503 : 400 }
    );
  }
}
