import { NextResponse } from "next/server";
import { buildMetaCatalogCsv } from "@/lib/mdh-store/feeds";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

export function GET() {
  const csv = buildMetaCatalogCsv(getLocalStoreProducts(), getSiteUrl());
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
