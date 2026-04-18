import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
  }

  if (!(await canConnectToDatabase())) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, users: [], total: 0 }));
  }

  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get("skip") || "0");
  const take = Math.min(Number(searchParams.get("take") || "50"), 100);
  const search = searchParams.get("q") || "";

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { buyerOrders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return applyNoStoreHeaders(NextResponse.json({ ok: true, users, total }));
}
