"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { Clock3, History, MessageCircleMore, Scale, Sparkles, Truck } from "lucide-react";
import { catalog, type Product } from "@/lib/catalog";
import { useRecentlyViewed } from "@/components/recently-viewed-context";
import { ProductShelf } from "@/components/product-shelf";
import { ShareButton } from "@/components/share-button";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency } from "@/lib/utils";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export default function RecentPage() {
  const { recentIds, clearRecent } = useRecentlyViewed();
  const [sortMode, setSortMode] = useState<"recent" | "price" | "rating" | "lead">("recent");
  const items = useMemo(() => {
    const base = recentIds
      .map((id) => catalog.find((product) => product.id === id))
      .filter((item): item is Product => Boolean(item));

    if (sortMode === "price") return [...base].sort((a, b) => a.pricePix - b.pricePix);
    if (sortMode === "rating") return [...base].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    if (sortMode === "lead") return [...base].sort((a, b) => a.leadTimeDays - b.leadTimeDays || a.pricePix - b.pricePix);
    return base;
  }, [recentIds, sortMode]);
  const avgPrice = items.length ? items.reduce((total, item) => total + item.pricePix, 0) / items.length : 0;
  const latestItem = items[0];
  const realCount = items.filter((item) => item.realPhoto).length;
  const readyCount = items.filter((item) => item.status === "Pronta entrega").length;
  const compareHref = items.length ? `/comparar?ids=${items.slice(0, 4).map((item) => item.id).join(",")}` : "/comparar";
  const skuBundle = items.map((item) => `${item.name} (${item.sku})`).join("\n");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `${whatsappMessage}\n\nQuero retomar estes itens vistos recentemente:\n${skuBundle}`
  )}`;
  const suggested = catalog.filter((product) => !recentIds.includes(product.id)).slice(0, 4);
  const dominantCollection = items.length
    ? [...items].sort(
        (a, b) =>
          items.filter((item) => item.collection === b.collection).length -
          items.filter((item) => item.collection === a.collection).length
      )[0]?.collection
    : "—";

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Histórico útil</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Vistos recentemente</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          A vitrine guarda os últimos produtos visitados para você retomar briefing, preço, imagem e decisão comercial sem recomeçar a busca.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar ao catálogo
          </Link>
          {items.length ? (
            <Link href={compareHref} className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              <Scale className="h-4 w-4" />
              Comparar os últimos
            </Link>
          ) : null}
          {items.length ? <ShareButton url="/recentes" title="Recentes MDH 3D" text={`Retomei ${items.length} itens recentes na MDH 3D.`} /> : null}
          {items.length ? <CopyButton value={skuBundle} label="Copiar lista recente" /> : null}
          {items.length ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700"
            >
              <MessageCircleMore className="h-4 w-4" />
              Retomar pelo WhatsApp
            </a>
          ) : null}
          {items.length ? (
            <button onClick={clearRecent} className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Limpar histórico
            </button>
          ) : null}
        </div>
        {items.length ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ordenar recentes por</span>
            {[
              { value: "recent", label: "mais recentes" },
              { value: "price", label: "menor Pix" },
              { value: "rating", label: "melhor avaliação" },
              { value: "lead", label: "menor prazo" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortMode(option.value as typeof sortMode)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                  sortMode === option.value ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#e5d4be] bg-white text-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {items.length ? (
          <>
            <div className="mb-6 grid gap-4 xl:grid-cols-5">
              <StatCard label="Ticket médio recente" value={formatCurrency(avgPrice)} helper="Faixa Pix dos itens vistos" />
              <StatCard label="Último item aberto" value={latestItem?.name || "—"} helper="Produto mais recente da sessão" />
              <StatCard label="Fotos reais" value={String(realCount).padStart(2, "0")} helper="Itens já validados visualmente" />
              <StatCard label="Pronta entrega" value={String(readyCount).padStart(2, "0")} helper="Possíveis fechamentos mais curtos" />
              <StatCard label="Coleção dominante" value={dominantCollection} helper="Linha visual mais recorrente na sessão" />
            </div>

            <ProductShelf
              title="Últimos produtos visitados"
              description="Útil para orçamentos em andamento, rechecagem de foto real e revisão de detalhes antes do fechamento."
              products={items}
              href="/favoritos"
              hrefLabel="Abrir favoritos"
              variant="recent"
            />

            <div className="mt-6 grid gap-4 xl:grid-cols-4">
              <InsightCard
                icon={<Clock3 className="h-4 w-4" />}
                label="Última intenção"
                title={latestItem?.category || "—"}
                description="A categoria mais recente costuma indicar o momento comercial em que a navegação parou."
              />
              <InsightCard
                icon={<Truck className="h-4 w-4" />}
                label="Ritmo da sessão"
                title={readyCount >= Math.ceil(items.length / 2) ? "Rota rápida" : "Rota exploratória"}
                description={readyCount >= Math.ceil(items.length / 2) ? "Há mais itens prontos para envio." : "Você ainda está em fase de descoberta e comparação."}
              />
              <InsightCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Melhor uso"
                title="Retomar, filtrar e salvar"
                description="Recentes é ideal para continuar de onde parou e mover só os mais fortes para favoritos."
              />
              <InsightCard
                icon={<Scale className="h-4 w-4" />}
                label="Ação imediata"
                title="Compare os 4 mais recentes"
                description="Quando a navegação já afinou o interesse, o comparador fecha a decisão com menos ruído."
              />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <InfoBlock
                title="Use recentes como fila de revisão"
                description="Esse histórico foi pensado para retomar o raciocínio sem precisar refazer filtro, busca ou rolagem."
              />
              <InfoBlock
                title="Se gostou, mova para favoritos"
                description="Favorito vira shortlist de fechamento; recente vira trilha de navegação. Agora as duas áreas se complementam melhor."
              />
              <InfoBlock
                title="Compartilhe o contexto antes de negociar"
                description="Mandar a lista no WhatsApp evita o vai-e-volta de “qual era aquele item mesmo?”."
              />
            </div>

            <div className="mt-6">
              <ProductShelf
                title="Continue a navegação por afinidade"
                description="Itens extras para seguir explorando sem perder o raciocínio da sessão atual."
                products={suggested}
                href="/catalogo"
                hrefLabel="Abrir catálogo completo"
                variant="favorites"
              />
            </div>
          </>
        ) : (
          <div className="rounded-[30px] border border-[#e8dac7] bg-white p-10 text-center">
            <History className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-900">Ainda não há histórico de navegação.</p>
            <p className="mt-2 text-sm text-slate-600">Ao abrir um produto, ele aparece aqui automaticamente.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function InsightCard({ icon, label, title, description }: { icon: ReactNode; label: string; title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function InfoBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
