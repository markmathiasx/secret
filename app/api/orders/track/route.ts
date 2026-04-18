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
          payments: {
            select: {
              id: true,
              providerPaymentId: true,
              externalReference: true,
              status: true,
              pixPayload: true,
              pixQrCode: true,
              boletoUrl: true,
              paidAt: true,
              metadata: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
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
            payment: order.payments[0]
              ? {
                  id: order.payments[0].id,
                  paymentId: order.payments[0].providerPaymentId || order.payments[0].externalReference || null,
                  externalReference: order.payments[0].externalReference || order.orderNumber,
                  status: order.payments[0].status,
                  statusDetail: (order.payments[0].metadata as Record<string, unknown> | null)?.statusDetail || null,
                  pixPayload: order.payments[0].pixPayload,
                  pixQrCode: order.payments[0].pixQrCode,
                  boletoUrl: order.payments[0].boletoUrl,
                  paidAt: order.payments[0].paidAt,
                  metadata: order.payments[0].metadata,
                }
              : null,
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
            payment: {
              id: String(found.payment_reference || ""),
              paymentId: String(found.payment_reference || found.order_code || found.orderNumber || code),
              externalReference: String(found.order_code || found.orderNumber || code),
              status: String(found.payment_status || "pending"),
              statusDetail: String(found.payment_status_detail || ""),
              pixPayload: String(found.pix_payload || ""),
              pixQrCode: String(found.pix_qr_code || ""),
              boletoUrl: String(found.boleto_url || ""),
              paidAt: null,
              metadata: null,
            },
            items: [],
            tracking: null,
          },
      })
    );
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 }));
}
