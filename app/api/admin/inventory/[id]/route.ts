import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { updateAdminCatalogProduct } from "@/lib/server/admin-catalog-store";
import { recordAdminAction } from "@/lib/admin-audit";

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
      const inventory = await prisma.inventory.upsert({
        where: { productId: id },
        update: {
          ...(body.quantity !== undefined && { quantity: Number(body.quantity) }),
          ...(body.reservedQuantity !== undefined && { reservedQuantity: Number(body.reservedQuantity) }),
          ...(body.reorderLevel !== undefined && { reorderLevel: Number(body.reorderLevel) }),
          updatedAt: new Date(),
        },
        create: {
          productId: id,
          quantity: Number(body.quantity ?? 0),
          reservedQuantity: Number(body.reservedQuantity ?? 0),
          reorderLevel: Number(body.reorderLevel ?? 5),
        },
      });

      if (body.quantity !== undefined) {
        await prisma.product.update({
          where: { id },
          data: { stock: Number(body.quantity), updatedAt: new Date() },
        });
      }

      await recordAdminAction({
        actorId: user?.id,
        actorEmail: user?.email,
        action: "admin.inventory.update",
        entityType: "Inventory",
        entityId: id,
        summary: `Atualizou inventário do produto ${id}`,
        metadata: {
          quantity: body.quantity,
          reservedQuantity: body.reservedQuantity,
          reorderLevel: body.reorderLevel,
        },
        requestId: req.headers.get("x-request-id"),
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      });

      return applyNoStoreHeaders(NextResponse.json({ ok: true, inventory }));
    } catch (err) {
      console.error("[inventory] prisma error", err);
    }
  }

  // Fallback: update catalog override stock
  if (body.quantity !== undefined) {
    await updateAdminCatalogProduct(id, { stock: Number(body.quantity) });
  }
  await recordAdminAction({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "admin.inventory.update_fallback",
    entityType: "Inventory",
    entityId: id,
    summary: `Atualizou inventário via fallback ${id}`,
    metadata: body as Record<string, unknown>,
    requestId: req.headers.get("x-request-id"),
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    userAgent: req.headers.get("user-agent"),
  });
  return applyNoStoreHeaders(NextResponse.json({ ok: true }));
}
