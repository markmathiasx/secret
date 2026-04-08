import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/marketplace-auth";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 400 });
  }

  await requestPasswordReset(parsed.data.email);
  return NextResponse.json({ ok: true });
}
