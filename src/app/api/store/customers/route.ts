import { NextResponse } from "next/server";
import { customerSchema, upsertCustomerProfile } from "@/lib/order-service";
import { appendRateLimitHeaders, checkRateLimit, enforceSameOrigin, getClientIp, isSecurityError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`store_customer:${ip}`, 20, 60_000);

    if (!rateLimit.ok) {
      return appendRateLimitHeaders(
        NextResponse.json({ ok: false, message: "Muitas tentativas. Aguarde um instante." }, { status: 429 }),
        rateLimit
      );
    }

    const payload = customerSchema.parse(await request.json());
    const result = await upsertCustomerProfile(payload);
    return appendRateLimitHeaders(NextResponse.json({ ok: true, ...result }), rateLimit);
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao salvar cliente."
      },
      { status: 400 }
    );
  }
}
