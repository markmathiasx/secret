"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminCatalogProduct } from "@/lib/server/admin-catalog-store";

export function AdminProductEditForm({ product }: { product: AdminCatalogProduct }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    category: product.category,
    collection: product.collection,
    material: product.material,
    finish: product.finish,
    pricePix: String(product.pricePix),
    priceCard: String(product.priceCard),
    stock: String(product.stock),
    status: product.status,
    readyToShip: product.readyToShip,
    customizable: product.customizable,
    featured: product.featured,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePix: Number(form.pricePix),
          priceCard: Number(form.priceCard),
          stock: Number(form.stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar.");
      setSuccess("Produto atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card max-w-xl space-y-4">
      {error && <p className="rounded-[16px] border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
      {success && <p className="rounded-[16px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-200">{success}</p>}

      <label className="block">
        <span className="mb-1 block text-sm text-white/70">Título</span>
        <input name="title" value={form.title} onChange={handleChange} className="field-base" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-white/70">Descrição</span>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="field-base resize-y" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Categoria</span>
          <input name="category" value={form.category} onChange={handleChange} className="field-base" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Coleção</span>
          <input name="collection" value={form.collection} onChange={handleChange} className="field-base" />
        </label>
      </div>

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
          <span className="mb-1 block text-sm text-white/70">Preço Pix (R$)</span>
          <input name="pricePix" type="number" step={0.01} min={0} value={form.pricePix} onChange={handleChange} className="field-base" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Preço Cartão (R$)</span>
          <input name="priceCard" type="number" step={0.01} min={0} value={form.priceCard} onChange={handleChange} className="field-base" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Estoque</span>
          <input name="stock" type="number" min={0} value={form.stock} onChange={handleChange} className="field-base" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-white/70">Status</span>
        <select name="status" value={form.status} onChange={handleChange} className="field-base">
          <option value="Pronta entrega">Pronta entrega</option>
          <option value="Sob encomenda">Sob encomenda</option>
        </select>
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
          {loading ? "Salvando…" : "Salvar alterações"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
          Voltar
        </button>
      </div>
    </form>
  );
}
