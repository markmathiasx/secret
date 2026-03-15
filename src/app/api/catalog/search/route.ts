import { NextResponse } from "next/server";
import { listStorefrontProducts } from "@/lib/catalog-server";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function score(item: any, q: string) {
  const blob = normalize([item.name, item.category, item.theme, item.collection, item.description, ...(item.tags || [])].join(" "));
  let s = 0;
  const normalizedName = normalize(item.name);

  for (const token of normalize(q).split(/\s+/).filter(Boolean)) {
    if (blob.includes(token)) s += 1;
    if (normalizedName.includes(token)) s += 2;
    if (normalize(item.category).includes(token)) s += 1;
  }
  return s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const requestedLimit = Number(searchParams.get("limit") || 6);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 12) : 6;

  if (!q) {
    return NextResponse.json({ ok: true, items: [], scopes: [] });
  }

  const catalog = await listStorefrontProducts();
  const ranked = catalog
    .map((item) => ({ item, score: score(item, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);

  const scopes = Array.from(new Set(ranked.map((item) => item.category))).slice(0, 3);

  return NextResponse.json({ ok: true, items: ranked, scopes });
}
