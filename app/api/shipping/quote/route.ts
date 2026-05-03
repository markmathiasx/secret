import { NextResponse } from "next/server";
import { z } from "zod";
import { findProduct } from "@/lib/catalog";
import { quoteBestShipping, type ShippingQuoteProduct } from "@/lib/melhor-envio";
import { onlyDigits } from "@/lib/shipping";

const schema = z.object({
  productId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  cep: z.string().min(8).max(10),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .max(40)
    .optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Informe produto, quantidade e CEP válidos." }, { status: 400 });
  }

  const normalizedCep = onlyDigits(parsed.data.cep);
  if (normalizedCep.length !== 8) {
    return NextResponse.json({ ok: false, error: "CEP inválido para cotação de envio." }, { status: 400 });
  }

  const requestedItems = parsed.data.items?.length
    ? parsed.data.items
    : parsed.data.productId
      ? [{ productId: parsed.data.productId, quantity: parsed.data.quantity }]
      : [];

  if (!requestedItems.length) {
    return NextResponse.json({ ok: false, error: "Informe pelo menos um produto para calcular o envio." }, { status: 400 });
  }

  const products: ShippingQuoteProduct[] = [];
  for (const item of requestedItems) {
    const product = findProduct(item.productId);
    if (!product) {
      return NextResponse.json({ ok: false, error: "Produto não encontrado para calcular o envio." }, { status: 404 });
    }
    products.push({
      id: product.sku || product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.pricePix,
      weightGrams: product.grams,
      dimensions: product.dimensions,
    });
  }

  const { quote, source } = await quoteBestShipping({
    cep: normalizedCep,
    products,
  });

  return NextResponse.json({
    ok: true,
    quote,
    source,
  });
}
