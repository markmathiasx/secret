import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { catalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
  }

  if (await canConnectToDatabase()) {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        products: products.map((p) => ({
          id: p.id,
          sku: p.sku,
          title: p.title,
          category: p.categoryId ?? "",
          pricePix: Number(p.pricePix),
          priceCard: Number(p.priceCard),
          stock: p.stock,
          status: p.status,
          visibility: p.visibility,
          readyToShip: p.readyToShip,
          customizable: p.customizable,
        })),
      })
    );
  }

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      products: catalog.map((p) => ({
        id: p.id,
        sku: p.sku,
        title: p.name,
        category: p.category,
        pricePix: p.pricePix,
        priceCard: p.priceCard,
        stock: p.stock,
        status: p.status,
        readyToShip: p.readyToShip ?? false,
        customizable: p.customizable,
      })),
    })
  );
}

export async function POST(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.sku) {
    return NextResponse.json({ ok: false, error: "title e sku são obrigatórios." }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      id: `mdh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sku: String(body.sku),
      slug: String(body.slug || body.sku).toLowerCase().replace(/\s+/g, "-"),
      title: String(body.title),
      description: String(body.description || ""),
      searchText: `${body.title} ${body.sku} ${body.description || ""}`.toLowerCase(),
      material: String(body.material || "PLA"),
      finish: String(body.finish || "Padrão"),
      grams: Number(body.grams || 0),
      hours: Number(body.hours || 0),
      pricePix: Number(body.pricePix || 0),
      priceCard: Number(body.priceCard || 0),
      marketplaceSuggested: Number(body.marketplaceSuggested || body.priceCard || 0),
      productionWindow: String(body.productionWindow || "5–10 dias úteis"),
      stock: Number(body.stock || 0),
      readyToShip: Boolean(body.readyToShip),
      customizable: Boolean(body.customizable),
      featured: Boolean(body.featured),
      categoryId: body.categoryId ? String(body.categoryId) : null,
    },
  });

  return NextResponse.json({ ok: true, product });
}
