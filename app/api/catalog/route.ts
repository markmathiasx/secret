import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { isProductVisualVerified } from "@/lib/product-visuals";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") || "all";
  const items = scope === "all" ? catalog : catalog.filter(isProductVisualVerified);
  return NextResponse.json({ total: items.length, scope, items });
}
