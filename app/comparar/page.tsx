"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircleMore, Scale, Star, TimerReset, Trash2, Truck, Wallet } from "lucide-react";
import { catalog, getProductUrl } from "@/lib/catalog";
import { ShareButton } from "@/components/share-button";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency } from "@/lib/utils";
import { useCompare } from "@/components/compare-context";
import { SafeProductImage } from "@/components/safe-product-image";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

function buildScore(item: (typeof catalog)[number]) {
  const realBoost = item.realPhoto ? 18 : 0;
  const readyBoost = item.status === "Pronta entrega" ? 14 : 0;
  const ratingBoost = item.rating * 10;
  const stockBoost = Math.min(item.stock, 12);
  const leadPenalty = item.leadTimeDays * 4;
  const pricePenalty = item.pricePix / 40;
  return Number((realBoost + readyBoost + ratingBoost + stockBoost - leadPenalty - pricePenalty).toFixed(1));
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const { compareIds, clearCompare, toggleCompare, replaceCompare } = useCompare();

  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (!idsParam) return;

    const ids = idsParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);

    const validIds = ids.filter((id) => catalog.some((item) => item.id === id));
    if (validIds.length) replaceCompare(validIds);
  }, [replaceCompare, searchParams]);

  const items = catalog.filter((product) => compareIds.includes(product.id)).slice(0, 4);
  const cheapest = useMemo(() => [...items].sort((a, b) => a.pricePix - b.pricePix)[0], [items]);
  const fastest = useMemo(() => [...items].sort((a, b) => a.leadTimeDays - b.leadTimeDays)[0], [items]);
  const bestRated = useMemo(() => [...items].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)[0], [items]);
  const bestOverall = useMemo(() => [...items].sort((a, b) => buildScore(b) - buildScore(a))[0], [items]);
  const mostReal = items.filter((item) => item.realPhoto).length;
  const highestStock = useMemo(() => [...items].sort((a, b) => b.stock - a.stock)[0], [items]);
  const averagePix = items.length ? items.reduce((total, item) => total + item.pricePix, 0) / items.length : 0;
  const priceSpread = items.length ? Math.max(...items.map((item) => item.pricePix)) - Math.min(...items.map((item) => item.pricePix)) : 0;
  const compareShareUrl = items.length ? `/comparar?ids=${items.map((item) => item.id).join(",")}` : "/comparar";
  const skuBundle = items.map((item) => `${item.name} (${item.sku})`).join("\n");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `${whatsappMessage}\n\nQuero comparar estes itens:\n${skuBundle}`
  )}`;

  const rows = [
    { label: "Visual", pick: (item: (typeof items)[number]) => (item.realPhoto ? "Foto real" : "Imagem conceitual") },
    { label: "Tipo", pick: (item: (typeof items)[number]) => item.technical.typeProduct },
    { label: "Coleção", pick: (item: (typeof items)[number]) => item.collection },
    { label: "Compatibilidade", pick: (item: (typeof items)[number]) => item.technical.compatibilityModels.join(" / ") },
    { label: "Escopo", pick: (item: (typeof items)[number]) => item.technical.componentScope },
    { label: "Material", pick: (item: (typeof items)[number]) => item.material },
    { label: "Personalização", pick: (item: (typeof items)[number]) => (item.customizable ? "Sim" : "Não") },
    {
      label: "Preço Pix",
      pick: (item: (typeof items)[number]) => formatCurrency(item.pricePix),
      highlight: (item: (typeof items)[number]) => item.id === cheapest?.id,
    },
    { label: "Preço Cartão", pick: (item: (typeof items)[number]) => formatCurrency(item.priceCard) },
    {
      label: "Lead time",
      pick: (item: (typeof items)[number]) => `${item.leadTimeDays} dia(s)`,
      highlight: (item: (typeof items)[number]) => item.id === fastest?.id,
    },
    {
      label: "Avaliação",
      pick: (item: (typeof items)[number]) => `${item.rating.toFixed(1)} (${item.reviewCount})`,
      highlight: (item: (typeof items)[number]) => item.id === bestRated?.id,
    },
    {
      label: "Score geral",
      pick: (item: (typeof items)[number]) => String(buildScore(item)),
      highlight: (item: (typeof items)[number]) => item.id === bestOverall?.id,
    },
    { label: "Estoque", pick: (item: (typeof items)[number]) => String(item.stock) },
    { label: "Status", pick: (item: (typeof items)[number]) => item.status },
    { label: "Janela comercial", pick: (item: (typeof items)[number]) => item.productionWindow },
  ];

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Comparador técnico</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Compare até 4 produtos lado a lado</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Campo técnico, compatibilidade, prova visual, preço Pix e disponibilidade para decidir com mais segurança.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar ao catálogo
          </Link>
          {items.length ? <ShareButton url={compareShareUrl} title="Comparação MDH 3D" text={`Separei ${items.length} itens para comparar.`} /> : null}
          {items.length ? <CopyButton value={skuBundle} label="Copiar lista comparada" /> : null}
          {items.length ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700"
            >
              <MessageCircleMore className="h-4 w-4" />
              Mandar comparação no WhatsApp
            </a>
          ) : null}
          {bestOverall ? (
            <Link href={getProductUrl(bestOverall)} className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Abrir melhor equilíbrio
            </Link>
          ) : null}
          {items.length ? (
            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
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
          <p className="mt-2 text-sm text-slate-600">No catálogo, clique em “Comparar” em até 4 itens.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 xl:grid-cols-6">
            <InsightCard
              icon={<Wallet className="h-4 w-4" />}
              label="Melhor custo Pix"
              title={cheapest?.name || "—"}
              description={cheapest ? `${formatCurrency(cheapest.pricePix)} no Pix` : "Sem item"}
            />
            <InsightCard
              icon={<TimerReset className="h-4 w-4" />}
              label="Prazo mais curto"
              title={fastest?.name || "—"}
              description={fastest ? `${fastest.leadTimeDays} dia(s) de lead time` : "Sem item"}
            />
            <InsightCard
              icon={<Star className="h-4 w-4" />}
              label="Melhor avaliação"
              title={bestRated?.name || "—"}
              description={bestRated ? `${bestRated.rating.toFixed(1)} • ${bestRated.reviewCount} reviews` : "Sem item"}
            />
            <InsightCard
              icon={<Scale className="h-4 w-4" />}
              label="Melhor equilíbrio"
              title={bestOverall?.name || "—"}
              description={bestOverall ? `Score ${buildScore(bestOverall)}` : "Sem item"}
            />
            <InsightCard
              icon={<Truck className="h-4 w-4" />}
              label="Estoque mais folgado"
              title={highestStock?.name || "—"}
              description={highestStock ? `${highestStock.stock} unidade(s)` : "Sem item"}
            />
            <InsightCard
              icon={<Scale className="h-4 w-4" />}
              label="Fotos reais"
              title={`${mostReal}/${items.length}`}
              description="Itens com prova visual real no comparador"
            />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            <StatCard label="Média Pix" value={formatCurrency(averagePix)} helper="Preço médio do grupo" />
            <StatCard label="Diferença de preços" value={formatCurrency(priceSpread)} helper="Distância entre o mais barato e o mais caro" />
            <StatCard label="Ritmo do grupo" value={items.some((item) => item.status === "Pronta entrega") ? "Tem giro rápido" : "Só sob encomenda"} helper="Leitura de fechamento mais rápida" />
            <StatCard label="Leitura útil" value={bestOverall?.collection || "—"} helper="Linha com melhor equilíbrio geral" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            <InfoBlock
              title="Olhe primeiro visual, prazo e Pix"
              description="Esses três campos costumam resolver a maior parte da decisão antes mesmo de entrar no detalhe técnico completo."
            />
            <InfoBlock
              title="Se um item ganhar por pouco"
              description="Leve o vencedor para fechamento e mantenha o outro nos favoritos para não perder a alternativa."
            />
            <InfoBlock
              title="Não misture prova visual"
              description="Foto real e imagem conceitual seguem explicitamente separadas no comparador para evitar falsa equivalência."
            />
            <InfoBlock
              title="Use score como atalho, não como verdade"
              description="O score ajuda a priorizar, mas a decisão final ainda deve considerar uso real, briefing e coleção."
            />
          </div>

          <div className="mt-6 overflow-x-auto rounded-[30px] border border-[#e8dac7] bg-white">
            <table className="min-w-[980px] w-full border-collapse">
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
                <tr className="border-b border-[#f0e5d6] bg-[#fffdf9]">
                  <td className="p-4 font-semibold text-slate-700">Preview</td>
                  {items.map((item) => (
                    <td key={`${item.id}-preview`} className="p-4">
                      <Link href={getProductUrl(item)} className="block rounded-[22px] border border-[#eadcc8] bg-[#fff8ef] p-3">
                        <div className="relative mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f5e7d6_100%)]">
                          <SafeProductImage product={item} alt={item.name} className="w-full object-contain p-3" />
                        </div>
                      </Link>
                    </td>
                  ))}
                </tr>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-[#f0e5d6]">
                    <td className="p-4 font-semibold text-slate-700">{row.label}</td>
                    {items.map((item) => (
                      <td
                        key={`${item.id}-${row.label}`}
                        className={`p-4 text-slate-700 ${
                          row.highlight?.(item) ? "bg-emerald-50 font-semibold text-emerald-900" : ""
                        }`}
                      >
                        {row.pick(item)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 font-semibold text-slate-700">Ações</td>
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

          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            <InfoBlock
              title="Melhor para economizar"
              description={cheapest ? `${cheapest.name} entrega o menor Pix do grupo.` : "Sem item suficiente para leitura."}
            />
            <InfoBlock
              title="Melhor para fechar rápido"
              description={fastest ? `${fastest.name} lidera em lead time e acelera a conversão.` : "Sem item suficiente para leitura."}
            />
            <InfoBlock
              title="Melhor para confiança"
              description={bestRated ? `${bestRated.name} ganha em avaliação e prova social.` : "Sem item suficiente para leitura."}
            />
            <InfoBlock
              title="Melhor equilíbrio geral"
              description={bestOverall ? `${bestOverall.name} combina score, prazo, visual e preço de forma mais estável.` : "Sem item suficiente para leitura."}
            />
          </div>
        </>
      )}
    </section>
  );
}

function InsightCard({
  icon,
  label,
  title,
  description,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#e8dac7] bg-white p-5">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-[#e8dac7] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function InfoBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-[#e8dac7] bg-white p-5">
      <p className="text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
