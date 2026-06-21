import { NextResponse } from "next/server";
import { buildTiktokCatalogCsv } from "@/lib/mdh-store/feeds";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

function safeErrorHeader(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 180).replace(/[\r\n<>"]/g, " ") : "unknown_feed_error";
}

export function GET() {
  try {
    const csv = buildTiktokCatalogCsv(getLocalStoreProducts(), getSiteUrl());
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    const csv = buildTiktokCatalogCsv([], getSiteUrl());
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=60",
        "X-MDH-Feed-Error": safeErrorHeader(error),
      },
    });
  }
}
