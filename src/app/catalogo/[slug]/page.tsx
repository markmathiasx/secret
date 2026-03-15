import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogGrid } from "@/components/catalog-grid";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { FavoriteButton } from "@/components/favorite-button";
import { PixPaymentCard } from "@/components/pix-payment-card";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuoteForm } from "@/components/quote-form";
import { catalog, findProductBySlug, getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export function generateStaticParams() {
  return catalog.slice(0, 120).map((product) => ({
    slug: getProductUrl(product).split("/").pop()!
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    return { title: "Produto nao encontrado" };
  }

  return {
    title: product.name,
    description: `${product.name} em ${product.category}, com preco inicial de ${formatCurrency(product.pricePix)} e prazo de ${product.productionWindow}.`
  };
}

const commercialBadges = ["Mais vendido", "Personalizavel", "Sob encomenda", "PLA premium"] as const;

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) notFound();

  const related = catalog.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 flex flex-wrap gap-2 text-xs text-white/60">
            <Link href="/catalogo" className="rounded-full border border-white/10 px-3 py-1">
              Catalogo
            </Link>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
              {product.collection}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">{product.category}</span>
          </div>

          <div className="relative">
            <ProductImageGallery product={product} />
            <div className="absolute right-3 top-3">
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h1 className="text-4xl font-black text-white">{product.name}</h1>
            <p className="mt-4 text-base leading-8 text-white/68">{product.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {commercialBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/75">
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Preco inicial no Pix</p>
                <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Preco no cartao</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Prazo estimado</p>
                <p className="mt-2 text-2xl font-black text-white">{product.productionWindow}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">{product.grams} g</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">{product.hours} h</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">PLA</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <QuoteForm initialProduct={product} />
          <DeliveryCalculator />
          <PixPaymentCard title={product.name} amount={product.pricePix} />
        </div>
      </div>

      {related.length ? (
        <div className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Relacionados</p>
              <h2 className="mt-2 text-3xl font-black text-white">Outras pecas da mesma linha</h2>
            </div>
            <Link
              href="/catalogo"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Voltar ao catalogo
            </Link>
          </div>

          <CatalogGrid products={related} />
        </div>
      ) : null}
    </section>
  );
}
