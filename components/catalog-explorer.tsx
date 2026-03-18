'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, collections, getProductUrl, type Product } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';
import { ProductImageGallery } from '@/components/product-image-gallery';

const PAGE_SIZE = 25;

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [collection, setCollection] = useState('Todas');
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('Mais Recentes');
  const [priceRange, setPriceRange] = useState([20, 500]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = products.filter((item) => {
      const matchQuery = !q
        ? true
        : [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
            .join(' ')
            .toLowerCase()
            .includes(q);
      const matchCategory = category === 'Todas' ? true : item.category === category;
      const matchCollection = collection === 'Todas' ? true : item.collection === collection;
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];
      return matchQuery && matchCategory && matchCollection && matchPrice;
    });
    if (order === 'Preço') {
      items = items.sort((a, b) => a.pricePix - b.pricePix);
    } else if (order === 'Nome') {
      items = items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (order === 'Mais Recentes') {
      items = items.sort((a, b) => b.id.localeCompare(a.id));
    }
    return items;
  }, [products, query, category, collection, order, priceRange]);

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
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} resultados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Catálogo comercial com mídia local</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>
      <div className="catalog-grid">
        {visibleItems.map((product) => (
          <article key={product.id} className="product-card group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30" aria-label={product.name}>
            <ProductImageGallery product={product} compact />
            {/* Badges */}
            <div className="flex gap-2 mt-2">
              {product.featured && <span className="card-badge">Mais Vendido</span>}
              {product.status === 'Pronta entrega' && <span className="card-available">Pronta Entrega</span>}
              {product.collection === 'Novidade' && (
                <span className="card-badge bg-purple-400/14 border-purple-400/30 text-purple-100">Novidade</span>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white line-clamp-2">{product.name}</h3>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{product.productionWindow}</span>
            </div>
            <div className="mt-4 tag-row">
              {product.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
              <span className="tag">{product.material}</span>
              <span className="tag">{product.finish}</span>
              <span className="tag">{product.readyToShip ? 'Pronta entrega' : 'Sob encomenda'}</span>
            </div>
            <div className="mt-5 price-box">
              <div>
                <p className="text-xs text-white/45">Preço Pix</p>
                <p className="price-main">{formatCurrency(product.pricePix)}</p>
                <p className="price-sub">12x de {formatCurrency(product.priceCard / 12)} no cartão</p>
              </div>
              <Link href={getProductUrl(product)} className="button-secondary">Ver produto</Link>
            </div>
          </article>
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="pagination">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="button-ghost" disabled={currentPage === 1} aria-label="Página anterior">
            Anterior
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`button-ghost ${currentPage === idx + 1 ? 'active' : ''}`}
              aria-label={`Página ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="button-ghost" disabled={currentPage === totalPages} aria-label="Próxima página">
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
