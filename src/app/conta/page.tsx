"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AccountPage() {
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
    load();
  }, []);

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta</p>
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
            <p className="text-white/65">Você ainda não está logado ou o Supabase não foi configurado.</p>
            <Link href="/login" className="mt-5 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100">
              Ir para login
            </Link>
          </>
        )}

        <p className="mt-4 text-xs leading-6 text-white/45">
          Em breve: histórico de pedidos, status e comprovantes. O site público continua funcionando mesmo sem conta do cliente.
        </p>
      </div>
    </section>
  );
}
