import { NextResponse } from "next/server";
import { findProduct } from "@/lib/catalog";
import { quoteSchema } from "@/lib/schemas";
import { getClientIp, checkRateLimit } from "@/lib/security";
import { storeRecord } from "@/lib/storage";
import { estimateDeliveryFeeKm } from "@/lib/delivery";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`quote:${ip}`, 10, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const raw = await request.json();
  const parsed = quoteSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId);

  if (!product) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  const quoteId = `Q-${Date.now()}`;
  const deliveryFee = parsed.data.distanceKm ? estimateDeliveryFeeKm(parsed.data.distanceKm) : 0;

  const result = await storeRecord("quotes", {
    quote_id: quoteId,
    product_id: product.id,
    product_name: product.name,
    ...parsed.data,
    estimated_price_pix: product.pricePix,
    estimated_price_card: product.priceCard,
    estimated_delivery_fee: deliveryFee,
    estimated_total_pix: Number((product.pricePix + deliveryFee).toFixed(2)),
    created_at: new Date().toISOString()
  });

  if (!result.ok) {
    return NextResponse.json({ message: "Falha ao registrar orçamento." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    quoteId,
    storage: result.storage,
    message: "Orçamento registrado com sucesso."
  });
}
