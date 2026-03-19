"use client";

import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [msg, setMsg] = useState("Redirecionando para sua área de acesso...");

  useEffect(() => {
    async function run() {
      setMsg("O acesso é feito por e-mail e senha direto no site.");
      window.location.href = "/login";
    }

    void run();
  }, []);

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta</p>
      <h1 className="mt-3 text-3xl font-black text-white">{msg}</h1>
    </section>
  );
}
