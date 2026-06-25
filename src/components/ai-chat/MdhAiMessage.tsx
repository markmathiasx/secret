import type { AiChatMessage } from "@/src/lib/ai-chat/types";

export function MdhAiMessage({ message }: { message: AiChatMessage }) {
  return (
    <div className={message.role === "assistant" ? "rounded-lg bg-cyan-950/40 p-3 text-cyan-50" : "rounded-lg bg-slate-900 p-3 text-white"}>
      {message.content}
    </div>
  );
}
