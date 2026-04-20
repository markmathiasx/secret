import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/marketplace-auth";
import { getClientIp, checkRateLimit } from "@/lib/security";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`pw-reset-request:${ip}`, 3, 60 * 60 * 1000);
  if (!rateLimit.ok) {
    // Always return success to prevent email enumeration
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 400 });
  }

  await requestPasswordReset(parsed.data.email);
  return NextResponse.json({ ok: true });
}
