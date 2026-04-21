import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { verifyOrderAccessToken, orderAccessCookieName } from "@/lib/order-access";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
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
  const requestedCode = searchParams.get("code")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase() || "";
  const ip = getClientIp(req.headers);
  const rateLimit = checkRateLimit(`order-track:${ip}`, 10, 60_000);

  if (!rateLimit.ok) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 })
    );
  }

  if (!requestedCode) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Informe o código do pedido." }, { status: 400 }));
  }
  const code = requestedCode;

  const sessionUser = await getServerSessionUser();
  const accessToken = req.cookies.get(orderAccessCookieName)?.value || "";

  async function isAuthorizedOrder(input: { buyerId?: string | null; customerEmail?: string | null }) {
    if (sessionUser && isAdminSession(sessionUser)) {
      return true;
    }

    if (sessionUser?.id && input.buyerId && sessionUser.id === input.buyerId) {
      return true;
    }

    if (sessionUser?.email && input.customerEmail && sessionUser.email.toLowerCase() === input.customerEmail.toLowerCase()) {
      return true;
    }

    if (input.customerEmail && accessToken) {
      const cookieAuthorized = await verifyOrderAccessToken(accessToken, {
        orderCode: code,
        customerEmail: input.customerEmail,
      });
      if (cookieAuthorized) {
        return true;
      }
    }

    return Boolean(input.customerEmail && email && input.customerEmail.toLowerCase() === email);
  }

  if (await canConnectToDatabase()) {
    const order = await prisma.order.findFirst({
      where: { orderNumber: code },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
            },
          },
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
      const authorized = await isAuthorizedOrder({
        buyerId: order.buyerId,
        customerEmail: order.customerEmail,
      });

      if (!authorized) {
        return applyNoStoreHeaders(
          NextResponse.json(
            { ok: false, error: "Confirme o e-mail usado no pedido para continuar." },
            { status: 403 }
          )
        );
      }

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
    const foundEmail = String(found.email || found.customer_email || "").trim().toLowerCase() || null;
    const authorized =
      (foundEmail && accessToken
        ? await verifyOrderAccessToken(accessToken, { orderCode: code, customerEmail: foundEmail })
        : false) ||
      (foundEmail ? foundEmail === email : false);

    if (!authorized) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { ok: false, error: "Confirme o e-mail usado no pedido para continuar." },
          { status: 403 }
        )
      );
    }

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
