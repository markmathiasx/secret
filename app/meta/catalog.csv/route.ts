import { NextResponse } from "next/server";
import { META_COMMERCE_COLUMNS, buildMetaCommerceCsv, buildMetaCommerceFeedData } from "@/lib/meta-commerce-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function csvResponse(csv: string, headers: Record<string, string>) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60",
      ...headers,
    },
  });
}

export async function GET() {
  try {
    const data = buildMetaCommerceFeedData();
    const csv = buildMetaCommerceCsv(data.products);

    return csvResponse(csv, {
      "X-MDH-Feed-Products": String(data.products.length),
      "X-MDH-Feed-Skipped": String(data.skipped.length),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_feed_error";
    const fallbackCsv = `${META_COMMERCE_COLUMNS.join(",")}\n`;

    return csvResponse(fallbackCsv, {
      "X-MDH-Feed-Products": "0",
      "X-MDH-Feed-Skipped": "0",
      "X-MDH-Feed-Error": message.slice(0, 180).replace(/[\r\n,"]/g, " "),
    });
  }
}
