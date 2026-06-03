"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculateCardPrice } from "@/lib/payment-pricing";

function parseNumber(value: string) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    sku: "",
    title: "",
    description: "",
    material: "PLA",
    finish: "Padrão",
    pricePix: "",
    priceCard: "",
    stock: "0",
    productionWindow: "5–10 dias úteis",
    readyToShip: false,
    customizable: false,
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => {
      if (target.name === "pricePix" && typeof value === "string") {
        return { ...prev, pricePix: value, priceCard: String(calculateCardPrice(parseNumber(value))) };
      }
      return { ...prev, [target.name]: value };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePix: parseNumber(form.pricePix),
          priceCard: calculateCardPrice(parseNumber(form.pricePix)),
          stock: Number(form.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar produto.");
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Catálogo</p>
        <h2 className="section-title">Novo produto</h2>
      </div>

      <form onSubmit={handleSubmit} className="glass-card max-w-xl space-y-4">
        {error && <p className="rounded-[16px] border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">SKU *</span>
            <input name="sku" required value={form.sku} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Título *</span>
            <input name="title" required value={form.title} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Descrição</span>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="field-base resize-y" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Material</span>
            <input name="material" value={form.material} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Acabamento</span>
            <input name="finish" value={form.finish} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Preço Pix (R$) *</span>
            <input name="pricePix" type="number" step={0.01} min={0} required value={form.pricePix} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Preço Cartão (Pix + R$ 1,00)</span>
            <input name="priceCard" type="number" step={0.01} min={0} value={form.priceCard} readOnly className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Estoque</span>
            <input name="stock" type="number" min={0} value={form.stock} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Prazo de produção</span>
          <input name="productionWindow" value={form.productionWindow} onChange={handleChange} className="field-base" />
        </label>

        <div className="flex flex-wrap gap-4 text-sm text-white/70">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="readyToShip" checked={form.readyToShip} onChange={handleChange} />
            Pronta entrega
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="customizable" checked={form.customizable} onChange={handleChange} />
            Personalizável
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Destaque
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Criando…" : "Criar produto"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
