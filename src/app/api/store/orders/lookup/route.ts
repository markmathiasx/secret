import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { lookupPublicOrder, orderLookupSchema } from "@/lib/order-service";
import { sourceChannelLabels } from "@/lib/commerce";
import { databaseUnavailableMessage } from "@/lib/database-status";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`order_lookup:${ip}`, 10, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas consultas em sequência. Aguarde alguns instantes." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = orderLookupSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Informe número do pedido e e-mail ou WhatsApp válidos." }, { status: 400 });
  }

  try {
    const input = parsed.data;
    const detail = await lookupPublicOrder(input);

    if (!detail) {
      return NextResponse.json({ ok: false, message: "Pedido não encontrado para esta combinação de dados." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      order: {
        orderNumber: detail.order.orderNumber,
        operationalStatus: detail.order.operationalStatus,
        paymentStatus: detail.order.paymentStatus,
        paymentMethod: detail.order.paymentMethod,
        totalAmount: detail.order.totalAmount,
        sourceChannel: sourceChannelLabels[detail.order.sourceChannelId as keyof typeof sourceChannelLabels] || detail.order.sourceChannelId,
        placedAt: detail.order.placedAt,
        items: detail.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          lineTotalPix: item.lineTotalPix
        })),
        timeline: detail.events.map((event) => ({
          eventType: event.eventType,
          description: event.description,
          createdAt: event.createdAt
        }))
      }
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: databaseUnavailableMessage
      },
      { status: 503 }
    );
  }
}
