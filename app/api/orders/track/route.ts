import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getMemoryRecords } from "@/lib/storage";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  PAID: "Pagamento confirmado",
  PRINTING: "Em produção",
  READY_TO_SHIP: "Pronto para envio",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Informe o código do pedido." }, { status: 400 }));
  }

  if (await canConnectToDatabase()) {
    const order = await prisma.order.findFirst({
      where: { orderNumber: code },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            title: true,
          },
        },
        shipment: { select: { trackingCode: true, carrier: true, postedAt: true } },
      },
    });

    if (order) {
      return applyNoStoreHeaders(
        NextResponse.json({
          ok: true,
          order: {
            orderNumber: order.orderNumber,
            status: order.status,
            statusLabel: STATUS_LABELS[order.status] || order.status,
            createdAt: order.createdAt,
            customerName: order.customerName,
            grandTotal: Number(order.grandTotal),
            paymentMethod: order.paymentMethod,
            items: order.items.map((item) => ({
              name: item.title,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
            })),
            tracking: order.shipment
              ? {
                  code: order.shipment.trackingCode,
                  carrier: order.shipment.carrier,
                  shippedAt: order.shipment.postedAt,
                }
              : null,
          },
        })
      );
    }
  }

  // Fallback: search memory records
  const memoryOrders = getMemoryRecords("orders");
  const found = memoryOrders.find(
    (item) =>
      String(item.order_code || item.orderNumber || "").toUpperCase() === code
  );

  if (found) {
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        order: {
          orderNumber: String(found.order_code || found.orderNumber || code),
          status: String(found.status || "PENDING_PAYMENT"),
          statusLabel: STATUS_LABELS[String(found.status || "PENDING_PAYMENT")] || "Aguardando",
          createdAt: found.created_at,
          customerName: String(found.customer_name || ""),
          grandTotal: Number(found.total_pix || 0),
          paymentMethod: String(found.payment_method || "pix"),
          items: [],
          tracking: null,
        },
      })
    );
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 }));
}
