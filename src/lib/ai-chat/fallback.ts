import type { AiChatResponse } from "@/src/lib/ai-chat/types";
import { getAiChatRagContext } from "@/src/lib/ai-chat/rag";

export async function buildFallbackAiChatResponse(query: string): Promise<AiChatResponse> {
  const context = await getAiChatRagContext(query);
  const product = context.products[0];
  const productLine = product
    ? ` Encontrei ${product.name}${product.sku ? ` (SKU ${product.sku})` : ""} com preco Pix vindo do catalogo.`
    : " Posso te levar ao catalogo ou ao WhatsApp para um orcamento humano.";

  return {
    ok: true,
    mode: "fallback_instant",
    message: `Sou o atendimento MDH3D. Eu uso apenas dados publicos do catalogo e nao coleto senha, CPF ou cartao.${productLine}`,
    confidence: product ? 0.74 : 0.45,
    products: context.products,
    escalateToWhatsapp: !product,
  };
}
