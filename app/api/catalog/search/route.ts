import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

type SearchableProduct = (typeof catalog)[number];

function score(item: SearchableProduct, q: string) {
  const blob = [
    item.name,
    item.category,
    item.subcategory,
    item.theme,
    item.description,
    item.sku,
    item.technical?.partNumber || "",
    item.technical?.typeProduct || "",
    item.technical?.componentScope || "",
    ...(item.tags || []),
    ...(item.technical?.symptomTags || []),
  ]
    .join(" ")
    .toLowerCase();

  let s = 0;
  for (const token of q.split(/\s+/).filter(Boolean)) {
    if (blob.includes(token)) s += 1;
    if (item.name.toLowerCase().includes(token)) s += 2;
    if (item.sku.toLowerCase().includes(token)) s += 4;
    if ((item.technical?.partNumber || "").toLowerCase().includes(token)) s += 4;
    if ((item.technical?.symptomTags || []).some((symptom) => symptom.toLowerCase().includes(token))) s += 2;
  }
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
