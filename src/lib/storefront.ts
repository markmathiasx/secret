import type { Product } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const DEFAULT_INSTALLMENTS = 6;

export function calculateInstallmentValue(total: number, installments = DEFAULT_INSTALLMENTS) {
  return Number((total / installments).toFixed(2));
}

export function formatInstallments(total: number, installments = DEFAULT_INSTALLMENTS) {
  return `${installments}x de ${formatCurrency(calculateInstallmentValue(total, installments))}`;
}

export function buildWhatsAppHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(product: Pick<Product, "name">, quantity = 1) {
  return `Oi! Quero comprar ${quantity}x ${product.name}. Pode confirmar prazo de produção e frete?`;
}

export function getPaymentMethodLabel(paymentMethod: string) {
  if (paymentMethod === "pix") return "Pix";
  if (paymentMethod === "cartao") return "Cartão";
  if (paymentMethod === "boleto") return "Boleto";
  return paymentMethod;
}

type CheckoutMessageInput = {
  items: Array<{ name: string; quantity: number }>;
  totalPix: number;
  customerName?: string;
  cep?: string;
  paymentMethod?: string;
};

export function buildCheckoutWhatsAppMessage(input: CheckoutMessageInput) {
  const lines = input.items.map((item) => `- ${item.quantity}x ${item.name}`).join("\n");
  const customerLine = input.customerName ? `Cliente: ${input.customerName}\n` : "";
  const cepLine = input.cep ? `CEP informado: ${input.cep}\n` : "";
  const paymentLine = input.paymentMethod ? `Pagamento preferido: ${getPaymentMethodLabel(input.paymentMethod)}\n` : "";

  return [
    "Oi! Quero fechar este pedido:",
    lines,
    "",
    customerLine + cepLine + paymentLine + `Total estimado no Pix: ${formatCurrency(input.totalPix)}.`,
    "Pode confirmar produção, frete e próximos passos?"
  ]
    .join("\n")
    .trim();
}
