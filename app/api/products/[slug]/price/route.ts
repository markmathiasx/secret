import { NextResponse } from "next/server";
import { z } from "zod";
import { findProduct, findProductBySlug } from "@/lib/catalog";
import { calculateCardPrice } from "@/lib/pricing-engine";

const priceSchema = z.object({
  material: z.string().trim().max(40).default("PLA Premium"),
  color: z.string().trim().max(40).default("Branco"),
  prazo: z.enum(["normal", "prioritario", "express"]).default("normal"),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

const materialMultipliers: Record<string, number> = {
  pla: 1,
  "pla premium": 1,
  "pla silk": 1.08,
  petg: 1.12,
  abs: 1.15,
  tpu: 1.22,
  resina: 1.35,
};

const prazoMultipliers = {
  normal: 1,
  prioritario: 1.12,
  express: 1.24,
};

function normalizeMaterial(value: string) {
  return value.trim().toLowerCase();
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const body = await request.json().catch(() => null);
  const parsed = priceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Configuração inválida." }, { status: 400 });
  }

  const { slug } = await params;
  const product = findProduct(slug) || findProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ ok: false, error: "Produto não encontrado." }, { status: 404 });
  }

  const materialKey = normalizeMaterial(parsed.data.material);
  const materialMultiplier = materialMultipliers[materialKey] || materialMultipliers[product.material.toLowerCase()] || 1;
  const prazoMultiplier = prazoMultipliers[parsed.data.prazo];
  const colorMultiplier = /silk|metal|transparente|glitter/i.test(parsed.data.color) ? 1.04 : 1;
  const unitPix = roundMoney(product.pricePix * materialMultiplier * prazoMultiplier * colorMultiplier);
  const unitCard = calculateCardPrice(unitPix);

  return NextResponse.json({
    ok: true,
    productId: product.id,
    sku: product.sku,
    material: parsed.data.material,
    color: parsed.data.color,
    prazo: parsed.data.prazo,
    unitPix,
    unitCard,
    totalPix: roundMoney(unitPix * parsed.data.quantity),
    totalCard: roundMoney(unitCard * parsed.data.quantity),
    productionWindow:
      parsed.data.prazo === "express"
        ? "24h a 48h sob confirmação"
        : parsed.data.prazo === "prioritario"
          ? "2 a 4 dias úteis"
          : product.productionWindow,
  });
}
