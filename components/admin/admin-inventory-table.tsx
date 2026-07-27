"use client";

import { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import type { AdminCatalogProduct } from "@/lib/server/admin-catalog-store";

export function AdminInventoryTable({ products }: { products: AdminCatalogProduct[] }) {
  const [edits, setEdits] = useState<Record<string, { quantity: string; reorderLevel: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setEdit(id: string, field: "quantity" | "reorderLevel", value: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || { quantity: "", reorderLevel: "" }), [field]: value } }));
  }

  async function handleSave(product: AdminCatalogProduct) {
    const edit = edits[product.id];
    if (!edit) return;

    setSaving((prev) => ({ ...prev, [product.id]: true }));
    setErrors((prev) => ({ ...prev, [product.id]: "" }));

    try {
      const payload: Record<string, number> = {};
      if (edit.quantity !== "") payload.quantity = Number(edit.quantity);
      if (edit.reorderLevel !== "") payload.reorderLevel = Number(edit.reorderLevel);
      const delta = payload.quantity !== undefined ? payload.quantity - product.stock : 0;
      const confirmationText =
        payload.quantity !== undefined && Math.abs(delta) >= 5
          ? window.prompt(`Digite "AJUSTAR ESTOQUE ${product.id}" para continuar.`) || undefined
          : undefined;
      if (payload.quantity !== undefined && Math.abs(delta) >= 5 && !confirmationText) {
        throw new Error("Ajuste crítico abortado: confirmação obrigatória.");
      }

      const res = await fetch(`/api/admin/inventory/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, confirmationText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Falha ao salvar.");
      }

      setSaved((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [product.id]: false })), 2000);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [product.id]: err instanceof Error ? err.message : "Erro." }));
    } finally {
      setSaving((prev) => ({ ...prev, [product.id]: false }));
    }
  }

  return (
    <div className="overflow-x-auto rounded-[24px] border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Produto</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Estoque atual</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Novo estoque</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Alerta mín.</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((product) => {
            const edit = edits[product.id] || { quantity: "", reorderLevel: "" };
            const isSaving = saving[product.id];
            const isSaved = saved[product.id];
            const error = errors[product.id];
            const isDirty = edit.quantity !== "" || edit.reorderLevel !== "";

            return (
              <tr key={product.id} className="bg-white/[0.01] transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{product.title}</p>
                  <p className="text-xs text-white/40">{product.category}</p>
                  {error && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-300">
                      <AlertTriangle className="h-3 w-3" /> {error}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={product.stock === 0 ? "text-rose-300" : product.stock <= 5 ? "text-amber-200" : "text-white"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min={0}
                    value={edit.quantity}
                    onChange={(e) => setEdit(product.id, "quantity", e.target.value)}
                    placeholder={String(product.stock)}
                    className="w-20 rounded-[12px] border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-cyan-300/40 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min={0}
                    value={edit.reorderLevel}
                    onChange={(e) => setEdit(product.id, "reorderLevel", e.target.value)}
                    placeholder="5"
                    className="w-16 rounded-[12px] border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white focus:border-cyan-300/40 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSave(product)}
                    disabled={!isDirty || isSaving}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isSaved
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                        : isDirty
                        ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                        : "border-white/10 bg-white/5 text-white/30"
                    }`}
                  >
                    <Save className="h-3 w-3" />
                    {isSaving ? "…" : isSaved ? "Salvo" : "Salvar"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
