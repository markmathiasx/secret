import { NextResponse } from "next/server";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { sendAbandonedCartNotification } from "@/lib/notifications-service";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const expected = (process.env.CRON_SECRET || "").trim();
  if (!expected) return true;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  const headerToken = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  return queryToken === expected || headerToken === expected || authHeader === `Bearer ${expected}`;
}

/**
 * GET /api/cron/abandoned-cart
 * Finds carts that were active 1–24 hours ago and haven't converted to an order.
 * Sends a recovery notification to each user (max 50 per run to stay within execution limits).
 * Schedule: every 2 hours via Vercel Cron / external cron service.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, reason: "db_unavailable" }, { status: 503 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h ago
  const windowEnd = new Date(now.getTime() - 60 * 60 * 1000);        // 1h ago (min idle time)

  try {
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        status: "ACTIVE",
        updatedAt: { gte: windowStart, lte: windowEnd },
        userId: { not: null },
        items: { some: {} }, // has at least one item
      },
      include: {
        items: { select: { quantity: true, product: { select: { pricePix: true } } } },
        user: { select: { id: true, name: true } },
      },
      take: 50,
      orderBy: { updatedAt: "desc" },
    });

    let notified = 0;
    let skipped = 0;

    for (const cart of abandonedCarts) {
      if (!cart.userId || !cart.user) {
        skipped++;
        continue;
      }

      // Check no recent order from this user that would make this cart "converted"
      const recentOrder = await prisma.order.findFirst({
        where: {
          buyerId: cart.userId,
          createdAt: { gte: cart.updatedAt },
        },
        select: { id: true },
      });

      if (recentOrder) {
        skipped++;
        continue;
      }

      const cartValue = cart.items.reduce((sum, item) => {
        const price = Number(item.product?.pricePix ?? 0);
        return sum + price * item.quantity;
      }, 0);

      if (cartValue <= 0) {
        skipped++;
        continue;
      }

      try {
        const sent = await sendAbandonedCartNotification(cart.userId, cartValue);
        if (sent) notified++;
        else skipped++;
      } catch (err) {
        logStructured("warn", "abandoned_cart_notify_failed", {
          userId: cart.userId,
          cartId: cart.id,
          message: err instanceof Error ? err.message : "unknown",
        });
        skipped++;
      }
    }

    logStructured("info", "abandoned_cart_cron", {
      totalFound: abandonedCarts.length,
      notified,
      skipped,
    });

    return NextResponse.json({ ok: true, totalFound: abandonedCarts.length, notified, skipped });
  } catch (error) {
    logStructured("error", "abandoned_cart_cron_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
