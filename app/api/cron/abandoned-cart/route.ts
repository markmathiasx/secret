import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail, sendAbandonedCartNotification } from "@/lib/notifications-service";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretsMatch(received: string | null, expected: string) {
  if (!received) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function isAuthorized(request: Request, expected: string) {
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  const headerToken = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  return [queryToken, headerToken, bearerToken].some((token) => secretsMatch(token, expected));
}

/**
 * GET /api/cron/abandoned-cart
 * Finds carts abandoned for the 1h/24h/72h recovery ladder.
 * Schedule: every 2 hours via Vercel Cron / external cron service.
 */
export async function GET(request: Request) {
  const cronSecret = (process.env.CRON_SECRET || "").trim();
  if (!cronSecret) {
    logStructured("error", "abandoned_cart_cron_misconfigured", { reason: "missing_cron_secret" });
    return NextResponse.json({ ok: false, error: "Cron unavailable" }, { status: 503 });
  }

  if (!isAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, reason: "db_unavailable" }, { status: 503 });
  }

  const now = new Date();
  const windows = [
    { stage: "1h" as const, start: new Date(now.getTime() - 3 * 60 * 60 * 1000), end: new Date(now.getTime() - 60 * 60 * 1000) },
    { stage: "24h" as const, start: new Date(now.getTime() - 30 * 60 * 60 * 1000), end: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { stage: "72h" as const, start: new Date(now.getTime() - 78 * 60 * 60 * 1000), end: new Date(now.getTime() - 72 * 60 * 60 * 1000) },
  ];

  try {
    let notified = 0;
    let skipped = 0;
    let totalFound = 0;

    for (const window of windows) {
      const abandonedCarts = await prisma.cart.findMany({
        where: {
          status: "ACTIVE",
          updatedAt: { gte: window.start, lte: window.end },
          userId: { not: null },
          items: { some: {} },
        },
        include: {
          items: { select: { quantity: true, product: { select: { pricePix: true } } } },
          user: { select: { id: true, name: true } },
        },
        take: 50,
        orderBy: { updatedAt: "desc" },
      });

      totalFound += abandonedCarts.length;

      for (const cart of abandonedCarts) {
        if (!cart.userId || !cart.user) {
          skipped++;
          continue;
        }

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
          const sent =
            window.stage === "1h"
              ? await sendAbandonedCartNotification(cart.userId, cartValue)
              : await sendAbandonedCartEmail(cart.userId, cartValue, window.stage);
          if (sent) notified++;
          else skipped++;
        } catch (err) {
          logStructured("warn", "abandoned_cart_notify_failed", {
            userId: cart.userId,
            cartId: cart.id,
            stage: window.stage,
            message: err instanceof Error ? err.message : "unknown",
          });
          skipped++;
        }
      }
    }

    logStructured("info", "abandoned_cart_cron", {
      totalFound,
      notified,
      skipped,
    });

    return NextResponse.json({ ok: true, totalFound, notified, skipped });
  } catch (error) {
    logStructured("error", "abandoned_cart_cron_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
