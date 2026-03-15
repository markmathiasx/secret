"use client";

<<<<<<< ours
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { catalog, categories, collections } from "@/lib/catalog";
import { CatalogGrid } from "@/components/catalog-grid";

type Props = {
  products?: Product[];
};
=======
import { useMemo, useState } from "react";
import Link from "next/link";
import { categories, collections, getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { FavoriteButton } from "@/components/favorite-button";

const PAGE_SIZE = 60;
const badges = ["Mais vendido", "Foto real", "Pronta entrega", "Sob encomenda", "Personalizável"];
<<<<<<< ours
>>>>>>> theirs

function matchesQuery(product: Product, query: string) {
  if (!query) return true;

  const haystack = [
    product.name,
    product.category,
    product.theme,
    product.collection,
    product.description,
    ...product.tags
  ]
    .join(" ")
    .toLowerCase();

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}
=======
>>>>>>> theirs

export function CatalogExplorer({ products = catalog }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCollection, setSelectedCollection] = useState("Todas");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc">("relevance");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredProducts = useMemo(() => {
    const next = products.filter((product) => {
      if (selectedCategory !== "Todas" && product.category !== selectedCategory) return false;
      if (selectedCollection !== "Todas" && product.collection !== selectedCollection) return false;
      if (featuredOnly && !product.featured) return false;
      return matchesQuery(product, deferredQuery);
    });

    if (sortBy === "price-asc") return [...next].sort((left, right) => left.pricePix - right.pricePix);
    if (sortBy === "price-desc") return [...next].sort((left, right) => right.pricePix - left.pricePix);

    return next;
  }, [deferredQuery, featuredOnly, products, selectedCategory, selectedCollection, sortBy]);

  return (
<<<<<<< ours
    <div className="space-y-8">
      <div className="rounded-[32px] border border-white/10 bg-card p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Explorer</p>
            <h2 className="mt-2 text-3xl font-black text-white">Filtre por tema, colecao e faixa de preco</h2>
            <p className="mt-2 max-w-3xl text-white/65">
              O catalogo foi preparado para continuar funcional mesmo sem Google Maps, Supabase ou imagens remotas.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
            {filteredProducts.length} resultado(s) encontrado(s)
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.45fr))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
=======
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar peça</span>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
            <input
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setQuery(nextValue));
              }}
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
              placeholder="Buscar por nome, tema, colecao ou categoria"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-11 py-3 text-white outline-none placeholder:text-white/30"
=======
              placeholder="Busque por tema, categoria ou uso"
=======
              placeholder="Buscar por tema, categoria, uso ou nome da peça"
>>>>>>> theirs
=======
              placeholder="Buscar por tema, categoria, uso ou nome da peça"
>>>>>>> theirs
=======
              placeholder="Buscar por tema, categoria, uso ou nome da peça"
>>>>>>> theirs
=======
              placeholder="Buscar por tema, categoria, uso ou nome da peça"
>>>>>>> theirs
=======
              placeholder="Busque por tema, categoria ou uso"
>>>>>>> theirs
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
>>>>>>> theirs
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Categoria</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Todas</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Colecao</span>
            <select
              value={selectedCollection}
              onChange={(event) => setSelectedCollection(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Todas</option>
              {collections.map((collection) => (
                <option key={collection}>{collection}</option>
              ))}
            </select>
          </label>

<<<<<<< ours
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Ordenar</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="relevance">Mais relevantes</option>
              <option value="price-asc">Menor preco Pix</option>
              <option value="price-desc">Maior preco Pix</option>
            </select>
          </label>
=======
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
<<<<<<< ours
<<<<<<< ours
          <span>{filtered.length} resultados disponíveis</span>
=======
          <span>{filtered.length} resultados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Portfólio completo com mídia local e fallback premium</span>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Preço inicial, prazo e acabamento em todos os cards</span>
>>>>>>> theirs
=======
          <span>{filtered.length} resultados disponíveis</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Preço inicial, prazo e acabamento em todos os cards</span>
>>>>>>> theirs
        </div>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
        <div className="mt-5 flex flex-wrap gap-3">
=======
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 text-center">
          <p className="text-sm text-white/70">Nenhum item encontrado com os filtros atuais.</p>
          <p className="mt-2 text-xs text-white/50">Tente remover categoria/coleção ou use termos mais amplos.</p>
        </div>
      ) : null}

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((product, index) => (
          <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
            <div className="relative">
              <ProductImageGallery product={product} compact />
              <div className="absolute right-3 top-3">
                <FavoriteButton productId={product.id} />
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{product.productionWindow}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
            </div>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-white/45">A partir de</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
                <p className="text-xs text-white/45">Acabamento fosco ou acetinado</p>
              </div>
              <Link
                href={getProductUrl(product)}
                className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
              >
                Ver produto
              </Link>
            </div>
          </article>
        ))}
      </div>

      {visible < filtered.length ? (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setVisible((prev) => prev + PAGE_SIZE)}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
          >
            Carregar mais {Math.min(PAGE_SIZE, filtered.length - visible)} itens
          </button>
>>>>>>> theirs
          <button
            type="button"
            onClick={() => setFeaturedOnly((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              featuredOnly
                ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                : "border-white/10 bg-black/20 text-white/70"
            }`}
          >
            <Star className="h-4 w-4" />
            So destaques
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros estaveis para mobile e desktop
          </div>
        </div>
      </div>

      <CatalogGrid products={filteredProducts} />
    </div>
  );
}
