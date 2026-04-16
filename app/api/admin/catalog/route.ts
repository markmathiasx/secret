import { NextResponse } from "next/server";
import { getAdminCatalogSnapshot } from "@/lib/server/admin-catalog-store";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Acesso restrito ao admin." }, { status: 401 });
}

export async function GET() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return unauthorized();
  }

  const products = await getAdminCatalogSnapshot();
  const summary = {
    totalProducts: products.length,
    imagePending: products.filter((item) => item.imagePending).length,
    readyToShip: products.filter((item) => item.readyToShip).length,
    printing: products.filter((item) => item.productionStage === "imprimindo").length,
    averagePix: products.length ? Number((products.reduce((sum, item) => sum + item.pricePix, 0) / products.length).toFixed(2)) : 0,
  };

  return NextResponse.json({ ok: true, products, summary });
}
