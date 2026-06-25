import { MdhAiComposer } from "@/src/components/ai-chat/MdhAiComposer";
import { MdhAiLeadForm } from "@/src/components/ai-chat/MdhAiLeadForm";
import { MdhAiQuickActions } from "@/src/components/ai-chat/MdhAiQuickActions";

export function MdhAiChatPanel() {
  return (
    <section className="rounded-lg border border-cyan-300/20 bg-slate-950 p-4 shadow-xl">
      <h2 className="text-lg font-black text-white">MDH3D AI Chat</h2>
      <p className="mt-1 text-sm text-white/60">Fallback comercial seguro, independente do PC local.</p>
      <div className="mt-4 space-y-3">
        <MdhAiQuickActions />
        <MdhAiComposer />
        <MdhAiLeadForm />
      </div>
    </section>
  );
}
