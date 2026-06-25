import { sanitizeText } from "@/src/lib/platform/security/sanitize";

const blocked = /cpf|cart[aã]o|senha|token|secret|admin|deploy|push main/i;

export function sanitizeAiChatInput(input: unknown) {
  return sanitizeText(input, Number(process.env.AI_CHAT_MAX_MESSAGE_LENGTH || 2000));
}

export function isAiChatUnsafe(input: string) {
  return blocked.test(input);
}
