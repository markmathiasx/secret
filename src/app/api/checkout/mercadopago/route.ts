import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db/client";
import { getStorefrontProductById } from "@/lib/catalog-server";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { createMercadoPagoPreference } from "@/lib/payments";
import { getClientIp, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ message: "Muitas tentativas de checkout." }, { status: 429 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        message: `${databaseUnavailableMessage} Use o checkout canonico em /checkout quando a conexao com o banco estiver pronta.`
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const product = await getStorefrontProductById(String(body.productId || ""), { fallbackToSeed: false });

    if (!product) {
      return NextResponse.json({ message: "Produto nao encontrado." }, { status: 404 });
    }

    const preference = await createMercadoPagoPreference({
      title: `${product.name} - MDH 3D`,
      unitPrice: product.priceCard,
      externalReference: `MDH-${product.id}-${Date.now()}`
    });

    if (!preference.ok) {
      return NextResponse.json(preference, { status: 400 });
    }

    return NextResponse.json(preference);
  } catch (error) {
    return NextResponse.json(
      {
        message: isDatabaseRuntimeError(error)
          ? databaseUnavailableMessage
          : "Nao foi possivel iniciar o checkout legado do Mercado Pago."
      },
      { status: isDatabaseRuntimeError(error) ? 503 : 400 }
    );
  }
}
