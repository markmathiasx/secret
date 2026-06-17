"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, Calculator, Filter, MessageCircleMore, Search, ShoppingBag, TicketPercent, Trash2, X } from "lucide-react";
import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import { buildProductPagePath, buildWhatsappUrl } from "@/lib/mdh-store/links";
import { trackSmartStoreEvent } from "@/lib/mdh-store/analytics";
import { useSmartCart } from "@/components/mdh-store/smart-cart";
import { FREE_SHIPPING_THRESHOLD, estimateCouponDiscount, smartStoreCoupons } from "@/lib/mdh-store/promotions";
import { formatCurrency } from "@/lib/utils";

const synonymMap: Record<string, string[]> = {
  "porta cafe": ["café", "capsula", "organizador", "cozinha", "mesa"],
  "porta café": ["café", "capsula", "organizador", "cozinha", "mesa"],
  namorado: ["presente", "personalizado", "geek"],
  namorada: ["presente", "personalizado", "decoracao"],
  gamer: ["setup", "controle", "geek"],
  pet: ["personalizado", "presente"],
  barato: ["chaveiro", "presente", "até 50"],
};

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function expandQuery(value: string) {
  const normalized = normalizeText(value.trim());
  const extra = Object.entries(synonymMap)
    .filter(([term]) => normalized.includes(normalizeText(term)))
    .flatMap(([, synonyms]) => synonyms);
  const typoFix = normalized.replace(/\bchavero\b/g, "chaveiro").replace(/\bsuport\b/g, "suporte");
  return Array.from(new Set([normalized, typoFix, ...extra.map(normalizeText)].filter(Boolean)));
}

function productSearchText(product: SmartStoreProduct) {
  return normalizeText(
    [
      product.name,
      product.category,
      product.sku,
      product.description,
      product.tags.join(" "),
      product.material,
      product.colors.join(" "),
      product.personalizable ? "personalizavel personalizado sob medida" : "",
    ].join(" ")
  );
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
        {product.productionCost ? (
          <div className="mt-3 rounded-[8px] border border-emerald-300/[0.14] bg-emerald-300/[0.08] px-3 py-2 text-xs leading-5 text-emerald-50/74">
            <span className="inline-flex items-center gap-1 font-black text-emerald-100">
              <Calculator className="h-3.5 w-3.5" /> Custo {formatCurrency(product.productionCost)}
            </span>{" "}
            + {product.profitPercent}% lucro
          </div>
        ) : null}
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
  const [couponCode, setCouponCode] = useState("");
  const couponInputId = useId();
  const coupon = smartStoreCoupons.find((item) => item.code === couponCode.trim().toUpperCase());
  const discount = coupon ? estimateCouponDiscount(coupon, cart.subtotal) : 0;
  const total = Math.max(0, cart.subtotal - discount);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);

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
              {item.checkoutUrl ? (
                <a href={item.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-black text-cyan-100 underline-offset-4 hover:underline">
                  Comprar este item na Nuvemshop
                </a>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-[8px] border border-dashed border-white/12 p-4 text-sm leading-6 text-white/56">
            Adicione produtos para montar um pedido e finalizar pelo WhatsApp com a lista pronta.
          </p>
        )}
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-4 rounded-[8px] border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/46">Frete grátis local</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full bg-emerald-300" style={{ width: `${Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/58">
            {remaining > 0 ? `Faltam ${formatCurrency(remaining)} para negociar frete/retirada local.` : "Condição de frete/retirada local atingida."}
          </p>
        </div>
        <form
          className="mb-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (coupon) trackSmartStoreEvent("coupon_apply", { coupon: coupon.code, value: discount });
          }}
        >
          <label className="sr-only" htmlFor={couponInputId}>Cupom</label>
          <input id={couponInputId} value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Cupom" className="industrial-input min-h-11" />
          <button type="submit" className="btn-secondary min-h-11 px-3" aria-label="Aplicar cupom">
            <TicketPercent className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/60">Subtotal estimado</span>
          <strong className="text-2xl font-black text-white">{formatCurrency(cart.subtotal)}</strong>
        </div>
        {discount > 0 ? (
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-bold text-emerald-100">Desconto {coupon?.code}</span>
            <strong className="text-emerald-100">-{formatCurrency(discount)}</strong>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-white/60">Total estimado</span>
          <strong className="text-2xl font-black text-white">{formatCurrency(total)}</strong>
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
  const [material, setMaterial] = useState("Todos");
  const [useCase, setUseCase] = useState("Todos");
  const [color, setColor] = useState("Todas");
  const [personalizableOnly, setPersonalizableOnly] = useState(false);
  const [sort, setSort] = useState("relevancia");
  const [cartOpen, setCartOpen] = useState(false);
  const prices = products.map((product) => product.pixPrice).filter(Number.isFinite);
  const priceMin = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices)) : 100;
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const normalizedQuery = query.trim();
  const queryTerms = useMemo(() => expandQuery(normalizedQuery), [normalizedQuery]);
  const cart = useSmartCart();
  const materials = useMemo(() => Array.from(new Set(products.map((product) => product.material))).sort(), [products]);
  const colors = useMemo(() => Array.from(new Set(products.flatMap((product) => product.colors))).sort(), [products]);
  const useCases = ["Todos", "presente", "setup", "casa", "pet", "geek", "brindes", "sob encomenda"];
  const popularProducts = useMemo(() => [...products].sort((a, b) => b.marketplaceScore - a.marketplaceScore).slice(0, 5), [products]);

  useEffect(() => {
    trackSmartStoreEvent("view_category", { category: "loja", item_count: products.length });
  }, [products.length]);

  useEffect(() => {
    if (!normalizedQuery) return;
    const timer = window.setTimeout(() => {
      trackSmartStoreEvent("search_product", { search_term: normalizedQuery });
      const history = JSON.parse(window.localStorage.getItem("mdh3d_search_history") || "[]");
      const next = Array.from(new Set([normalizedQuery, ...(Array.isArray(history) ? history : [])])).slice(0, 6);
      window.localStorage.setItem("mdh3d_search_history", JSON.stringify(next));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [normalizedQuery]);

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const searchText = productSearchText(product);
      const matchesQuery = !queryTerms.length || queryTerms.some((term) => searchText.includes(term));
      const matchesCategory = category === "Todas" || product.category === category;
      const matchesMaterial = material === "Todos" || product.material === material;
      const matchesUseCase = useCase === "Todos" || searchText.includes(normalizeText(useCase));
      const matchesColor = color === "Todas" || product.colors.includes(color);
      const matchesPrice = product.pixPrice <= maxPrice;
      const matchesPersonalization = !personalizableOnly || product.personalizable;
      return matchesQuery && matchesCategory && matchesMaterial && matchesUseCase && matchesColor && matchesPrice && matchesPersonalization;
    });
    return result.sort((a, b) => {
      if (sort === "menor-preco") return a.pixPrice - b.pixPrice;
      if (sort === "maior-preco") return b.pixPrice - a.pixPrice;
      if (sort === "novidades") return b.marketplaceScore - a.marketplaceScore;
      if (sort === "personalizados") return Number(b.personalizable) - Number(a.personalizable) || b.marketplaceScore - a.marketplaceScore;
      if (sort === "prazo") return a.productionWindow.localeCompare(b.productionWindow);
      return b.marketplaceScore - a.marketplaceScore;
    });
  }, [category, color, material, maxPrice, personalizableOnly, products, queryTerms, sort, useCase]);

  useEffect(() => {
    trackSmartStoreEvent("filter_product", {
      category,
      material,
      use_case: useCase,
      color,
      max_price: maxPrice,
      personalizable: personalizableOnly,
      sort,
      result_count: filtered.length,
    });
  }, [category, color, filtered.length, material, maxPrice, personalizableOnly, sort, useCase]);

  const featured = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);
  const related = useMemo(() => {
    const reference = filtered[0] || featured[0] || products[0];
    if (!reference) return [];
    return products.filter((product) => product.slug !== reference.slug && product.category === reference.category).slice(0, 4);
  }, [featured, filtered, products]);

  function addToCart(product: SmartStoreProduct) {
    cart.add({ slug: product.slug, name: product.name, sku: product.sku, price: product.pixPrice, image: product.image, checkoutUrl: product.nuvemshopUrl });
    setCartOpen(true);
  }

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return popularProducts;
    return products.filter((product) => queryTerms.some((term) => productSearchText(product).includes(term))).slice(0, 5);
  }, [normalizedQuery, popularProducts, products, queryTerms]);

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
              {suggestions.length ? (
                <div className="mt-2 flex flex-wrap gap-2" aria-label="Sugestões de busca">
                  {suggestions.map((item) => (
                    <button key={item.slug} type="button" onClick={() => setQuery(item.name)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/68 hover:text-white">
                      {item.name}
                    </button>
                  ))}
                </div>
              ) : null}
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
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="block">
              <span className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">Uso</span>
              <select value={useCase} onChange={(event) => setUseCase(event.target.value)} className="industrial-input" data-smart-use>
                {useCases.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">Material</span>
              <select value={material} onChange={(event) => setMaterial(event.target.value)} className="industrial-input" data-smart-material>
                <option>Todos</option>
                {materials.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">Cor</span>
              <select value={color} onChange={(event) => setColor(event.target.value)} className="industrial-input" data-smart-color>
                <option>Todas</option>
                {colors.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-white/48">Ordenar</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="industrial-input" data-smart-sort>
                <option value="relevancia">Melhor custo-benefício</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="novidades">Novidades</option>
                <option value="personalizados">Mais personalizados</option>
                <option value="prazo">Entrega mais rápida</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Até R$ 20", action: () => setMaxPrice(Math.min(20, priceMax)) },
              { label: "Até R$ 50", action: () => setMaxPrice(Math.min(50, priceMax)) },
              { label: "Presente rápido", action: () => setUseCase("presente") },
              { label: "Setup gamer", action: () => setUseCase("setup") },
              { label: "Casa e organização", action: () => setUseCase("casa") },
              { label: "Geek e colecionáveis", action: () => setUseCase("geek") },
              { label: "Brindes em lote", action: () => setUseCase("brindes") },
              { label: "Sob encomenda", action: () => setPersonalizableOnly(true) },
            ].map((chip) => (
              <button key={chip.label} type="button" onClick={chip.action} className="chip-nav">
                {chip.label}
              </button>
            ))}
            <label className="chip-nav cursor-pointer gap-2">
              <input type="checkbox" checked={personalizableOnly} onChange={(event) => setPersonalizableOnly(event.target.checked)} className="accent-cyan-300" />
              Personalizável
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
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {popularProducts.map((product) => (
                  <button key={product.slug} type="button" onClick={() => setQuery(product.name)} className="chip-nav">
                    {product.name}
                  </button>
                ))}
              </div>
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

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-400 px-5 text-sm font-black text-emerald-950 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
      >
        <ShoppingBag className="h-4 w-4" /> Carrinho ({cart.count})
      </button>

      {cartOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Carrinho local">
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#071016] p-4 shadow-2xl">
            <button type="button" onClick={() => setCartOpen(false)} className="mb-3 ml-auto flex rounded-full border border-white/10 p-3 text-white/72 hover:text-white" aria-label="Fechar carrinho">
              <X className="h-5 w-5" />
            </button>
            <SmartCartPanel whatsappNumber={whatsappNumber} cart={cart} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
