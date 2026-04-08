import { NextResponse } from "next/server";
import { z } from "zod";
import { findProduct } from "@/lib/catalog";
import { buildShippingQuote, onlyDigits } from "@/lib/shipping";

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  cep: z.string().min(8).max(10),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Informe produto, quantidade e CEP válidos." }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ ok: false, error: "Produto não encontrado para calcular o envio." }, { status: 404 });
  }

  const normalizedCep = onlyDigits(parsed.data.cep);
  if (normalizedCep.length !== 8) {
    return NextResponse.json({ ok: false, error: "CEP inválido para cotação de envio." }, { status: 400 });
  }

  const subtotal = Number((product.pricePix * parsed.data.quantity).toFixed(2));
  const quote = buildShippingQuote({
    cep: normalizedCep,
    subtotal,
    quantity: parsed.data.quantity,
    weightGrams: product.grams,
  });

  return NextResponse.json({
    ok: true,
    quote,
  });
}
