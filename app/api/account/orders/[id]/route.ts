import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getCustomerOrdersByEmail } from "@/lib/server-store";
import { getServerSessionUser } from "@/lib/server-session";
import { checkRateLimit, getClientIp } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const ip = getClientIp(request.headers);
  const user = await getServerSessionUser();
  if (!user?.email) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }));
  }

  const rateLimit = checkRateLimit(`account_order_detail:${user.id}:${ip}`, 20, 60_000);
  if (!rateLimit.ok) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Muitas consultas. Tente novamente em instantes." }, { status: 429 }));
  }

  const { id } = await params;
  const orders = await getCustomerOrdersByEmail(user.email);
  const order = orders.find((item) => item.id === id || item.order_code === id) || null;

  if (!order) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, order: null }, { status: 404 }));
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: true, order }));
}
