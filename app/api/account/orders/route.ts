import { NextResponse } from "next/server";
import { getCustomerOrdersByEmail } from "@/lib/server-store";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getServerSessionUser();

  if (!user?.email) {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const orders = await getCustomerOrdersByEmail(user.email);
  return NextResponse.json({ ok: true, orders });
}
