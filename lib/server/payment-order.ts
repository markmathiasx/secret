import { canConnectToDatabase, prisma } from "@/lib/prisma";

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

  return {
    orderCode: normalizedOrderCode,
    orderId: null,
    title: normalizedOrderCode ? `${input.fallbackTitle} • ${normalizedOrderCode}` : input.fallbackTitle,
    amount: Number(input.fallbackAmount.toFixed(2)),
    customerEmail: input.fallbackEmail || null,
    customerName: input.fallbackCustomerName || null,
  } satisfies PaymentOrderContext;
}
