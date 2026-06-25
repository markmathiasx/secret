"use client";

export function MdhAiComposer() {
  return (
    <form className="flex gap-2" action="/api/ai-chat/message" method="post">
      <input name="message" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white" maxLength={2000} placeholder="Pergunte sobre catalogo, prazo ou orcamento" />
      <button className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950">Enviar</button>
    </form>
  );
}
