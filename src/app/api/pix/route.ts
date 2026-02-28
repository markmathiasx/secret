import { NextResponse } from "next/server";
import { z } from "zod";
import { makePixPayload } from "@/lib/pix";

const schema = z.object({
  title: z.string().min(1).max(120),
  amount: z.number().positive().max(99999)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const payload = makePixPayload({ title: parsed.data.title, amount: parsed.data.amount });
  return NextResponse.json({ ok: true, payload });
}
