"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(data?.error || "Falha no login");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setStatus("error");
      setMessage("Nao consegui falar com a API do admin agora. Verifique o ambiente e tente novamente.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-white/70">E-mail do admin</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm text-white/70">Senha do admin</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
      </label>

      {status === "error" ? <p className="text-sm text-rose-200">{message}</p> : null}
      <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-xs leading-6 text-white/45">
        O painel usa `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET`. A sessao admin tambem precisa do banco acessivel para persistir `admin_sessions`.
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
      >
        {status === "loading" ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
