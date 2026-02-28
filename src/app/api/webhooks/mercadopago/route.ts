import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = request.headers.get("x-signature");

  if (secret && !signature) {
    return NextResponse.json({ ok: false, message: "Webhook sem assinatura." }, { status: 401 });
  }

  const payload = await request.json();

  return NextResponse.json({ ok: true, received: true, payloadType: payload?.type || payload?.action || "unknown" });
}
