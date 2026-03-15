import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { customerSchema, upsertCustomerProfile } from "@/lib/order-service";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`store_customer:${ip}`, 20, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  try {
    const payload = customerSchema.parse(await request.json());
    const result = await upsertCustomerProfile(payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao salvar cliente."
      },
      { status: 400 }
    );
  }
}

