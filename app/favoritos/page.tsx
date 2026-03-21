"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { Heart, MessageCircleMore, Scale, Sparkles, Star, Truck, Wallet } from "lucide-react";
import { catalog } from "@/lib/catalog";
import { useFavorites } from "@/components/favorites-context";
import { ProductShelf } from "@/components/product-shelf";
import { ShareButton } from "@/components/share-button";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency } from "@/lib/utils";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export default function FavoritesPage() {
  const { favoriteIds, clearFavorites } = useFavorites();
  const [sortMode, setSortMode] = useState<"saved" | "price" | "rating" | "lead">("saved");
  const items = useMemo(() => {
    const base = catalog.filter((product) => favoriteIds.includes(product.id));
    if (sortMode === "price") return [...base].sort((a, b) => a.pricePix - b.pricePix);
    if (sortMode === "rating") return [...base].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    if (sortMode === "lead") return [...base].sort((a, b) => a.leadTimeDays - b.leadTimeDays || a.pricePix - b.pricePix);

    return favoriteIds.map((id) => base.find((product) => product.id === id)).filter(Boolean) as typeof base;
  }, [favoriteIds, sortMode]);
  const averagePrice = items.length ? items.reduce((total, item) => total + item.pricePix, 0) / items.length : 0;
  const totalPix = items.reduce((total, item) => total + item.pricePix, 0);
  const realPhotos = items.filter((item) => item.realPhoto).length;
  const readyCount = items.filter((item) => item.status === "Pronta entrega").length;
  const customizableCount = items.filter((item) => item.customizable).length;
  const categoryMix = new Set(items.map((item) => item.category)).size;
  const topRated = [...items].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)[0];
  const compareHref = items.length ? `/comparar?ids=${items.slice(0, 4).map((item) => item.id).join(",")}` : "/comparar";
  const skuBundle = items.map((item) => `${item.name} (${item.sku})`).join("\n");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `${whatsappMessage}\n\nSeparei estes favoritos para revisar:\n${skuBundle}`
  )}`;
  const recommendedThemes = new Set(items.map((item) => item.theme));
  const recommendedCollections = new Set(items.map((item) => item.collection));
  const recommended = catalog
    .filter((product) => !favoriteIds.includes(product.id))
    .filter((product) => recommendedThemes.has(product.theme) || recommendedCollections.has(product.collection))
    .slice(0, 4);
  const leadRange = items.length
    ? `${Math.min(...items.map((item) => item.leadTimeDays))} a ${Math.max(...items.map((item) => item.leadTimeDays))} dia(s)`
    : "—";

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Curadoria salva</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Seus favoritos de catálogo</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Aqui ficam os itens que você separou para retomar depois, comparar com calma, montar uma shortlist e mandar para fechamento humano.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar ao catálogo
          </Link>
          {items.length ? (
            <Link href={compareHref} className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              <Scale className="h-4 w-4" />
              Comparar shortlist
            </Link>
          ) : null}
          {items.length ? <ShareButton url={compareHref} title="Favoritos MDH 3D" text={`Separei ${items.length} favoritos na MDH 3D.`} /> : null}
          {items.length ? <CopyButton value={skuBundle} label="Copiar lista de SKUs" /> : null}
          {items.length ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700"
            >
              <MessageCircleMore className="h-4 w-4" />
              Enviar no WhatsApp
            </a>
          ) : null}
          {items.length ? (
            <button onClick={clearFavorites} className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Limpar favoritos
            </button>
          ) : null}
        </div>
        {items.length ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ordenar favoritos por</span>
            {[
              { value: "saved", label: "ordem salva" },
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
              <StatCard label="Ticket médio salvo" value={formatCurrency(averagePrice)} helper="Média Pix da sua seleção atual" />
              <StatCard label="Total no Pix" value={formatCurrency(totalPix)} helper="Soma do recorte favorito" />
              <StatCard label="Fotos reais" value={String(realPhotos).padStart(2, "0")} helper="Provas visuais concretas" />
              <StatCard label="Pronta entrega" value={String(readyCount).padStart(2, "0")} helper="Itens com giro mais curto" />
              <StatCard label="Categorias" value={String(categoryMix).padStart(2, "0")} helper="Variedade do seu mix salvo" />
            </div>

            <ProductShelf
              title="Itens que você marcou"
              description="Favoritos persistem no navegador para facilitar retorno, comparação e fechamento de pedido."
              products={items}
              href="/comparar"
              hrefLabel="Abrir comparador"
              variant="favorites"
            />

            <div className="mt-6 grid gap-4 xl:grid-cols-4">
              <InsightCard
                icon={<Star className="h-4 w-4" />}
                label="Melhor avaliado"
                title={topRated?.name || "—"}
                description={topRated ? `${topRated.rating.toFixed(1)} • ${topRated.reviewCount} reviews` : "Sem destaque ainda"}
              />
              <InsightCard
                icon={<Truck className="h-4 w-4" />}
                label="Faixa de prazo"
                title={leadRange}
                description="Janela útil para decidir entre fechar agora ou consolidar mais itens"
              />
              <InsightCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Personalizáveis"
                title={`${customizableCount}/${items.length}`}
                description="Itens que pedem briefing ou ajuste antes do fechamento"
              />
              <InsightCard
                icon={<Wallet className="h-4 w-4" />}
                label="Leitura comercial"
                title={readyCount >= Math.ceil(items.length / 2) ? "Seleção rápida" : "Seleção de curadoria"}
                description={readyCount >= Math.ceil(items.length / 2) ? "Seu recorte tende a fechar mais rápido." : "Sua seleção pede comparação antes de converter."}
              />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <InfoBlock
                title="Próximo passo recomendado"
                description="Se você já tem até 4 itens fortes, leve a shortlist para o comparador e feche olhando Pix, prazo, prova visual e avaliação no mesmo contexto."
              />
              <InfoBlock
                title="Curadoria pessoal"
                description="Favoritos agora funcionam como mini vitrine privada: você salva, compartilha, compara e volta depois sem perder o raciocínio."
              />
              <InfoBlock
                title="Critério rápido"
                description="Quando quiser giro mais curto, priorize foto real + pronta entrega + avaliação alta. Essa combinação costuma reduzir atrito na decisão."
              />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <InfoBlock
                title="Se a shortlist está muito ampla"
                description="Use categorias, coleção e lead time para dividir o grupo em duas rodadas: primeiro o que fecha agora, depois o que pede briefing."
              />
              <InfoBlock
                title="Se você quer mandar para aprovação"
                description="Copie a lista de SKUs e compartilhe pelo WhatsApp. Isso evita o vai-e-volta de links separados ou prints perdidos."
              />
              <InfoBlock
                title="Se quiser limpar sem se arrepender"
                description="Abra antes o comparador ou compartilhe sua seleção. Assim a limpeza não apaga seu contexto comercial útil."
              />
            </div>

            <div className="mt-6">
              <ProductShelf
                title="Pode complementar seu recorte"
                description="Itens extras da vitrine para expandir a seleção sem perder o foco do tema ou estilo que você já salvou."
                products={recommended.length ? recommended : catalog.filter((product) => !favoriteIds.includes(product.id)).slice(0, 4)}
                href="/catalogo"
                hrefLabel="Explorar mais itens"
                variant="recent"
              />
            </div>
          </>
        ) : (
          <div className="rounded-[30px] border border-[#e8dac7] bg-white p-10 text-center">
            <Heart className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-900">Nenhum favorito salvo ainda.</p>
            <p className="mt-2 text-sm text-slate-600">No catálogo, use o coração para guardar itens que merecem revisão depois.</p>
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
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
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
