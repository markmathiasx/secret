export const SOURCE_CHANNELS = [
  { id: "site", label: "Site", description: "Pedido criado pelo storefront da MDH 3D" },
  { id: "whatsapp", label: "WhatsApp", description: "Pedido iniciado ou fechado pelo WhatsApp" },
  { id: "instagram", label: "Instagram", description: "Pedido convertido a partir do Instagram" },
  { id: "shopee", label: "Shopee", description: "Pedido vindo da Shopee" },
  { id: "mercado_livre", label: "Mercado Livre", description: "Pedido vindo do Mercado Livre" },
  { id: "amazon", label: "Amazon", description: "Pedido vindo da Amazon" },
  { id: "americanas", label: "Americanas", description: "Pedido vindo da Americanas" },
  { id: "other", label: "Outro", description: "Canal manual ou marketplace alternativo" }
] as const;

export const OPERATIONAL_STATUSES = [
  { id: "new_order", label: "Novo pedido" },
  { id: "waiting_payment", label: "Aguardando pagamento" },
  { id: "payment_confirmed", label: "Pagamento confirmado" },
  { id: "preparing_model", label: "Separando arquivo/modelo" },
  { id: "in_production", label: "Em produção" },
  { id: "completed", label: "Finalizado" },
  { id: "shipped", label: "Enviado" },
  { id: "delivered", label: "Entregue" },
  { id: "canceled", label: "Cancelado" }
] as const;

export const PAYMENT_STATUSES = [
  { id: "pending", label: "Pendente" },
  { id: "waiting_proof", label: "Aguardando comprovante" },
  { id: "paid", label: "Pago" },
  { id: "declined", label: "Recusado" },
  { id: "canceled", label: "Cancelado" },
  { id: "refunded", label: "Reembolsado" }
] as const;

export const PAYMENT_METHODS = [
  { id: "pix", label: "Pix" },
  { id: "card", label: "Cartão" },
  { id: "cash", label: "Dinheiro" },
  { id: "other", label: "Outro" }
] as const;

export const CONTACT_PREFERENCES = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "E-mail" },
  { id: "phone", label: "Ligação" }
] as const;

export type SourceChannelId = (typeof SOURCE_CHANNELS)[number]["id"];
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number]["id"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]["id"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];
export type ContactPreference = (typeof CONTACT_PREFERENCES)[number]["id"];

function buildLabelMap<const T extends readonly { id: string; label: string }[]>(options: T) {
  return Object.fromEntries(options.map((option) => [option.id, option.label])) as Record<T[number]["id"], string>;
}

export const sourceChannelLabels = buildLabelMap(SOURCE_CHANNELS);
export const operationalStatusLabels = buildLabelMap(OPERATIONAL_STATUSES);
export const paymentStatusLabels = buildLabelMap(PAYMENT_STATUSES);
export const paymentMethodLabels = buildLabelMap(PAYMENT_METHODS);
export const contactPreferenceLabels = buildLabelMap(CONTACT_PREFERENCES);
