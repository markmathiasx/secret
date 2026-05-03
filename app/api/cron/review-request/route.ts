import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const expected = (process.env.CRON_SECRET || "").trim();
  if (!expected) return true;
  const queryToken = request.nextUrl.searchParams.get("token");
  const headerToken = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  return queryToken === expected || headerToken === expected || authHeader === `Bearer ${expected}`;
}

/**
 * GET /api/cron/review-request
 * Sends review request emails 7 days after delivery.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  // Orders delivered 7 days ago (between 7 and 8 days ago to avoid re-sending)
  const orders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      updatedAt: { gte: eightDaysAgo, lte: sevenDaysAgo },
      buyerId: { not: null },
    },
    select: {
      id: true,
      buyerId: true,
      items: {
        select: {
          product: { select: { title: true, slug: true } },
        },
        take: 1,
      },
    },
    take: 100,
  });

  let sent = 0;
  const errors: string[] = [];

  for (const order of orders) {
    if (!order.buyerId) continue;
    const productName = order.items[0]?.product?.title ?? "seu produto";
    const productSlug = order.items[0]?.product?.slug ?? "";

    try {
      await sendNotification({
        type: "review_request",
        user_id: order.buyerId,
        title: "Como foi seu produto MDH 3D?",
        message: `Seu pedido foi entregue! Deixe uma avaliação para ${productName}.`,
        channels: ["EMAIL", "PUSH"],
        data: {
          url: productSlug ? `/catalogo/${productSlug}#reviews` : "/minha-conta/pedidos",
          orderId: order.id,
        },
      });
      sent++;
    } catch (err) {
      errors.push(order.id);
      console.error("review-request cron error for order", order.id, err);
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}

export const POST = GET;
