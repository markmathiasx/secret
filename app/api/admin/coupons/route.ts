import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
  }

  if (!(await canConnectToDatabase())) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, coupons: [] }));
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      type: true,
      value: true,
      minOrderValue: true,
      freeShipping: true,
      active: true,
      usageLimit: true,
      usedCount: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
    },
  });

  return applyNoStoreHeaders(NextResponse.json({ ok: true, coupons }));
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
  if (!body?.code || !body?.type || body?.value === undefined) {
    return NextResponse.json({ ok: false, error: "code, type e value são obrigatórios." }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: String(body.code).toUpperCase().trim(),
      title: String(body.title || body.code),
      type: body.type,
      value: Number(body.value),
      minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : null,
      freeShipping: Boolean(body.freeShipping),
      active: body.active !== false,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    },
  });

  return NextResponse.json({ ok: true, coupon });
}
