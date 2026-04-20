import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { getCustomerOrdersByEmail } from "@/lib/server-store";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`account_orders:${ip}`, 30, 60_000);
  if (!rateLimit.ok) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 }));
  }

  const user = await getServerSessionUser();

  if (!user?.email) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }));
  }

  const orders = await getCustomerOrdersByEmail(user.email);
  return applyNoStoreHeaders(NextResponse.json({ ok: true, orders }));
}
