import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { updateAdminCatalogProduct } from "@/lib/server/admin-catalog-store";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  if (await canConnectToDatabase()) {
    try {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(body.title !== undefined && { title: String(body.title) }),
          ...(body.description !== undefined && { description: String(body.description) }),
          ...(body.pricePix !== undefined && { pricePix: Number(body.pricePix) }),
          ...(body.priceCard !== undefined && { priceCard: Number(body.priceCard) }),
          ...(body.stock !== undefined && { stock: Number(body.stock) }),
          ...(body.material !== undefined && { material: String(body.material) }),
          ...(body.finish !== undefined && { finish: String(body.finish) }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.visibility !== undefined && { visibility: body.visibility }),
          ...(body.readyToShip !== undefined && { readyToShip: Boolean(body.readyToShip) }),
          ...(body.customizable !== undefined && { customizable: Boolean(body.customizable) }),
          ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
          updatedAt: new Date(),
        },
      });
      return applyNoStoreHeaders(NextResponse.json({ ok: true, product: updated }));
    } catch {
      // Fall through to catalog override
    }
  }

  // Fallback: update via catalog overrides file
  const updated = await updateAdminCatalogProduct(id, body);
  return applyNoStoreHeaders(NextResponse.json({ ok: true, product: updated }));
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (await canConnectToDatabase()) {
    try {
      await prisma.product.update({
        where: { id },
        data: { visibility: "PRIVATE", updatedAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    } catch {
      // Fall through
    }
  }

  await updateAdminCatalogProduct(id, { status: "Sob encomenda" });
  return NextResponse.json({ ok: true });
}
