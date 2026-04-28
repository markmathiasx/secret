import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { QuickAddToCart } from "@/components/quick-add-to-cart";
import { buildProductImageAlt } from "@/lib/catalog-media";
import { bestsellerStorefrontProducts, highlightStorefrontProducts } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

function ProductShelfCard({
  title,
  eyebrow,
  description,
  href,
  image,
  pricePix,
  productId,
  priceCard,
}: {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  image: string;
  pricePix: number;
  productId: string;
  priceCard: number;
}) {
  return (
    <article className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(2,8,23,0.28))] p-4 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_24px_60px_rgba(2,8,23,0.32)]">
      <Link href={href} className="block">
        <div className="relative h-56 overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
          <Image
            src={image}
            alt={buildProductImageAlt(title)}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            unoptimized
          />
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/72">{eyebrow}</p>
          <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/64">{description}</p>
        </div>
      </Link>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">A partir de</p>
          <p className="mt-1 text-2xl font-black text-emerald-100">{formatCurrency(pricePix)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuickAddToCart
            productId={productId}
            productName={title}
            pricePix={pricePix}
            priceCard={priceCard}
            image={image}
          />
          <Link href={href} className="btn-primary px-4 py-2 text-sm">
            Ver item
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StorefrontSalesShelves() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Mais vendidos</p>
            <h2 className="section-title">Itens de decisão rápida para vender hoje.</h2>
            <p className="section-copy mt-4 max-w-3xl">
              Produtos com preço claro, uso óbvio, ticket acessível e boa conversão para compra direta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
              Produção local
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72">
              Carrinho global
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72">
              Pix e cartão
            </span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bestsellerStorefrontProducts.map((product) => (
            <ProductShelfCard
              key={product.id}
              title={product.name}
              eyebrow={product.category}
              description={product.shortDescription}
              href={product.href}
              image={product.images[0]}
              pricePix={product.pricePix}
              priceCard={product.priceCard}
              productId={product.id}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="glass-panel overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Destaques</p>
              <h2 className="section-title">Presentes, decoração e personalização com cara de fechamento.</h2>
            </div>
            <Link href="/catalogo" className="btn-secondary">
              Ver catálogo inteiro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {highlightStorefrontProducts.map((product) => (
              <article key={product.id} className="rounded-[26px] border border-white/10 bg-black/20 p-4">
                <Link href={product.href} className="block">
                  <div className="relative h-52 overflow-hidden rounded-[22px] border border-white/10 bg-black/25">
                    <Image
                      src={product.images[0]}
                      alt={buildProductImageAlt(product.name)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                      unoptimized
                    />
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                        {product.category}
                      </span>
                      {product.acceptsPersonalizationText ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
                          Personalizável
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{product.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/64">{product.shortDescription}</p>
                  </div>
                </Link>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-emerald-100">{formatCurrency(product.pricePix)}</p>
                    <p className="text-xs text-white/45">{product.productionWindow}</p>
                  </div>
                  <QuickAddToCart
                    productId={product.id}
                    productName={product.name}
                    pricePix={product.pricePix}
                    priceCard={product.priceCard}
                    image={product.images[0]}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Preço visível",
                body: "Nada de página vazia. Toda vitrine relevante tem valor inicial, CTA e prova.",
              },
              {
                icon: Sparkles,
                title: "Conteúdo reaproveitável",
                body: "Produtos com apelo visual forte também abastecem Reels, Stories, blog e FAQ.",
              },
              {
                icon: ArrowRight,
                title: "Fluxo comercial curto",
                body: "Cliente entra pelo produto, cai no carrinho, vai ao checkout e fecha no site ou WhatsApp.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-white/58">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
