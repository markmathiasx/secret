import { NextResponse } from "next/server";
import { listStorefrontProducts } from "@/lib/catalog-server";

export async function GET() {
  const items = await listStorefrontProducts();
  return NextResponse.json({ total: items.length, items });
}
