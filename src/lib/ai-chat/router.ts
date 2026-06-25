import { buildFallbackAiChatResponse } from "@/src/lib/ai-chat/fallback";
import { sanitizeAiChatInput, isAiChatUnsafe } from "@/src/lib/ai-chat/safety";
import type { AiChatResponse } from "@/src/lib/ai-chat/types";

export async function routeAiChatMessage(input: unknown): Promise<AiChatResponse> {
  const message = sanitizeAiChatInput(input);
  if (!message || isAiChatUnsafe(message)) {
    return {
      ok: true,
      mode: "fallback_instant",
      message: "Por seguranca, nao recebo senha, CPF, cartao ou comandos administrativos. Posso continuar por WhatsApp com atendimento humano.",
      confidence: 0.2,
      escalateToWhatsapp: true,
    };
  }

  return buildFallbackAiChatResponse(message);
}
