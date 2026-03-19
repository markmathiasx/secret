import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { buildProductSearchText } from "@/lib/catalog-content";
import { isProductVisualVerified } from "@/lib/product-visuals";

function score(item: any, q: string) {
  const blob = buildProductSearchText(item);
  let s = 0;
  for (const token of q.split(/\s+/).filter(Boolean)) {
    if (blob.includes(token)) s += 1;
    if (item.name.toLowerCase().includes(token)) s += 2;
  }
  if (isProductVisualVerified(item)) s += 3;
  return s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (!q) {
    return NextResponse.json({ ok: true, items: [] });
  }
  const ranked = catalog
    .map((item) => ({ item, score: score(item, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r) => r.item);

  return NextResponse.json({ ok: true, items: ranked });
}
