import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";
import { rateLimitRequest } from "@/lib/redis";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(500).optional(),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = await rateLimitRequest(`nps:${ip}`, 5, 24 * 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Limite atingido." }, { status: 429 });
  }

  const user = await getServerSessionUser();
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const { score, comment, orderId } = parsed.data;

  await prisma.npsSurvey.create({
    data: {
      score,
      comment: comment ?? null,
      orderId: orderId ?? null,
      userId: user?.id ?? null,
      source: "post_purchase",
    },
  });

  return NextResponse.json({ ok: true });
}
