import { NextResponse } from "next/server";
import { buildMetaCommerceCsv, buildMetaCommerceFeedData } from "@/lib/meta-commerce-feed";

export const revalidate = 3600;

export async function GET() {
  const data = buildMetaCommerceFeedData();
  const csv = buildMetaCommerceCsv(data.products);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=300",
      "X-MDH-Feed-Products": String(data.products.length),
    },
  });
}
