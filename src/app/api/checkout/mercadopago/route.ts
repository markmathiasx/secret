import { NextResponse } from "next/server";
import { findProduct } from "@/lib/catalog";
import { createMercadoPagoPreference } from "@/lib/payments";
import { getClientIp, checkRateLimit } from "@/lib/security";

type CheckoutRequestItem = {
  productId?: string;
  quantity?: number;
};

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ message: "Muitas tentativas de checkout." }, { status: 429 });
  }

  const body = await request.json();
  const requestedItems: CheckoutRequestItem[] = Array.isArray(body.items)
    ? body.items
    : body.productId
      ? [{ productId: body.productId, quantity: body.quantity || 1 }]
      : [];

  const items = requestedItems
    .map((item) => {
      const product = findProduct(String(item.productId || ""));
      if (!product) return null;

      return {
        id: product.id,
        title: `${product.name} - MDH 3D`,
        quantity: Math.max(1, Number(item.quantity || 1)),
        unitPrice: product.priceCard
      };
    })
    .filter((item): item is { id: string; title: string; quantity: number; unitPrice: number } => Boolean(item));

  if (!items.length) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  const preference = await createMercadoPagoPreference({
    items,
    externalReference: `MDH-${Date.now()}`
  });

  if (!preference.ok) {
    return NextResponse.json(preference, { status: 400 });
  }

  return NextResponse.json(preference);
}
