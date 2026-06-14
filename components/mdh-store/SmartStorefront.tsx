"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Filter, MessageCircleMore, Search, ShoppingBag, Trash2 } from "lucide-react";
import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import { buildProductPagePath, buildWhatsappUrl } from "@/lib/mdh-store/links";
import { trackSmartStoreEvent } from "@/lib/mdh-store/analytics";
import { useSmartCart } from "@/components/mdh-store/smart-cart";
import { formatCurrency } from "@/lib/utils";

function productSearchText(product: SmartStoreProduct) {
  return [product.name, product.category, product.sku, product.description, product.tags.join(" ")].join(" ").toLowerCase();
}

function ProductImage({ product }: { product: SmartStoreProduct }) {
  const src = product.image || "/catalog-assets/product-placeholder.webp";
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

function SmartProductCard({
  product,
  whatsappNumber,
  siteUrl,
  onAdd,
}: {
  product: SmartStoreProduct;
  whatsappNumber: string;
  siteUrl: string;
  onAdd: (product: SmartStoreProduct) => void;
}) {
  const productPath = buildProductPagePath(product);
  const whatsappUrl = buildWhatsappUrl(product, { pageUrl: `${siteUrl}${productPath}`, whatsappNumber });
  const hasCheckout = Boolean(product.nuvemshopUrl);

  return (
    <article data-smart-product-card={product.slug} className="flex h-full flex-col rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <Link href={productPath} className="block">
        <ProductImage product={product} />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100/62">{product.category}</p>
            <h3 className="mt-1 text-lg font-black leading-snug text-white">
              <Link href={productPath}>{product.name}</Link>
            </h3>
          </div>
          {product.stock > 0 ? (
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">
              Estoque {product.stock}
            </span>
          ) : (
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">
              Sob consulta
            </span>
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/62">{product.description}</p>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/44">Pix</p>
          <div className="flex items-end gap-2">
            <strong className="text-2xl font-black text-white">{formatCurrency(product.pixPrice)}</strong>
            {product.cardPrice ? <span className="pb-1 text-sm text-white/52">Cartão {formatCurrency(product.cardPrice)}</span> : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {hasCheckout ? (
            <a
              href={product.nuvemshopUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSmartStoreEvent("click_buy_nuvemshop", { item_id: product.sku, item_name: product.name })}
              className="btn-primary min-h-11 flex-1 justify-center gap-2 px-4 text-sm"
            >
              Comprar com Pix ou Cartão <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSmartStoreEvent("click_whatsapp_budget", { item_id: product.sku, item_name: product.name })}
              className="btn-whatsapp min-h-11 flex-1 justify-center gap-2 px-4 text-sm"
            >
              Pedir orçamento no WhatsApp <MessageCircleMore className="h-4 w-4" />
            </a>
          )}
          <button type="button" onClick={() => onAdd(product)} className="btn-secondary min-h-11 justify-center gap-2 px-4 text-sm">
            <ShoppingBag className="h-4 w-4" /> Carrinho
          </button>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSmartStoreEvent("click_whatsapp_budget", { item_id: product.sku, item_name: product.name, secondary: true })}
          className="mt-2 text-sm font-bold text-emerald-100/82 underline-offset-4 hover:text-emerald-50 hover:underline"
        >
          Tirar dúvida pelo WhatsApp
        </a>
      </div>
    </article>
  );
}

function SmartCartPanel({ whatsappNumber, cart }: { whatsappNumber: string; cart: ReturnType<typeof useSmartCart> }) {
  return (
    <aside className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/46">Carrinho local</p>
          <h2 className="text-xl font-black text-white">{cart.count} item(ns)</h2>
        </div>
        {cart.items.length ? (
          <button type="button" onClick={cart.clear} className="rounded-[8px] border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10">
            Limpar
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-3">
        {cart.items.length ? (
          cart.items.map((item) => (
            <div key={item.slug} className="rounded-[8px] border border-white/10 bg-black/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-xs text-white/50">{item.sku}</p>
                </div>
                <button type="button" onClick={() => cart.remove(item.slug)} className="text-white/50 hover:text-rose-100" aria-label={`Remover ${item.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-white/44">
                  Qtd.
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(event) => cart.update(item.slug, Number(event.target.value))}
                    className="ml-2 w-16 rounded-[8px] border border-white/10 bg-black/30 px-2 py-1 text-white"
                  />
                </label>
                <span className="font-black text-white">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-[8px] border border-dashed border-white/12 p-4 text-sm leading-6 text-white/56">
            Adicione produtos para montar um pedido e finalizar pelo WhatsApp com a lista pronta.
          </p>
        )}
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/60">Subtotal estimado</span>
          <strong className="text-2xl font-black text-white">{formatCurrency(cart.subtotal)}</strong>
        </div>
        <a
          href={cart.items.length ? cart.checkoutUrl(whatsappNumber) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!cart.items.length}
          onClick={(event) => {
            if (!cart.items.length) {
              event.preventDefault();
              return;
            }
            cart.trackCheckout();
          }}
          className={`mt-4 flex min-h-12 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-black ${
            cart.items.length ? "btn-whatsapp" : "cursor-not-allowed border border-white/10 bg-white/5 text-white/35"
          }`}
        >
          Finalizar pelo WhatsApp <MessageCircleMore className="h-4 w-4" />
        </a>
      </div>
    </aside>
  );
}

export function SmartStorefront({
  products,
  categories,
  whatsappNumber,
  siteUrl,
}: {
  products: SmartStoreProduct[];
  categories: string[];
  whatsappNumber: string;
  siteUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const prices = products.map((product) => product.pixPrice).filter(Number.isFinite);
  const priceMin = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices)) : 100;
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const normalizedQuery = query.trim().toLowerCase();
  const cart = useSmartCart();

  useEffect(() => {
    if (!normalizedQuery) return;
    const timer = window.setTimeout(() => {
      trackSmartStoreEvent("search_product", { search_term: normalizedQuery });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [normalizedQuery]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || productSearchText(product).includes(normalizedQuery);
      const matchesCategory = category === "Todas" || product.category === category;
      const matchesPrice = product.pixPrice <= maxPrice;
      return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [category, normalizedQuery, maxPrice, products]);

  const featured = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);
  const related = useMemo(() => {
    const reference = filtered[0] || featured[0] || products[0];
    if (!reference) return [];
    return products.filter((product) => product.slug !== reference.slug && product.category === reference.category).slice(0, 4);
  }, [featured, filtered, products]);

  function addToCart(product: SmartStoreProduct) {
    cart.add({ slug: product.slug, name: product.name, sku: product.sku, price: product.pixPrice, image: product.image });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <section className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">
                <Search className="h-4 w-4" /> Busca
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onInput={(event) => setQuery(event.currentTarget.value)}
                placeholder="Buscar por chaveiro, setup, presente..."
                className="industrial-input"
                data-smart-search
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">
                <Filter className="h-4 w-4" /> Categoria
              </span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="industrial-input" data-smart-category>
                <option>Todas</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">Preço até {formatCurrency(maxPrice)}</span>
              <input
                type="range"
                min={priceMin}
                max={priceMax}
                step={1}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="mt-3 w-full accent-cyan-300"
                data-smart-price
              />
            </label>
          </div>
        </section>

        {featured.length ? (
          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker">Destaques</p>
                <h2 className="text-2xl font-black text-white">Produtos em destaque</h2>
              </div>
              <span className="text-sm text-white/50">{featured.length} selecionados</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featured.map((product) => (
                <SmartProductCard key={product.slug} product={product} whatsappNumber={whatsappNumber} siteUrl={siteUrl} onAdd={addToCart} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="section-kicker">Vitrine CSV</p>
              <h2 className="text-2xl font-black text-white">Produtos encontrados</h2>
            </div>
            <span className="text-sm text-white/50" data-smart-result-count>{filtered.length} produto(s)</span>
          </div>
          {filtered.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <SmartProductCard key={product.slug} product={product} whatsappNumber={whatsappNumber} siteUrl={siteUrl} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="industrial-empty">
              <h3 className="font-black text-white">Nenhum produto nessa combinação.</h3>
              <p className="mt-2 text-sm text-white/58">Ajuste busca, categoria ou faixa de preço.</p>
            </div>
          )}
        </section>

        {related.length ? (
          <section className="mt-8 rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
            <p className="section-kicker">Relacionados</p>
            <h2 className="mt-1 text-2xl font-black text-white">Produtos relacionados</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((product) => (
                <Link key={product.slug} href={buildProductPagePath(product)} className="rounded-[8px] border border-white/10 bg-black/20 p-3 transition hover:border-cyan-200/30">
                  <p className="text-sm font-black text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-white/50">{product.category}</p>
                  <p className="mt-2 text-sm font-black text-emerald-100">{formatCurrency(product.pixPrice)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <SmartCartPanel whatsappNumber={whatsappNumber} cart={cart} />
      </div>
    </div>
  );
}
