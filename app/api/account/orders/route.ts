import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCustomerOrdersByEmail } from "@/lib/server-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const orders = await getCustomerOrdersByEmail(session.user.email);
  return NextResponse.json({ ok: true, orders });
}
