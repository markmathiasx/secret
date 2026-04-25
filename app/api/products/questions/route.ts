import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";
import { rateLimitRequest } from "@/lib/redis";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1),
  question: z.string().min(5).max(500),
  guestName: z.string().min(1).max(80).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = await rateLimitRequest(`product-question:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Muitas perguntas. Tente mais tarde." }, { status: 429 });
  }

  const user = await getServerSessionUser();
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const { productId, question, guestName } = parsed.data;

  await prisma.productQuestion.create({
    data: {
      productId,
      question,
      guestName: user ? null : (guestName ?? "Anônimo"),
      userId: user?.id ?? null,
      approved: false,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ ok: false, message: "productId obrigatório." }, { status: 400 });
  }

  const questions = await prisma.productQuestion.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, question: true, answer: true, guestName: true, createdAt: true },
    take: 50,
  });

  return NextResponse.json({
    ok: true,
    questions: questions.map((q) => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
    })),
  });
}
