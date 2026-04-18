"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNewCouponPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    title: "",
    type: "PERCENT",
    value: "",
    minOrderValue: "",
    freeShipping: false,
    usageLimit: "",
    startsAt: "",
    endsAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar cupom.");
      router.push("/admin/coupons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Promoções</p>
        <h2 className="section-title">Novo cupom</h2>
      </div>

      <form onSubmit={handleSubmit} className="glass-card max-w-lg space-y-4">
        {error && <p className="rounded-[16px] border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}

        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Código *</span>
          <input name="code" required value={form.code} onChange={handleChange} placeholder="DESCONTO10" className="field-base uppercase" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Título</span>
          <input name="title" value={form.title} onChange={handleChange} placeholder="10% de desconto" className="field-base" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Tipo *</span>
            <select name="type" value={form.type} onChange={handleChange} className="field-base">
              <option value="PERCENT">Percentual (%)</option>
              <option value="FIXED">Fixo (R$)</option>
              <option value="SHIPPING">Frete grátis</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Valor *</span>
            <input name="value" type="number" min={0} step={0.01} required value={form.value} onChange={handleChange} placeholder="10" className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Pedido mínimo (R$)</span>
            <input name="minOrderValue" type="number" min={0} value={form.minOrderValue} onChange={handleChange} placeholder="0" className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Limite de usos</span>
            <input name="usageLimit" type="number" min={1} value={form.usageLimit} onChange={handleChange} placeholder="Ilimitado" className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Início</span>
            <input name="startsAt" type="datetime-local" value={form.startsAt} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Término</span>
            <input name="endsAt" type="datetime-local" value={form.endsAt} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="freeShipping" checked={form.freeShipping} onChange={handleChange} className="rounded" />
          Frete grátis junto com o desconto
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Criando…" : "Criar cupom"}
          </button>
          <button type="button" onClick={() => router.push("/admin/coupons")} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
