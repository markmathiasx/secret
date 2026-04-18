"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappNumber, supportEmail } from "@/lib/constants";

export default function ContatoPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao enviar mensagem.");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="section-kicker">Fale conosco</p>
        <h1 className="section-title">Contato</h1>
        <p className="section-copy">Envie sua mensagem e responderemos em breve.</p>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          <div className="glass-card">
            <p className="text-sm font-semibold text-white/70">WhatsApp</p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-emerald-200 hover:underline"
            >
              +55 21 92013-7249
            </a>
            <p className="mt-1 text-xs text-white/40">Resposta em horário comercial</p>
          </div>
          <div className="glass-card">
            <p className="text-sm font-semibold text-white/70">E-mail</p>
            <a href={`mailto:${supportEmail}`} className="mt-2 block text-cyan-200 hover:underline">
              {supportEmail}
            </a>
          </div>
          <div className="glass-card">
            <p className="text-sm font-semibold text-white/70">Localização</p>
            <p className="mt-2 text-sm text-white/60">Rio de Janeiro, RJ — Brasil</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          {status === "success" && (
            <div className="rounded-[16px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-200">
              ✓ Mensagem enviada! Retornaremos em breve.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-[16px] border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-white/70">Nome *</span>
              <input name="name" required value={form.name} onChange={handleChange} className="field-base" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-white/70">E-mail *</span>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="field-base" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Assunto</span>
            <input name="subject" value={form.subject} onChange={handleChange} className="field-base" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Mensagem *</span>
            <textarea name="message" required rows={5} value={form.message} onChange={handleChange} className="field-base resize-y" />
          </label>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Send className="h-4 w-4" />
            {loading ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </main>
  );
}
