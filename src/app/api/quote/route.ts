import { NextResponse } from "next/server";
import { getStorefrontProductById } from "@/lib/catalog-server";
import { quoteSchema } from "@/lib/schemas";
import { getClientIp, checkRateLimit } from "@/lib/security";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`quote:${ip}`, 10, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const raw = await request.json();
  const parsed = quoteSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const product = await getStorefrontProductById(parsed.data.productId);

  if (!product) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  const quoteId = `Q-${Date.now()}`;
  const deliveryFee = parsed.data.distanceKm ? estimateDeliveryFeeKm(parsed.data.distanceKm) : 0;

  const estimatedTotalPix = Number((product.pricePix + deliveryFee).toFixed(2));
  const whatsappUrl = buildWhatsAppLink(
    whatsappNumber,
    [
      whatsappMessage,
      "",
      `Orçamento rápido ${quoteId}`,
      `Produto: ${product.name}`,
      `Cliente: ${parsed.data.customerName}`,
      `WhatsApp: ${parsed.data.phone}`,
      `Bairro: ${parsed.data.neighborhood}`,
      `Cor: ${parsed.data.colorPreference}`,
      `Pagamento: ${parsed.data.paymentMethod}`,
      `Preço base Pix: R$ ${product.pricePix.toFixed(2)}`,
      `Frete estimado: R$ ${deliveryFee.toFixed(2)}`,
      `Total estimado Pix: R$ ${estimatedTotalPix.toFixed(2)}`,
      parsed.data.notes ? `Observações: ${parsed.data.notes}` : ""
    ]
      .filter(Boolean)
      .join("\n")
  );

  return NextResponse.json({
    ok: true,
    quoteId,
    whatsappUrl,
    estimatedPricePix: product.pricePix,
    estimatedPriceCard: product.priceCard,
    estimatedDeliveryFee: deliveryFee,
    estimatedTotalPix,
    message: "Estimativa gerada com sucesso."
  });
}
