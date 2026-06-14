import { NextResponse } from "next/server";
import { buildGoogleShoppingXml } from "@/lib/mdh-store/feeds";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

export function GET() {
  const xml = buildGoogleShoppingXml(getLocalStoreProducts(), getSiteUrl());
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
