import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { appendOrderEvent, buildOrderWhatsAppSummary, createOrder, createOrderSchema } from "@/lib/order-service";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { whatsappNumber } from "@/lib/constants";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 });
  }

  try {
    const input = createOrderSchema.parse(await request.json());
    const created = await createOrder(input);
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

    return NextResponse.json({
      ok: true,
      orderId: created.order.id,
      orderNumber: created.order.orderNumber,
      redirectTo: `/admin/pedidos/${created.order.id}`,
      whatsappUrl: buildWhatsAppLink(whatsappNumber, whatsappSummary?.message || created.order.orderNumber)
    });
  } catch (error) {
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
