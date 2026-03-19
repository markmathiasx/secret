import { NextResponse } from "next/server";
import { catalog, getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { getProductLongDescription } from "@/lib/catalog-content";
import { getProductVisual } from "@/lib/product-visuals";
import { resolveProductImage } from "@/lib/product-images";

function escapeCsv(value: string | number | boolean) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "csv";
  const siteUrl = getSiteUrl();

  const rows = catalog.map((product) => {
    const visual = getProductVisual(product);
    const image = resolveProductImage(product);
    const absoluteImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      visual_kind: visual.kind,
      visual_label: visual.label,
      merchant_ready: visual.merchantReady,
      primary_image: absoluteImage,
      product_url: `${siteUrl}${getProductUrl(product)}`,
      description: getProductLongDescription(product),
      recommended_next_step: visual.recommendedNextStep,
      price_pix: product.pricePix,
      pricing_mode: product.pricingMode || "",
      pricing_narrative: product.pricingNarrative || "",
      estimated_unit_cost: product.estimatedUnitCost || 0,
      estimated_unit_profit: product.estimatedUnitProfit || 0,
      market_segment: product.marketBenchmark?.label || "",
      production_window: product.productionWindow,
      material: product.material,
      finish: product.finish,
    };
  });

  if (format === "json") {
    return NextResponse.json(
      { generatedAt: new Date().toISOString(), total: rows.length, rows },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  }

  const headers = [
    "id",
    "sku",
    "name",
    "category",
    "subcategory",
    "visual_kind",
    "visual_label",
    "merchant_ready",
    "primary_image",
    "product_url",
    "description",
    "recommended_next_step",
    "price_pix",
    "pricing_mode",
    "pricing_narrative",
    "estimated_unit_cost",
    "estimated_unit_profit",
    "market_segment",
    "production_window",
    "material",
    "finish",
  ];

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsv(row[header as keyof typeof row] as string | number | boolean))
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mdh-visual-manifest.csv"',
      "Cache-Control": "no-store, private",
    },
  });
}
