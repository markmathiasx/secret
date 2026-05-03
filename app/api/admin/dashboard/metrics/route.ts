import { NextResponse } from "next/server";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { redisGetJson, redisSetJson } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ratio(part: number, total: number) {
  return total > 0 ? Number(((part / total) * 100).toFixed(2)) : 0;
}

export async function GET() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const cached = await redisGetJson("admin:dashboard:metrics");
  if (cached) {
    return NextResponse.json({ ok: true, cached: true, metrics: cached });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [views, carts, checkouts, purchases, orders, orderItems] = await Promise.all([
    prisma.analyticsEvent.count({ where: { eventType: { in: ["view_item", "view"] }, createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "add_to_cart", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "begin_checkout", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "purchase", createdAt: { gte: since } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { grandTotal: true, items: { select: { product: { select: { category: { select: { name: true } } } } } } },
      take: 500,
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      select: { sku: true, totalPrice: true },
      take: 500,
    }).catch(() => []),
  ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);
  const metrics = {
    periodDays: 30,
    funnel: {
      views,
      carts,
      checkouts,
      purchases,
      cartRate: ratio(carts, views),
      checkoutRate: ratio(checkouts, carts),
      purchaseRate: ratio(purchases || orders.length, views),
      abandonmentRate: ratio(Math.max(0, checkouts - purchases), checkouts),
    },
    averageOrderValue: orders.length ? Number((revenue / orders.length).toFixed(2)) : 0,
    revenue: Number(revenue.toFixed(2)),
    ticketByCategory: Object.entries(
      orders.reduce<Record<string, { total: number; count: number }>>((acc, order) => {
        const category = order.items[0]?.product?.category?.name || "Sem categoria";
        acc[category] = acc[category] || { total: 0, count: 0 };
        acc[category].total += Number(order.grandTotal || 0);
        acc[category].count += 1;
        return acc;
      }, {})
    ).map(([category, value]) => ({
      category,
      averageTicket: Number((value.total / value.count).toFixed(2)),
      orders: value.count,
    })),
    topSkus: Object.entries(
      orderItems.reduce<Record<string, number>>((acc, item) => {
        acc[item.sku] = (acc[item.sku] || 0) + Number(item.totalPrice || 0);
        return acc;
      }, {})
    )
      .map(([sku, revenue]) => ({ sku, revenue: Number(revenue.toFixed(2)) }))
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 25),
  };

  await redisSetJson("admin:dashboard:metrics", metrics, 60);
  return NextResponse.json({ ok: true, cached: false, metrics });
}
