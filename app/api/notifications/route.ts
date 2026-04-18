import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, notifications: [] }));
  }

  if (!(await canConnectToDatabase())) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, notifications: [] }));
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, channel: true, status: true, createdAt: true },
  });

  return applyNoStoreHeaders(NextResponse.json({ ok: true, notifications }));
}

export async function PATCH(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

  if (ids.length === 0) {
    // Mark all as READ
    await prisma.notification.updateMany({
      where: { userId: user.id, status: { not: "READ" } },
      data: { status: "READ" },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { status: "READ" },
    });
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: true }));
}
