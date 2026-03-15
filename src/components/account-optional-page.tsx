"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AccountOptionalPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) {
        setReady(false);
        return;
      }
      const { data } = await supabaseBrowser.auth.getUser();
      setEmail(data.user?.email || null);
      setPhone(data.user?.phone || null);
      setReady(true);
    }
    void load();
  }, []);

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta opcional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Minha conta</h1>

      <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
        {ready && (email || phone) ? (
          <>
            <p className="text-white/70">Logado como</p>
            {email ? <p className="mt-2 font-mono text-white">{email}</p> : null}
            {phone ? <p className="mt-2 font-mono text-white">{phone}</p> : null}
            <button onClick={signOut} className="mt-6 rounded-full border border-white/10 bg-black/20 px-6 py-3 text-sm font-semibold text-white">
              Sair
            </button>
          </>
        ) : (
          <>
            <p className="text-white/65">
              Esta área existe só como conveniência futura. A jornada principal da loja continua guest-first, sem depender de conta para comprar ou acompanhar pedido.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100">
                Ir para login opcional
              </Link>
              <Link href="/acompanhar-pedido" className="inline-flex rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white/80">
                Acompanhar pedido
              </Link>
            </div>
          </>
        )}

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
          <p className="font-semibold text-white">Fluxo principal de amanhã</p>
          <p className="mt-2">Catálogo, carrinho, checkout guest, pedido real, Pix e acompanhamento por número continuam independentes desta área.</p>
        </div>
      </div>
    </section>
  );
}
