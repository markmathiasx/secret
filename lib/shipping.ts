import { deliveryZones } from "@/lib/constants";

export type ShippingOptionId = "standard" | "express";

export type ShippingOption = {
  id: ShippingOptionId;
  title: string;
  description: string;
  eta: string;
  price: number;
  region: string;
  provider: "mdh-local";
  recommended: boolean;
  freeShipping: boolean;
};

export type ShippingQuote = {
  destinationCep: string;
  region: string;
  freeShippingThreshold: number;
  recommendedOptionId: ShippingOptionId;
  options: ShippingOption[];
};

function getFreeShippingThreshold() {
  const value = Number(process.env.FREE_SHIPPING_THRESHOLD_BRL || 250);
  return Number.isFinite(value) ? value : 250;
}

function getExpressMultiplier() {
  const value = Number(process.env.CHECKOUT_EXPRESS_MULTIPLIER || 1.75);
  return Number.isFinite(value) ? value : 1.75;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string) {
  const digits = onlyDigits(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function inferDeliveryZone(cep: string) {
  const prefix = Number(onlyDigits(cep).slice(0, 3));
  if (!Number.isFinite(prefix)) return deliveryZones[4];
  if (prefix >= 200 && prefix <= 209) return deliveryZones[0];
  if (prefix >= 210 && prefix <= 219) return deliveryZones[1];
  if (prefix >= 220 && prefix <= 229) return deliveryZones[2];
  if (prefix >= 230 && prefix <= 239) return deliveryZones[3];
  return deliveryZones[4];
}

function roundMoney(value: number) {
  return Math.max(0, Number(value.toFixed(2)));
}

function getWeightSurcharge(weightGrams: number) {
  if (weightGrams <= 800) return 0;
  return Math.min(18, Math.ceil((weightGrams - 800) / 350) * 1.9);
}

function getQuantitySurcharge(quantity: number) {
  if (quantity <= 1) return 0;
  return Math.min(12, (quantity - 1) * 1.35);
}

function getExpressEta(region: string) {
  if (region === "Centro e Zona Portuária") return "Mesmo dia ou próximo dia útil";
  if (region === "Zona Norte" || region === "Zona Sul") return "Até 1 dia útil";
  return "1 a 2 dias úteis";
}

export function buildShippingQuote(input: {
  cep: string;
  subtotal: number;
  quantity?: number;
  weightGrams?: number;
}) {
  const normalizedCep = onlyDigits(input.cep);
  const zone = inferDeliveryZone(normalizedCep);
  const quantity = Math.max(1, input.quantity || 1);
  const weightGrams = Math.max(0, input.weightGrams || 0);
  const base = zone.fee + getWeightSurcharge(weightGrams * quantity) + getQuantitySurcharge(quantity);
  const freeShippingThreshold = getFreeShippingThreshold();
  const freeShipping = input.subtotal >= freeShippingThreshold;
  const standardPrice = freeShipping ? 0 : roundMoney(base);
  const expressPrice = roundMoney(base * getExpressMultiplier());

  return {
    destinationCep: formatCep(normalizedCep),
    region: zone.region,
    freeShippingThreshold,
    recommendedOptionId: "standard" as const,
    options: [
      {
        id: "standard" as const,
        title: freeShipping ? "Entrega local padrão com frete grátis" : "Entrega local padrão",
        description: "Melhor equilíbrio entre custo, produção e rota da MDH 3D no Rio de Janeiro.",
        eta: zone.eta,
        price: standardPrice,
        region: zone.region,
        provider: "mdh-local" as const,
        recommended: true,
        freeShipping,
      },
      {
        id: "express" as const,
        title: "Entrega expressa",
        description: "Janela acelerada para presentes, urgências e pedidos com prioridade comercial.",
        eta: getExpressEta(zone.region),
        price: expressPrice,
        region: zone.region,
        provider: "mdh-local" as const,
        recommended: false,
        freeShipping: false,
      },
    ],
  } satisfies ShippingQuote;
}
