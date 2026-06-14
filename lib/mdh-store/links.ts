import { getStorefrontWhatsappNumber } from "@/lib/mdh-store/config";

export type WhatsappProduct = {
  slug: string;
  name: string;
  sku?: string;
};

export function buildProductPagePath(product: Pick<WhatsappProduct, "slug">) {
  return `/produto/${product.slug}`;
}

export function buildWhatsappUrl(
  product: WhatsappProduct,
  options: { pageUrl?: string; whatsappNumber?: string } = {}
) {
  const pageUrl =
    options.pageUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}${buildProductPagePath(product)}`
      : buildProductPagePath(product));
  const sku = product.sku?.trim() || "sem SKU";
  const message = `Olá, vim pelo site da MDH3D e quero orçamento/comprar: ${product.name}. SKU: ${sku}. Link: ${pageUrl}.`;
  const phone = (options.whatsappNumber || getStorefrontWhatsappNumber()).replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildCartWhatsappUrl(
  items: Array<{ name: string; sku?: string; quantity: number; price: number }>,
  options: { total: number; pageUrl?: string; whatsappNumber?: string } = { total: 0 }
) {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.quantity}x ${item.name} (${item.sku || "sem SKU"}) - R$ ${(item.price * item.quantity).toFixed(2)}`
  );
  const message = [
    "Olá, vim pelo site da MDH3D e quero finalizar este carrinho:",
    ...lines,
    `Total estimado: R$ ${options.total.toFixed(2)}`,
    options.pageUrl ? `Link: ${options.pageUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const phone = (options.whatsappNumber || getStorefrontWhatsappNumber()).replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export type CustomQuotePayload = {
  pieceType: string;
  dimensions: string;
  color: string;
  material: string;
  quantity: number;
  usage: string;
  urgency: string;
  phone?: string;
  files?: string[];
  estimatedPrice?: number;
  estimatedDays?: string;
  pageUrl?: string;
  notes?: string;
};

export function buildCustomQuoteWhatsappUrl(
  payload: CustomQuotePayload,
  options: { whatsappNumber?: string } = {}
) {
  const lines = [
    "Olá, vim pelo site da MDH3D e quero um orçamento personalizado.",
    `Tipo de peça: ${payload.pieceType || "não informado"}`,
    `Medidas aproximadas: ${payload.dimensions || "não informado"}`,
    `Cor desejada: ${payload.color || "não informado"}`,
    `Material: ${payload.material || "não informado"}`,
    `Quantidade: ${payload.quantity || 1}`,
    `Uso da peça: ${payload.usage || "não informado"}`,
    `Urgência: ${payload.urgency || "normal"}`,
    payload.files?.length ? `Arquivos/referências: ${payload.files.join(", ")}` : "",
    payload.estimatedPrice ? `Estimativa inicial do site: R$ ${payload.estimatedPrice.toFixed(2)}` : "",
    payload.estimatedDays ? `Prazo estimado: ${payload.estimatedDays}` : "",
    payload.notes ? `Observações: ${payload.notes}` : "",
    payload.pageUrl ? `Link: ${payload.pageUrl}` : "",
  ].filter(Boolean);
  const phone = (options.whatsappNumber || getStorefrontWhatsappNumber()).replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
