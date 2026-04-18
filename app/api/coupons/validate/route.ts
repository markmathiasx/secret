import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase().trim();
  const total = Number(searchParams.get("total") || "0");

  if (!code) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Informe o código do cupom." }, { status: 400 }));
  }

  if (!(await canConnectToDatabase())) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Serviço de cupons indisponível." }, { status: 503 }));
  }

  const coupon = await prisma.coupon.findFirst({
    where: { code, active: true },
  });

  if (!coupon) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Cupom inválido ou inativo." }, { status: 404 }));
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Cupom ainda não está ativo." }, { status: 400 }));
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Cupom expirado." }, { status: 400 }));
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Limite de uso do cupom atingido." }, { status: 400 }));
  }
  if (coupon.minOrderValue !== null && total < Number(coupon.minOrderValue)) {
    const minFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(coupon.minOrderValue));
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: `Pedido mínimo de ${minFormatted} para usar este cupom.` }, { status: 400 })
    );
  }

  let discount = 0;
  if (coupon.type === "PERCENT") {
    discount = Number(((total * Number(coupon.value)) / 100).toFixed(2));
  } else if (coupon.type === "FIXED") {
    discount = Math.min(Number(coupon.value), total);
  }

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        type: coupon.type,
        value: Number(coupon.value),
        freeShipping: coupon.freeShipping,
      },
      discount,
      freeShipping: coupon.freeShipping,
    })
  );
}
