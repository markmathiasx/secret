import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportType = "orders" | "products" | "customers" | "reviews";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v).replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\r\n");
}

/**
 * GET /api/admin/export?type=orders|products|customers|reviews
 * Streams a CSV file for admin download.
 * Requires ADMIN role.
 */
export async function GET(request: NextRequest) {
  const user = await getServerSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Acesso não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "orders") as ExportType;
  const since = searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let rows: Record<string, unknown>[] = [];
  let filename = `export-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  if (type === "orders") {
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sinceDate } },
      include: {
        buyer: { select: { name: true, email: true } },
        items: { include: { product: { select: { title: true, sku: true } } } },
        shippingAddress: { select: { line1: true, city: true, state: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    rows = orders.map((o) => ({
      id: o.id,
      created_at: o.createdAt.toISOString(),
      status: o.status,
      customer_name: o.buyer?.name ?? "",
      customer_email: o.buyer?.email ?? "",
      items_count: o.items.length,
      total_brl: o.grandTotal.toString(),
      payment_method: o.paymentMethod ?? "",
      shipping_address: [o.shippingAddress?.line1, o.shippingAddress?.city, o.shippingAddress?.state].filter(Boolean).join(", "),
    }));
  } else if (type === "products") {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true, sku: true, title: true, pricePix: true, priceCard: true,
        stock: true, status: true, visibility: true, ratingAverage: true, ratingCount: true,
        createdAt: true,
      },
    });
    rows = products.map((p) => ({
      id: p.id, sku: p.sku, title: p.title,
      price_pix: p.pricePix.toString(), price_card: p.priceCard.toString(),
      stock: p.stock, status: p.status, visibility: p.visibility,
      rating_average: p.ratingAverage, rating_count: p.ratingCount,
      created_at: p.createdAt.toISOString(),
    }));
  } else if (type === "customers") {
    const users = await prisma.user.findMany({
      where: { role: "BUYER", createdAt: { gte: sinceDate } },
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true, name: true, email: true, createdAt: true,
        buyerOrders: { select: { grandTotal: true } },
      },
    });
    rows = users.map((u) => ({
      id: u.id, name: u.name ?? "", email: u.email,
      created_at: u.createdAt.toISOString(),
      orders_count: u.buyerOrders.length,
      lifetime_value: u.buyerOrders.reduce((s, o) => s + Number(o.grandTotal), 0).toFixed(2),
    }));
  } else if (type === "reviews") {
    const reviews = await prisma.catalogReview.findMany({
      where: { createdAt: { gte: sinceDate } },
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true, authorName: true, rating: true, title: true, body: true,
        approved: true, verifiedPurchase: true, catalogSku: true, createdAt: true,
      },
    });
    rows = reviews.map((r) => ({
      id: r.id, sku: r.catalogSku, author: r.authorName, rating: r.rating,
      title: r.title ?? "", body: r.body ?? "", approved: r.approved,
      verified: r.verifiedPurchase, created_at: r.createdAt.toISOString(),
    }));
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
