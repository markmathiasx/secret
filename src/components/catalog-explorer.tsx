'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, collections, getProductUrl, type Product } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';
import { ProductImageGallery } from '@/components/product-image-gallery';

const PAGE_SIZE = 24;

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [collection, setCollection] = useState('Todas');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchQuery = !q
        ? true
        : [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
            .join(' ')
            .toLowerCase()
            .includes(q);
      const matchCategory = category === 'Todas' ? true : item.category === category;
      const matchCollection = collection === 'Todas' ? true : item.collection === collection;
      return matchQuery && matchCategory && matchCollection;
    });
  }, [products, query, category, collection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
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
          <span>Catálogo comercial com mídia local</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>

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
              {[product.material, product.finish, product.readyToShip ? 'Pronta entrega' : 'Sob encomenda'].map((tag) => (
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
              <Link href={getProductUrl(product)} className="btn-ghost-sm">
                Ver produto
              </Link>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="btn-ghost-sm" disabled={currentPage === 1}>
            Anterior
          </button>
          <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="btn-ghost-sm" disabled={currentPage === totalPages}>
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
