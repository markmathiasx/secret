'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, collections, getProductUrl, type Product } from '@/lib/catalog';
import { buildProductSearchText } from '@/lib/catalog-content';
import { formatCurrency } from '@/lib/utils';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductVisualBadge } from '@/components/product-visual-authenticity';
import { isProductVisualVerified } from '@/lib/product-visuals';

const PAGE_SIZE = 25;

export function CatalogExplorer({ products, initialQuery = '' }: { products: Product[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('Todas');
  const [collection, setCollection] = useState('Todas');
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('Mais Recentes');
  const [priceRange, setPriceRange] = useState([20, 500]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => {
    setQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = products.filter((item) => {
      const matchQuery = !q
        ? true
        : buildProductSearchText(item).includes(q);
      const matchCategory = category === 'Todas' ? true : item.category === category;
      const matchCollection = collection === 'Todas' ? true : item.collection === collection;
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];
      const matchVerified = verifiedOnly ? isProductVisualVerified(item) : true;
      return matchQuery && matchCategory && matchCollection && matchPrice && matchVerified;
    });
    if (order === 'Preço') {
      items = items.sort((a, b) => a.pricePix - b.pricePix);
    } else if (order === 'Nome') {
      items = items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (order === 'Mais Recentes') {
      items = items.sort((a, b) => b.id.localeCompare(a.id));
    }
    return items;
  }, [products, query, category, collection, order, priceRange, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr_0.4fr_0.4fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar projeto</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Ex: vaso, suporte, anime, presente geek..."
              className="field-base"
              aria-label="Buscar projeto"
            />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Categoria</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="field-base"
              aria-label="Filtrar por categoria"
            >
              <option>Todas</option>
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
                setPage(1);
              }}
              className="field-base"
              aria-label="Filtrar por coleção"
            >
              <option>Todas</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Ordenar</span>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="field-base"
              aria-label="Ordenar catálogo"
            >
              <option>Mais Recentes</option>
              <option>Preço</option>
              <option>Nome</option>
            </select>
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Preço</span>
            <input
              type="range"
              min={20}
              max={500}
              value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full accent-cyan-400"
              aria-label="Preço mínimo"
            />
            <input
              type="range"
              min={20}
              max={500}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-cyan-400"
              aria-label="Preço máximo"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>R$ {priceRange[0]}</span>
              <span>R$ {priceRange[1]}</span>
            </div>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setVerifiedOnly(true);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              verifiedOnly
                ? 'border-emerald-300/35 bg-emerald-300/12 text-emerald-50'
                : 'border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:text-white'
            }`}
          >
            Somente imagens validadas
          </button>
          <button
            type="button"
            onClick={() => {
              setVerifiedOnly(false);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              !verifiedOnly
                ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50'
                : 'border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:text-white'
            }`}
          >
            Ver catálogo completo
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} resultados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{verifiedOnly ? 'Somente produtos com imagem validada' : 'Catálogo completo com curadoria visual'}</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((product) => (
          <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30" aria-label={product.name}>
            <ProductImageGallery product={product} compact />
            <div className="mt-2 flex flex-wrap gap-2">
              {product.featured && <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-100">Mais Vendido</span>}
              {product.status === 'Pronta entrega' && <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">Pronta Entrega</span>}
              {product.collection === 'Novidade' && (
                <span className="rounded-full border border-purple-400/30 bg-purple-400/14 px-3 py-1 text-[11px] font-semibold text-purple-100">Novidade</span>
              )}
              <ProductVisualBadge product={product} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white line-clamp-2">{product.name}</h3>
                <p className="mt-2 min-h-[72px] line-clamp-3 text-sm leading-6 text-white/62">{product.description}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{product.productionWindow}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <span key={i} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{tag}</span>
              ))}
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.material}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.finish}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.readyToShip ? 'Pronta entrega' : 'Sob encomenda'}</span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-white/45">Preço Pix</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
                <p className="text-xs text-white/55">12x de {formatCurrency(product.priceCard / 12)} no cartão</p>
              </div>
              <Link href={getProductUrl(product)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15">Ver produto</Link>
            </div>
          </article>
        ))}
      </div>
      {visibleItems.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/80">Sem resultado</p>
          <h3 className="mt-3 text-2xl font-bold text-white">Nenhum item bateu com esse filtro.</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">
            Tente buscar por material, tema, coleção, personagem ou tipo de uso. A busca agora considera também descrição curada, acabamento e material.
          </p>
        </div>
      ) : null}
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                currentPage === idx + 1
                  ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50'
                  : 'border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:text-white'
              }`}
              aria-label={`Página ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === totalPages}
            aria-label="Próxima página"
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
