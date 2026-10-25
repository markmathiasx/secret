import { NextRequest, NextResponse } from "next/server";
import { Prisma, ReturnRequestStatus } from "@prisma/client";
import { prisma, canConnectToDatabase } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { recordAdminAction } from "@/lib/admin-audit";
import { assertReturnTransition, isReturnStatus, type ReturnWorkflowStatus } from "@/lib/return-workflow";

export const dynamic = "force-dynamic";

async function authorize() {
  const user = await getServerSessionUser();
  return isAdminSession(user) ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await authorize();
  if (!user) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  if (!(await canConnectToDatabase())) return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || 1));
  const take = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 30)));
  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim().slice(0, 200);
  const where: Prisma.ReturnRequestWhereInput = {
    ...(status && isReturnStatus(status) ? { status: status as ReturnRequestStatus } : {}),
    ...(search ? {
      OR: [
        { protocol: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      ],
    } : {}),
  };

  const [requests, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      include: { order: { select: { orderNumber: true, status: true, grandTotal: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.returnRequest.count({ where }),
  ]);

  return NextResponse.json({ ok: true, requests, pagination: { page, limit: take, total, pages: Math.ceil(total / take) } });
}

export async function PATCH(req: NextRequest) {
  const user = await authorize();
  if (!user) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  if (!(await canConnectToDatabase())) return NextResponse.json({ ok: false, error: "Banco indisponível." }, { status: 503 });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = body?.status;
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2_000) : null;
  if (!id || !isReturnStatus(status)) {
    return NextResponse.json({ ok: false, error: "Solicitação e status válidos são obrigatórios." }, { status: 400 });
  }

  const current = await prisma.returnRequest.findUnique({ where: { id }, select: { id: true, protocol: true, status: true } });
  if (!current) return NextResponse.json({ ok: false, error: "Solicitação não encontrada." }, { status: 404 });

  try {
    assertReturnTransition(current.status as ReturnWorkflowStatus, status);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Transição inválida." }, { status: 409 });
  }

  const now = new Date();
  const request = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.returnRequest.update({
      where: { id },
      data: {
        status: status as ReturnRequestStatus,
        ...(status === "APPROVED" ? { approvedAt: now } : {}),
        ...(status === "RECEIVED" ? { receivedAt: now } : {}),
        ...(["REFUNDED", "EXCHANGED", "REJECTED", "CANCELED"].includes(status) ? { resolvedAt: now } : {}),
      },
    });
    await transaction.returnRequestEvent.create({
      data: { returnRequestId: id, type: "STATUS_CHANGED", actorUserId: user.id, message, metadata: { from: current.status, to: status } },
    });
    return updated;
  });

  await recordAdminAction({
    actorId: user.id,
    actorEmail: user.email,
    action: "return.status_changed",
    entityType: "ReturnRequest",
    entityId: id,
    summary: `${current.protocol}: ${current.status} -> ${status}`,
    metadata: { from: current.status, to: status, message },
  });

  return NextResponse.json({ ok: true, request });
}
