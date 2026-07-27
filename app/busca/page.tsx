import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { StorefrontSearchBox } from "@/components/storefront-search-box";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Busca MDH 3D",
  description: "Busque produtos da MDH 3D com filtro por categoria, material, personalizacao, disponibilidade e faixa de preco.",
  alternates: { canonical: `${getSiteUrl()}/busca` },
};

type SearchPageParams = {
  q?: string;
  category?: string;
  collection?: string;
  status?: string;
  material?: string;
  intent?: string;
  sort?: string;
  mode?: string;
  custom?: string;
  min?: string;
  max?: string;
  page?: string;
};

type Props = { searchParams: Promise<SearchPageParams> };

export default async function BuscaPage({ searchParams }: Props) {
  const catalog = await getCatalogSnapshot();
  const params = await searchParams;
  const visualMode = params.mode === "real" || params.mode === "verified" ? params.mode : "all";
  const searchEntries = catalog.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    collection: product.collection,
    tags: product.tags,
    href: getProductUrl(product),
  }));
  const minPrice = catalog.length ? Math.min(...catalog.map((product) => product.pricePix)) : 0;
  const readyToShipCount = catalog.filter((product) => product.readyToShip).length;
  const customizableCount = catalog.filter((product) => product.customizable).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,19,27,0.98),rgba(7,16,22,0.94))] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.3)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div>
            <p className="section-kicker">Busca comercial</p>
            <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">Encontre mais rapido o produto certo para fechar.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/68">
              A busca usa sinonimos do catalogo, aceita erro pequeno de digitacao, guarda recentes no navegador e mantem URL compartilhavel para retomada.
            </p>
            <div className="mt-6 max-w-3xl">
              <StorefrontSearchBox
                products={searchEntries}
                actionPath="/busca"
                placeholder="Busque por nome, uso, categoria, lote ou personalizacao..."
                quickQueries={["chaveiro personalizado", "luminaria personalizada", "organizador de mesa", "brindes em lote"]}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/catalogo" className="btn-secondary gap-2 px-4 py-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" /> Ver catalogo completo
              </Link>
              <Link href="/imagem-para-impressao-3d" className="btn-secondary gap-2 px-4 py-2 text-sm">
                <ArrowRight className="h-4 w-4" /> Pedir sob medida
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Faixa inicial", formatCurrency(minPrice)],
              ["Personalizaveis", customizableCount.toLocaleString("pt-BR")],
              ["Pronta entrega", readyToShipCount.toLocaleString("pt-BR")],
              ["Catalogo curado", catalog.length.toLocaleString("pt-BR")],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/46">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <CatalogExplorer
          products={catalog}
          basePath="/busca"
          initialQuery={params.q || ""}
          initialCategory={params.category || "Todas"}
          initialCollection={params.collection || "Todas"}
          initialVisualMode={visualMode}
          initialAvailability={(params.status as "Todos" | "Pronta entrega" | "Sob encomenda" | undefined) || "Todos"}
          initialMaterial={params.material || "Todos"}
          initialIntent={params.intent || "Geral"}
          initialOrder={params.sort || "Destaques"}
          initialCustomizableOnly={params.custom === "1"}
          initialPriceMin={params.min ? Number(params.min) : undefined}
          initialPriceMax={params.max ? Number(params.max) : undefined}
          initialPage={params.page ? Number(params.page) : 1}
        />
      </section>
    </main>
  );
}
