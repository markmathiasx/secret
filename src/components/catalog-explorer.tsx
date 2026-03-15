"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { categories, collections, getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { ProductImageGallery } from "@/components/product-image-gallery";

const PAGE_SIZE = 60;

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [collection, setCollection] = useState("Todas");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchQuery = !q
        ? true
        : [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(q);
      const matchCategory = category === "Todos" ? true : item.category === category;
      const matchCollection = collection === "Todas" ? true : item.collection === collection;
      return matchQuery && matchCategory && matchCollection;
    });
  }, [products, query, category, collection]);

  const visibleItems = filtered.slice(0, visible);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar projeto</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Buscar por tema, categoria, uso ou nome da peça"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Categoria</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Todos</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Coleção</span>
            <select
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Todas</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} resultados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Portfólio completo com mídia local e fallback premium</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Abra o produto para ver preço, prazo e frete</span>
        </div>
      </div>


      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 text-center">
          <p className="text-sm text-white/70">Nenhum item encontrado com os filtros atuais.</p>
          <p className="mt-2 text-xs text-white/50">Tente remover categoria/coleção ou use termos mais amplos.</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((product) => (
          <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
            <ProductImageGallery product={product} compact />

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{product.productionWindow}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-white/45">Preço base via Pix</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
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
          <button
            onClick={() => setVisible(filtered.length)}
            className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100"
          >
            Mostrar todos
          </button>
        </div>
      ) : null}
    </div>
  );
}
