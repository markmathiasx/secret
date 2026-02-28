import { NextResponse } from "next/server";
import { findProduct } from "@/lib/catalog";
import { createMercadoPagoPreference } from "@/lib/payments";
import { getClientIp, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ message: "Muitas tentativas de checkout." }, { status: 429 });
  }

  const body = await request.json();
  const product = findProduct(body.productId || "");

  if (!product) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  const preference = await createMercadoPagoPreference({
    title: `${product.name} - MDH 3D`,
    unitPrice: product.priceCard,
    externalReference: `MDH-${product.id}-${Date.now()}`
  });

  if (!preference.ok) {
    return NextResponse.json(preference, { status: 400 });
  }

  return NextResponse.json(preference);
}
