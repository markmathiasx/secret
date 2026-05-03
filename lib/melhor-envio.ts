import { getMelhorEnvioConfig } from "@/lib/env";
import { buildShippingQuote, onlyDigits, type ShippingQuote } from "@/lib/shipping";

export type ShippingQuoteProduct = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  weightGrams: number;
  dimensions?: string | null;
};

type MelhorEnvioService = {
  id?: number | string;
  name?: string;
  price?: string | number;
  custom_price?: string | number;
  delivery_time?: number;
  custom_delivery_time?: number;
  company?: {
    name?: string;
  };
  error?: string;
};

function numberFrom(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDimensions(value?: string | null) {
  const match = (value || "").match(/(\d+(?:[,.]\d+)?)\D+(\d+(?:[,.]\d+)?)\D+(\d+(?:[,.]\d+)?)/);
  const [length, width, height] = match
    ? [match[1], match[2], match[3]].map((item) => Number(item.replace(",", ".")))
    : [16, 12, 8];

  return {
    length: Math.max(11, numberFrom(length)),
    width: Math.max(11, numberFrom(width)),
    height: Math.max(2, numberFrom(height)),
  };
}

export async function quoteMelhorEnvio(input: {
  cep: string;
  products: ShippingQuoteProduct[];
  subtotal: number;
}): Promise<ShippingQuote | null> {
  const config = getMelhorEnvioConfig();
  const destination = onlyDigits(input.cep);

  if (!config.token || !config.baseUrl || config.fromPostalCode.length !== 8 || destination.length !== 8) {
    return null;
  }

  const payload = {
    from: { postal_code: config.fromPostalCode },
    to: { postal_code: destination },
    products: input.products.map((product) => {
      const dimensions = parseDimensions(product.dimensions);
      return {
        id: product.id,
        width: dimensions.width,
        height: dimensions.height,
        length: dimensions.length,
        weight: Math.max(0.01, Number((product.weightGrams / 1000).toFixed(3))),
        insurance_value: Number(product.unitPrice.toFixed(2)),
        quantity: product.quantity,
      };
    }),
    options: {
      receipt: false,
      own_hand: false,
      insurance_value: Number(input.subtotal.toFixed(2)),
    },
  };

  try {
    const response = await fetch(`${config.baseUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
        "User-Agent": config.userAgent,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4_000),
    });

    if (!response.ok) return null;
    const services = (await response.json().catch(() => [])) as MelhorEnvioService[];
    const options = services
      .filter((service) => !service.error)
      .map((service) => {
        const price = numberFrom(service.custom_price ?? service.price);
        const eta = numberFrom(service.custom_delivery_time ?? service.delivery_time);
        return {
          id: `melhor-${service.id || service.name || price}`,
          title: service.name || "Frete Melhor Envio",
          description: `${service.company?.name || "Melhor Envio"} com cotação em tempo real.`,
          eta: eta > 0 ? `${eta} dias úteis` : "Prazo informado pela transportadora",
          price: Number(price.toFixed(2)),
          region: "Brasil",
          provider: "melhor-envio" as const,
          recommended: false,
          freeShipping: false,
          serviceId: service.id ? String(service.id) : undefined,
          company: service.company?.name,
        };
      })
      .filter((option) => option.price > 0)
      .sort((left, right) => left.price - right.price)
      .slice(0, 4);

    if (!options.length) return null;
    options[0].recommended = true;

    return {
      destinationCep: `${destination.slice(0, 5)}-${destination.slice(5)}`,
      region: "Brasil",
      freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD_BRL || 250),
      recommendedOptionId: options[0].id,
      options,
    };
  } catch {
    return null;
  }
}

export async function quoteBestShipping(input: {
  cep: string;
  products: ShippingQuoteProduct[];
}) {
  const subtotal = input.products.reduce((sum, product) => sum + product.unitPrice * product.quantity, 0);
  const melhorEnvioQuote = await quoteMelhorEnvio({
    cep: input.cep,
    products: input.products,
    subtotal,
  });

  if (melhorEnvioQuote) {
    return { quote: melhorEnvioQuote, source: "melhor-envio" as const };
  }

  const quantity = input.products.reduce((sum, product) => sum + product.quantity, 0);
  const totalWeightGrams = input.products.reduce((sum, product) => sum + product.weightGrams * product.quantity, 0);

  return {
    quote: buildShippingQuote({
      cep: input.cep,
      subtotal,
      quantity,
      totalWeightGrams,
    }),
    source: "mdh-local" as const,
  };
}
