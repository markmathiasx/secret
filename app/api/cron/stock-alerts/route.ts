import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 3;

/**
 * POST /api/cron/stock-alerts
 * Alerts staff when product stock drops below threshold.
 * Protected by CRON_SECRET header.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: { gte: 1, lte: LOW_STOCK_THRESHOLD },
      visibility: "PUBLIC",
      status: { not: "ARCHIVED" },
    },
    select: { id: true, title: true, sku: true, stock: true, slug: true },
    orderBy: { stock: "asc" },
    take: 50,
  });

  const outOfStockProducts = await prisma.product.findMany({
    where: {
      stock: 0,
      visibility: "PUBLIC",
      status: { in: ["READY_TO_SHIP"] }, // Only track ready-to-ship out of stock
    },
    select: { id: true, title: true, sku: true, stock: true, slug: true },
    orderBy: { title: "asc" },
    take: 50,
  });

  const adminEmail = process.env.STAFF_NOTIFY_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ ok: false, message: "STAFF_NOTIFY_EMAIL not configured." });
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (adminUser && (lowStockProducts.length > 0 || outOfStockProducts.length > 0)) {
    const items = [
      ...outOfStockProducts.map((p) => `❌ ${p.title} (SKU: ${p.sku}) — SEM ESTOQUE`),
      ...lowStockProducts.map((p) => `⚠️ ${p.title} (SKU: ${p.sku}) — ${p.stock} unidades`),
    ].join("\n");

    await sendNotification({
      type: "promotion",
      user_id: adminUser.id,
      title: "Alerta de estoque baixo",
      message: `${outOfStockProducts.length + lowStockProducts.length} produto(s) precisam de reposição:\n\n${items}`,
      channels: ["EMAIL"],
      urgency: outOfStockProducts.length > 0 ? "high" : "normal",
    });
  }

  return NextResponse.json({
    ok: true,
    lowStock: lowStockProducts.length,
    outOfStock: outOfStockProducts.length,
  });
}
