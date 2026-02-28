"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AuthCallback() {
  const [msg, setMsg] = useState("Finalizando login...");

  useEffect(() => {
    async function run() {
      if (!supabaseBrowser) {
        setMsg("Supabase não configurado.");
        return;
      }
      // supabase-js completa a sessão ao voltar do OAuth
      await supabaseBrowser.auth.getSession();
      window.location.href = "/conta";
    }
    run();
  }, []);

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta</p>
      <h1 className="mt-3 text-3xl font-black text-white">{msg}</h1>
    </section>
  );
}
