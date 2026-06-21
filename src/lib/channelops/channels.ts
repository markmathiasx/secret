export type ChannelOpsStatus = {
  id: string;
  label: string;
  enabled: boolean;
  status: "active" | "disabled_without_credentials" | "manual_package" | "disabled_without_url";
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
      status: "active",
      credentialEnv: [],
      action: "site",
      reason: "Publicacao local controlada pelo deploy.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      enabled: true,
      status: "active",
      credentialEnv: ["NEXT_PUBLIC_WHATSAPP_NUMBER"],
      action: "whatsapp",
      reason: "Links wa.me funcionam sem API; API oficial depende de credenciais Meta.",
    },
    {
      id: "meta_catalog",
      label: "Meta Catalog",
      enabled: true,
      status: "active",
      credentialEnv: [],
      action: "feed",
      reason: "CSV publico exportado pelo site.",
    },
    {
      id: "google_merchant",
      label: "Google Merchant",
      enabled: true,
      status: "active",
      credentialEnv: [],
      action: "feed",
      reason: "XML publico exportado pelo site.",
    },
    {
      id: "mercadolivre",
      label: "Mercado Livre",
      enabled: hasAllEnv(["MERCADOLIVRE_CLIENT_ID", "MERCADOLIVRE_CLIENT_SECRET"]),
      status: hasAllEnv(["MERCADOLIVRE_CLIENT_ID", "MERCADOLIVRE_CLIENT_SECRET"]) ? "active" : "disabled_without_credentials",
      credentialEnv: ["MERCADOLIVRE_CLIENT_ID", "MERCADOLIVRE_CLIENT_SECRET"],
      action: "payload-export",
      reason: "Payload dry-run e validador local existem; publicacao real aguarda credenciais oficiais.",
    },
    {
      id: "shopee",
      label: "Shopee",
      enabled: hasAllEnv(["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY"]),
      status: hasAllEnv(["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY"]) ? "active" : "disabled_without_credentials",
      credentialEnv: ["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY"],
      action: "payload-export",
      reason: "Payload dry-run e validador local existem; publicacao real aguarda credenciais oficiais.",
    },
    {
      id: "facebook_marketplace",
      label: "Facebook Marketplace",
      enabled: false,
      status: "manual_package",
      credentialEnv: [],
      action: "manual-only",
      reason: "Pacote manual com CSV/imagens/textos; automacao de login/captcha e proibida.",
    },
    {
      id: "nuvemshop",
      label: "Nuvemshop",
      enabled: Boolean(process.env.NEXT_PUBLIC_NUVEMSHOP_BASE_URL || process.env.NUVEMSHOP_BASE_URL || process.env.VITE_NUVEMSHOP_BASE_URL),
      status: Boolean(process.env.NEXT_PUBLIC_NUVEMSHOP_BASE_URL || process.env.NUVEMSHOP_BASE_URL || process.env.VITE_NUVEMSHOP_BASE_URL)
        ? "active"
        : "disabled_without_url",
      credentialEnv: ["NEXT_PUBLIC_NUVEMSHOP_BASE_URL"],
      action: "payload-export",
      reason: "Checkout externo e opcional por URL de produto; fallback seguro permanece WhatsApp.",
    },
  ];

  return channels;
}
