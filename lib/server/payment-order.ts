import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/server/order-authorization";

export type PaymentOrderContext = {
  orderCode: string | null;
  orderId: string | null;
  title: string;
  amount: number;
  customerEmail: string | null;
  customerName: string | null;
};

export async function resolveOrderPaymentContext(input: {
  orderCode?: string;
  fallbackTitle: string;
  fallbackAmount: number;
  fallbackEmail?: string;
  fallbackCustomerName?: string;
}) {
  const normalizedOrderCode = input.orderCode?.trim() || null;

  if (normalizedOrderCode && (await canConnectToDatabase())) {
    const order = await prisma.order.findUnique({
      where: {
        orderNumber: normalizedOrderCode,
      },
      include: {
        items: {
          take: 1,
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (order) {
      if (!(await canAccessOrder(order)) || order.status !== "PENDING_PAYMENT") return null;
      if (!Number.isFinite(Number(order.grandTotal)) || Number(order.grandTotal) <= 0) return null;
      const title = order.items[0]?.title
        ? `${order.items[0].title} • ${order.orderNumber}`
        : `${input.fallbackTitle} • ${order.orderNumber}`;

      return {
        orderCode: order.orderNumber,
        orderId: order.id,
        title,
        amount: Number(order.grandTotal),
        customerEmail: order.customerEmail || input.fallbackEmail || null,
        customerName: order.customerName || input.fallbackCustomerName || null,
      } satisfies PaymentOrderContext;
    }
  }

  return null;
}
