import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { findProduct } from "@/lib/catalog";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  productId: z.string().min(1).max(128),
  email: z.string().email().max(320),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`back-in-stock:${ip}`, 5, 60 * 60 * 1000);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ ok: false, message: "Produto não encontrado." }, { status: 404 });
  }

  // Find user by email if they have an account
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  }).catch(() => null);

  if (user?.id) {
    // Authenticated user: save as notification record
    await prisma.notification.create({
      data: {
        userId: user.id,
        channel: "IN_APP",
        title: `Aviso de reposição: ${product.name}`,
        body: `Você pediu para ser notificado quando ${product.name} estiver disponível.`,
        payload: {
          type: "back_in_stock",
          productId: parsed.data.productId,
          productName: product.name,
        },
        status: "PENDING",
      },
    }).catch(() => {});
  }

  // Always log for staff action
  logStructured("info", "back_in_stock_request", {
    productId: parsed.data.productId,
    productName: product.name,
    emailDomain: parsed.data.email.split("@")[1] || "unknown",
    hasAccount: Boolean(user?.id),
  });

  return NextResponse.json({ ok: true, message: "Você será notificado assim que o produto estiver disponível." });
}
