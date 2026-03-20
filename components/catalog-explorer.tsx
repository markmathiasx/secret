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

type CatalogAvailability = 'Todos' | Product['status'];

function sanitizeOption(value: string | undefined, options: string[]) {
  return value && options.includes(value) ? value : 'Todas';
}

function sanitizeAvailability(value: CatalogAvailability | undefined): CatalogAvailability {
  return value === 'Pronta entrega' || value === 'Sob encomenda' ? value : 'Todos';
}

export function CatalogExplorer({
  products,
  initialQuery = '',
  initialCategory = 'Todas',
  initialCollection = 'Todas',
  initialVerifiedOnly = true,
  initialAvailability = 'Todos',
}: {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
  initialCollection?: string;
  initialVerifiedOnly?: boolean;
  initialAvailability?: CatalogAvailability;
}) {
  const priceLimits = useMemo(() => {
    const values = products.map((item) => item.pricePix);
    const min = Math.max(10, Math.floor(Math.min(...values) / 10) * 10);
    const max = Math.max(120, Math.ceil(Math.max(...values) / 10) * 10);
    return { min, max };
  }, [products]);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(sanitizeOption(initialCategory, categories));
  const [collection, setCollection] = useState(sanitizeOption(initialCollection, collections));
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('Mais Recentes');
  const [priceRange, setPriceRange] = useState<[number, number]>([priceLimits.min, priceLimits.max]);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [availability, setAvailability] = useState<CatalogAvailability>(sanitizeAvailability(initialAvailability));

  useEffect(() => {
    setQuery(initialQuery);
    setCategory(sanitizeOption(initialCategory, categories));
    setCollection(sanitizeOption(initialCollection, collections));
    setVerifiedOnly(initialVerifiedOnly);
    setAvailability(sanitizeAvailability(initialAvailability));
    setPriceRange([priceLimits.min, priceLimits.max]);
    setPage(1);
  }, [initialAvailability, initialCategory, initialCollection, initialQuery, initialVerifiedOnly, priceLimits.max, priceLimits.min]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = products.filter((item) => {
      const matchQuery = !q
        ? true
        : buildProductSearchText(item).includes(q);
      const matchCategory = category === 'Todas' ? true : item.category === category;
      const matchCollection = collection === 'Todas' ? true : item.collection === collection;
      const matchAvailability = availability === 'Todos' ? true : item.status === availability;
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];
      const matchVerified = verifiedOnly ? isProductVisualVerified(item) : true;
      return matchQuery && matchCategory && matchCollection && matchAvailability && matchPrice && matchVerified;
    });
    if (order === 'Preço') {
      items = items.sort((a, b) => a.pricePix - b.pricePix);
    } else if (order === 'Nome') {
      items = items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (order === 'Mais Recentes') {
      items = items.sort((a, b) => b.id.localeCompare(a.id));
    }
    return items;
  }, [products, query, category, collection, availability, order, priceRange, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const readyCount = filtered.filter((item) => item.status === 'Pronta entrega').length;

  function resetFilters() {
    setQuery(initialQuery);
    setCategory(sanitizeOption(initialCategory, categories));
    setCollection(sanitizeOption(initialCollection, collections));
    setOrder('Mais Recentes');
    setPriceRange([priceLimits.min, priceLimits.max]);
    setVerifiedOnly(initialVerifiedOnly);
    setAvailability(sanitizeAvailability(initialAvailability));
    setPage(1);
  }

  function applyPreset(preset: 'verified' | 'utilidades' | 'setup' | 'presentes' | 'premium') {
    setQuery('');
    setCollection('Todas');
    setAvailability('Todos');
    setOrder('Mais Recentes');
    setPriceRange([priceLimits.min, priceLimits.max]);

    if (preset === 'verified') {
      setCategory('Todas');
      setVerifiedOnly(true);
    }

    if (preset === 'utilidades') {
      setCategory('Utilidades Reais');
      setVerifiedOnly(false);
    }

    if (preset === 'setup') {
      setCategory('Setup & Organização');
      setVerifiedOnly(false);
    }

    if (preset === 'presentes') {
      setCategory('Presentes Criativos');
      setVerifiedOnly(false);
    }

    if (preset === 'premium') {
      setCategory('Presentes Criativos');
      setQuery('personalizado');
      setVerifiedOnly(false);
    }

    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.42fr_0.42fr_0.42fr_0.42fr_0.42fr]">
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
            <span className="mb-2 block">Disponibilidade</span>
            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value as CatalogAvailability);
                setPage(1);
              }}
              className="field-base"
              aria-label="Filtrar por disponibilidade"
            >
              <option>Todos</option>
              <option>Pronta entrega</option>
              <option>Sob encomenda</option>
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
              min={priceLimits.min}
              max={priceLimits.max}
              step={5}
              value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full accent-cyan-400"
              aria-label="Preço mínimo"
            />
            <input
              type="range"
              min={priceLimits.min}
              max={priceLimits.max}
              step={5}
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
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-white/45">Atalhos</span>
          <button
            type="button"
            onClick={() => applyPreset('verified')}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Só com visual validado
          </button>
          <button
            type="button"
            onClick={() => applyPreset('utilidades')}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Utilidades reais
          </button>
          <button
            type="button"
            onClick={() => applyPreset('setup')}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Setup e organização
          </button>
          <button
            type="button"
            onClick={() => applyPreset('presentes')}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Presentes criativos
          </button>
          <button
            type="button"
            onClick={() => applyPreset('premium')}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Personalizados premium
          </button>
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
            Peças com foto real
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
            Todo o catálogo
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Limpar filtros
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} produtos encontrados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{verifiedOnly ? 'Exibindo primeiro peças com foto real ou render do produto' : 'Exibindo também projetos sob medida com prévia visual e estimativa inicial'}</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{readyCount} com pronta entrega</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((product) => (
          <article
            key={product.id}
            className={`group rounded-[28px] border p-5 transition hover:-translate-y-1 ${
              isProductVisualVerified(product)
                ? 'border-white/10 bg-card hover:border-cyan-300/30'
                : 'border-amber-300/15 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(255,255,255,0.02))] hover:border-amber-300/30'
            }`}
            aria-label={product.name}
          >
            <ProductImageGallery product={product} compact />
            <div className="mt-2 flex flex-wrap gap-2">
              {product.featured && <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-100">Mais Vendido</span>}
              {product.status === 'Pronta entrega' && <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">Pronta Entrega</span>}
              {product.collection === 'Novidade' && (
                <span className="rounded-full border border-purple-400/30 bg-purple-400/14 px-3 py-1 text-[11px] font-semibold text-purple-100">Novidade</span>
              )}
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  product.pricingMode === 'faixa-auditada'
                    ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
                    : 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                }`}
              >
                {product.pricingMode === 'faixa-auditada' ? 'Preço confirmado' : 'Estimativa inicial'}
              </span>
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
            <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-3 text-xs leading-6 text-white/62">
              <p className="font-semibold text-white/82">{product.pricingMode === 'faixa-auditada' ? 'Compra direta' : 'Projeto sob medida'}</p>
              <p className="mt-1">{product.pricingNarrative}</p>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-white/45">{product.pricingMode === 'faixa-auditada' ? 'Preço no Pix' : 'Base inicial no Pix'}</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
                <p className="text-xs text-white/55">12x de {formatCurrency(product.priceCard / 12)} no cartão</p>
              </div>
              <Link href={getProductUrl(product)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15">
                {product.pricingMode === 'faixa-auditada' ? 'Comprar agora' : 'Pedir orçamento'}
              </Link>
            </div>
          </article>
        ))}
      </div>
      {visibleItems.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/80">Sem resultado</p>
          <h3 className="mt-3 text-2xl font-bold text-white">Nenhum item bateu com esse filtro.</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">
            Tente buscar por material, tema, coleção, personagem ou tipo de uso. A busca considera descrição, acabamento, categoria e contexto de uso.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={resetFilters} className="btn-secondary">
              Limpar filtros
            </button>
            <Link href="/imagem-para-impressao-3d" className="btn-primary">
              Pedir algo sob medida
            </Link>
          </div>
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
