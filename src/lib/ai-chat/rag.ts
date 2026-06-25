import { retrieveAiChatContext } from "@/src/lib/ai-chat/retriever";

export function getAiChatRagContext(query: string) {
  return retrieveAiChatContext(query);
}
