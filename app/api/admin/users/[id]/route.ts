import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { recordAdminAction } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.role !== undefined && { role: body.role }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  await recordAdminAction({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "admin.user.update",
    entityType: "User",
    entityId: id,
    summary: `Atualizou usuário ${updated.email || updated.id}`,
    metadata: {
      isActive: updated.isActive,
      role: updated.role,
    },
    requestId: req.headers.get("x-request-id"),
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    userAgent: req.headers.get("user-agent"),
  });

  return applyNoStoreHeaders(NextResponse.json({ ok: true, user: updated }));
}
