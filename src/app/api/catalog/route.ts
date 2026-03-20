import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") || "all";
  const visualType = url.searchParams.get("visual");
  const readyOnly = url.searchParams.get("ready") === "1";

  const scoped =
    scope === "featured"
      ? catalog.filter((item) => item.featured)
      : scope === "ready"
        ? catalog.filter((item) => item.fulfillment === "Pronta entrega")
        : catalog;

  const filtered = scoped.filter((item) => {
    const matchesVisual = visualType ? item.visualType === visualType : true;
    const matchesReady = readyOnly ? item.fulfillment === "Pronta entrega" : true;
    return matchesVisual && matchesReady;
  });

  return applyNoStoreHeaders(
    NextResponse.json({
      total: filtered.length,
      items: filtered
    })
  );
}
