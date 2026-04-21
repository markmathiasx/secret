import { NextResponse } from "next/server";
import { findCatalogProductBySlug } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { serializePublicProduct } from "@/lib/public-catalog";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await findCatalogProductBySlug(id);
  if (!product) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Produto não encontrado." }, { status: 404 })
    );
  }
  return applyNoStoreHeaders(NextResponse.json({ ok: true, product: serializePublicProduct(product) }));
}
