import { getAiContextDal } from "@/src/lib/platform/data/ai-context-dal";

export function buildAiChatContext() {
  return getAiContextDal();
}
