import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db/client";
import { getStorefrontProductById } from "@/lib/catalog-server";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { createMercadoPagoPreference } from "@/lib/payments";
import { appendRateLimitHeaders, checkRateLimit, enforceSameOrigin, getClientIp, isSecurityError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 60_000);

    if (!rateLimit.ok) {
      return appendRateLimitHeaders(NextResponse.json({ message: "Muitas tentativas de checkout." }, { status: 429 }), rateLimit);
    }

    if (!isDatabaseConfigured()) {
      return appendRateLimitHeaders(
        NextResponse.json(
          {
            message: `${databaseUnavailableMessage} Use o checkout canonico em /checkout quando a conexao com o banco estiver pronta.`
          },
          { status: 503 }
        ),
        rateLimit
      );
    }

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

    return appendRateLimitHeaders(NextResponse.json(preference), rateLimit);
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
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
