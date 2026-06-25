export type AiChatMode = "fallback_instant" | "local_operator_async" | "admin_operator" | "future_cloud_llm";

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatResponse = {
  ok: boolean;
  mode: AiChatMode;
  message: string;
  confidence: number;
  products?: Array<{ name: string; sku?: string; pricePix?: number; priceCard?: number }>;
  escalateToWhatsapp: boolean;
};
