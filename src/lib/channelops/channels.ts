export type ChannelOpsStatus = {
  id: string;
  label: string;
  enabled: boolean;
  credentialEnv: string[];
  action: "site" | "feed" | "whatsapp" | "payload-export" | "manual-only";
  reason: string;
};

function hasAllEnv(keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

export function getChannelOpsStatus(): ChannelOpsStatus[] {
  const channels: ChannelOpsStatus[] = [
    {
      id: "site",
      label: "Site MDH3D",
      enabled: true,
      credentialEnv: [],
      action: "site",
      reason: "Publicacao local controlada pelo deploy.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      enabled: true,
      credentialEnv: ["NEXT_PUBLIC_WHATSAPP_NUMBER"],
      action: "whatsapp",
      reason: "Links wa.me funcionam sem API; API oficial depende de credenciais Meta.",
    },
    {
      id: "meta_catalog",
      label: "Meta Catalog",
      enabled: true,
      credentialEnv: [],
      action: "feed",
      reason: "CSV publico exportado pelo site.",
    },
    {
      id: "google_merchant",
      label: "Google Merchant",
      enabled: true,
      credentialEnv: [],
      action: "feed",
      reason: "XML publico exportado pelo site.",
    },
    {
      id: "mercadolivre",
      label: "Mercado Livre",
      enabled: hasAllEnv(["MERCADOLIVRE_CLIENT_ID", "MERCADOLIVRE_CLIENT_SECRET"]),
      credentialEnv: ["MERCADOLIVRE_CLIENT_ID", "MERCADOLIVRE_CLIENT_SECRET"],
      action: "payload-export",
      reason: "Sem credenciais oficiais, somente exportacao de payload.",
    },
    {
      id: "shopee",
      label: "Shopee",
      enabled: hasAllEnv(["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY"]),
      credentialEnv: ["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY"],
      action: "payload-export",
      reason: "Sem credenciais oficiais, somente exportacao de payload.",
    },
    {
      id: "facebook_marketplace",
      label: "Facebook Marketplace",
      enabled: false,
      credentialEnv: [],
      action: "manual-only",
      reason: "Browser automation, login automation e captcha bypass sao proibidos.",
    },
  ];

  return channels;
}
