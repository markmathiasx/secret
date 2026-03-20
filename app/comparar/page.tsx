"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Scale, Trash2 } from "lucide-react";
import { catalog, getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { useCompare } from "@/components/compare-context";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const { compareIds, clearCompare, toggleCompare } = useCompare();

  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (!idsParam) return;

    const ids = idsParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);

    ids.forEach((id) => {
      const exists = catalog.some((item) => item.id === id);
      if (exists && !compareIds.includes(id) && compareIds.length < 4) {
        toggleCompare(id);
      }
    });
  }, [compareIds, searchParams, toggleCompare]);

  const items = catalog.filter((product) => compareIds.includes(product.id));

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Comparador tecnico</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Compare ate 4 produtos lado a lado</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Campo tecnico, compatibilidade, preco Pix e disponibilidade para decidir com clareza.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar ao catalogo
          </Link>
          {items.length ? (
            <button onClick={clearCompare} className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              <Trash2 className="h-4 w-4" />
              Limpar comparador
            </button>
          ) : null}
        </div>
      </div>

      {!items.length ? (
        <div className="mt-6 rounded-[30px] border border-[#e8dac7] bg-white p-10 text-center">
          <Scale className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-lg font-semibold text-slate-900">Nenhum produto adicionado ao comparador.</p>
          <p className="mt-2 text-sm text-slate-600">No catalogo, clique em “Comparar” em ate 4 itens.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[30px] border border-[#e8dac7] bg-white">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-[#fff8ef] text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="border-b border-[#eadcc8] p-4">Campo</th>
                {items.map((item) => (
                  <th key={item.id} className="border-b border-[#eadcc8] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold normal-case tracking-normal text-slate-900">{item.name}</p>
                        <p className="mt-1 text-[11px] normal-case tracking-normal text-slate-500">{item.sku}</p>
                      </div>
                      <button
                        onClick={() => toggleCompare(item.id)}
                        className="rounded-full border border-[#e5d4be] bg-white px-3 py-1 text-[11px] font-semibold normal-case tracking-normal text-slate-700"
                      >
                        Remover
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { label: "Tipo", pick: (item: (typeof items)[number]) => item.technical.typeProduct },
                { label: "Compatibilidade", pick: (item: (typeof items)[number]) => item.technical.compatibilityModels.join(" / ") },
                { label: "Escopo", pick: (item: (typeof items)[number]) => item.technical.componentScope },
                { label: "Preco Pix", pick: (item: (typeof items)[number]) => formatCurrency(item.pricePix) },
                { label: "Preco Cartao", pick: (item: (typeof items)[number]) => formatCurrency(item.priceCard) },
                { label: "Estoque", pick: (item: (typeof items)[number]) => String(item.stock) },
                { label: "Status", pick: (item: (typeof items)[number]) => item.status },
                { label: "Lead time", pick: (item: (typeof items)[number]) => `${item.leadTimeDays} dia(s)` },
                { label: "Avaliacao", pick: (item: (typeof items)[number]) => `${item.rating.toFixed(1)} (${item.reviewCount})` },
              ].map((row) => (
                <tr key={row.label} className="border-b border-[#f0e5d6]">
                  <td className="p-4 font-semibold text-slate-700">{row.label}</td>
                  {items.map((item) => (
                    <td key={`${item.id}-${row.label}`} className="p-4 text-slate-700">
                      {row.pick(item)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 font-semibold text-slate-700">Acoes</td>
                {items.map((item) => (
                  <td key={`${item.id}-actions`} className="p-4">
                    <Link href={getProductUrl(item)} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white">
                      Ver produto
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
