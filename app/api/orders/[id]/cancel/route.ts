import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para cancelar pedidos." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 });
  }

  // Only buyer or admin can cancel
  const isAdmin = user.role === "admin";
  const isBuyer = order.buyerId === user.id;
  if (!isAdmin && !isBuyer) {
    return NextResponse.json({ ok: false, error: "Sem permissão para cancelar este pedido." }, { status: 403 });
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { ok: false, error: "Somente pedidos aguardando pagamento podem ser cancelados." },
      { status: 400 }
    );
  }

  const updated = await prisma.order.updateMany({
    where: { id, status: "PENDING_PAYMENT" },
    data: { status: "CANCELED", updatedAt: new Date() },
  });

  if (!updated.count) {
    return NextResponse.json({ ok: false, error: "O pedido mudou. Atualize antes de cancelar." }, { status: 409 });
  }
  return applyNoStoreHeaders(NextResponse.json({ ok: true, order: { id, status: "CANCELED" } }));
}
