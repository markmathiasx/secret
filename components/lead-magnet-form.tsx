"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { trackRequestQuote } from "@/lib/analytics";

export function LeadMagnetForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        subject: "Lead magnet - Guia primeira impressão 3D",
        message: `WhatsApp: ${form.get("phone") || ""}\nPrimeiro projeto: ${form.get("message") || ""}`,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok) {
      setStatus("error");
      setMessage(data?.error || "Não foi possível registrar o pedido do guia.");
      return;
    }

    trackRequestQuote("lead_magnet", "primeira_impressao_3d");
    setStatus("done");
    setMessage("Pedido registrado. A equipe envia o guia e pode ajudar no primeiro orçamento.");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <input name="name" required placeholder="Nome" className="field-base" />
      <input name="email" required type="email" placeholder="E-mail" className="field-base" />
      <input name="phone" placeholder="WhatsApp" className="field-base" />
      <textarea name="message" rows={4} placeholder="O que você quer imprimir primeiro?" className="field-base resize-none" />
      <button type="submit" disabled={status === "loading"} className="btn-primary justify-center gap-2 disabled:opacity-70">
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Quero receber o guia
      </button>
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-amber-200" : "text-emerald-200"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
