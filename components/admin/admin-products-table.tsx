"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit2, Eye } from "lucide-react";
import type { AdminCatalogProduct } from "@/lib/server/admin-catalog-store";

const STATUS_COLORS: Record<string, string> = {
  "Pronta entrega": "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  "Sob encomenda": "border-amber-300/30 bg-amber-300/10 text-amber-100",
  READY_TO_SHIP: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  MADE_TO_ORDER: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  DRAFT: "border-white/20 bg-white/5 text-white/60",
  ARCHIVED: "border-rose-300/20 bg-rose-300/5 text-rose-300/70",
};

export function AdminProductsTable({ products }: { products: AdminCatalogProduct[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.id.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Buscar por título, id ou categoria…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field-base pl-9"
          />
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Categoria</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Preço Pix</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Estoque</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {filtered.map((product) => (
              <tr key={product.id} className="bg-white/[0.01] transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{product.title}</p>
                  <p className="text-xs text-white/40">{product.id}</p>
                </td>
                <td className="px-4 py-3 text-white/65">{product.category}</td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-200">{fmt(product.pricePix)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={product.stock > 0 ? "text-white" : "text-rose-300"}>{product.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[product.status] || "border-white/10 bg-white/5 text-white/60"}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-cyan-300/30 hover:text-cyan-100" title="Editar">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Link>
                    <Link href={`/catalogo/${product.slug}`} target="_blank" className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-emerald-300/30 hover:text-emerald-100" title="Ver no site">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-right text-xs text-white/40">{filtered.length} de {products.length} produto(s)</p>
    </div>
  );
}
