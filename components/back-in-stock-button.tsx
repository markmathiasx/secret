"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

interface BackInStockButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

/**
 * Back-in-stock notification button.
 * Shown on out-of-stock products. Submits email to /api/notify/back-in-stock.
 */
export function BackInStockButton({ productId, productName, className = "" }: BackInStockButtonProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/notify/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Erro ao registrar. Tente novamente.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300 ${className}`}>
        <Check className="h-4 w-4 shrink-0" />
        <span>Você será notificado quando <strong>{productName}</strong> estiver disponível.</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/14 hover:border-cyan-400/35 ${className}`}
      >
        <Bell className="h-4 w-4" />
        Avisar quando disponível
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <label className="text-xs uppercase tracking-widest text-white/50">
        Avise-me quando disponível
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
          aria-label="E-mail para notificação"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {status === "loading" ? "…" : "OK"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-xs text-red-400">{errorMsg}</p>
      )}
    </form>
  );
}
