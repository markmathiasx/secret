"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, CheckCircle } from "lucide-react";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { PostPurchaseHub } from "@/components/post-purchase-hub";

const RETURN_REASONS = [
  "Produto danificado",
  "Produto diferente do pedido",
  "Produto com defeito de impressão",
  "Pedido duplicado",
  "Não gostei do produto",
  "Outro motivo",
];

type Step = 0 | 1 | 2;

export default function DevolucoesPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState({
    orderCode: "",
    customerName: "",
    email: "",
    reason: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderCode = searchParams.get("order") || searchParams.get("code") || "";
    if (!orderCode) return;
    setForm((current) => (current.orderCode ? current : { ...current, orderCode }));
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao registrar solicitação.");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="section-kicker">Pós-venda</p>
        <h1 className="section-title">Devoluções e trocas</h1>
        <p className="section-copy">Abra uma solicitação de devolução ou troca em 3 passos simples. Você recebe confirmação por e-mail e a equipe segue o fluxo com você.</p>
      </div>

      <PurchaseProtectionBanner compact />

      <div className="mt-4">
        <PostPurchaseHub orderCode={form.orderCode || null} compact />
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        {["Verificação", "Detalhes", "Confirmação"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${i <= step ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/5 text-white/30"}`}>
              {i + 1}
            </div>
            <span className={i <= step ? "text-white" : "text-white/30"}>{label}</span>
            {i < 2 && <ChevronRight className="h-3 w-3 text-white/20" />}
          </div>
        ))}
      </div>

      {step === 2 ? (
        <div className="glass-card text-center py-10">
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-emerald-300" />
          <h2 className="text-xl font-bold text-white">Solicitação registrada!</h2>
          <p className="mt-3 text-white/60 leading-7">
            Recebemos sua solicitação referente ao pedido <strong className="text-white">{form.orderCode}</strong>.
            Você receberá um e-mail de confirmação e entraremos em contato em breve.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          {error && (
            <p className="rounded-[16px] border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>
          )}

          {step === 0 && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm text-white/70">Código do pedido *</span>
                <input name="orderCode" required value={form.orderCode} onChange={handleChange} placeholder="Ex: MDH-001234" className="field-base" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-white/70">Seu nome *</span>
                <input name="customerName" required value={form.customerName} onChange={handleChange} className="field-base" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-white/70">E-mail *</span>
                <input type="email" name="email" required value={form.email} onChange={handleChange} className="field-base" />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!form.orderCode || !form.customerName || !form.email) {
                    setError("Preencha todos os campos.");
                    return;
                  }
                  setError("");
                  setStep(1);
                }}
                className="btn-primary"
              >
                Continuar
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm text-white/70">Motivo da devolução *</span>
                <select name="reason" required value={form.reason} onChange={handleChange} className="field-base">
                  <option value="">Selecione o motivo…</option>
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-white/70">Descrição adicional</span>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Descreva o problema com mais detalhes…" className="field-base resize-y" />
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary">
                  Voltar
                </button>
                <button type="submit" disabled={loading || !form.reason} className="btn-primary">
                  {loading ? "Enviando…" : "Registrar solicitação"}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <div className="mt-6 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-white/60 leading-7">
        <p className="font-semibold text-white/80">Política de devolução</p>
        <p className="mt-2">Aceitamos devoluções dentro de 7 dias corridos após o recebimento. O produto deve estar em sua embalagem original. Entraremos em contato para orientar o processo de envio e a próxima etapa.</p>
      </div>
    </main>
  );
}
