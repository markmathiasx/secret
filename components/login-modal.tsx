"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  async function handleGoogleLogin() {
    setError(null);
    if (!supabaseBrowser) {
      setError("Login temporariamente indisponível. Tente novamente em instantes.");
      return;
    }

    setLoading(true);
    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` }
    });

    if (error) {
      setLoading(false);
      setError("Não foi possível iniciar o login com Google. Tente novamente.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-xl rounded-[30px] border border-white/10 bg-[#080a0f] p-7 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/70 hover:text-white" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Acesso premium</p>
        <h2 className="mt-3 text-3xl font-black text-white">Entre e continue de onde parou</h2>
        <p className="mt-3 text-sm leading-7 text-white/70">
          Salve favoritos, acompanhe orçamentos e mantenha seu histórico de pedidos com uma experiência mais personalizada.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Favoritos sincronizados",
            "Acompanhamento de orçamento",
            "Histórico de pedidos",
            "Sugestões por perfil"
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{item}</div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={handleGoogleLogin} disabled={loading} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-70">
            {loading ? "Conectando..." : "Entrar com Google"}
          </button>
          <Link href="/catalogo" onClick={onClose} className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Continuar como visitante
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
      </div>
    </div>
  );
}
