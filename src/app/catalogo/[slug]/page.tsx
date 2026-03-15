import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { FavoriteButton } from "@/components/favorite-button";
import { PixPaymentCard } from "@/components/pix-payment-card";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuoteForm } from "@/components/quote-form";
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
import { catalog, findProductBySlug, getProductUrl } from "@/lib/catalog";
import { getCommercialCategory } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { FavoriteButton } from "@/components/favorite-button";

const highlightBadges = ["Foto real", "Sob encomenda", "Personalizável", "Pronta entrega"];
=======
import { ProductImage } from "@/components/product-image";
>>>>>>> theirs
=======
import { ProductImage } from "@/components/product-image";
>>>>>>> theirs
=======
import { FavoriteButton } from "@/components/favorite-button";

const highlightBadges = ["Foto real", "Sob encomenda", "Personalizável", "Pronta entrega"];
>>>>>>> theirs

export function generateStaticParams() {
  return catalog.slice(0, 240).map((product) => ({
    slug: getProductUrl(product).split("/").pop() || product.id
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) return {};

  const url = `${getSiteUrl()}${getProductUrl(product)}`;

  return {
    title: `${product.name} | ${getCommercialCategory(product.category)}`,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: product.description,
      url
    },
    twitter: {
      title: product.name,
      description: product.description
    }
  };
}

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
              {getCommercialCategory(product.category)}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">{product.collection}</span>
          </div>

          <div className="relative">
            <ProductImageGallery product={product} />
<<<<<<< ours
<<<<<<< ours
            <div className="absolute right-3 top-3">
              <FavoriteButton productId={product.id} />
            </div>
=======
            <div className="absolute right-3 top-3"><FavoriteButton productId={product.id} /></div>
>>>>>>> theirs
=======
            <div className="absolute right-3 top-3"><FavoriteButton productId={product.id} /></div>
>>>>>>> theirs
          </div>

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h1 className="text-4xl font-black text-white">{product.name}</h1>
            <p className="mt-4 text-base leading-8 text-white/68">{product.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
<<<<<<< ours
<<<<<<< ours
              {[
                product.featured ? "Mais vendido" : product.readyToShip ? "Pronta entrega" : "Sob encomenda",
                "Personalizavel",
                product.material,
                product.finish
              ].map((badge) => (
                <span key={badge} className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/75">
                  {badge}
                </span>
              ))}
=======
=======
>>>>>>> theirs
              {highlightBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/75">{badge}</span>
              ))}
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">Material PLA premium</span>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
<<<<<<< ours
<<<<<<< ours
                <p className="text-sm text-white/55">Preco base no Pix</p>
=======
                <p className="text-sm text-white/55">Preço inicial no Pix</p>
>>>>>>> theirs
=======
                <p className="text-sm text-white/55">Preço inicial no Pix</p>
>>>>>>> theirs
                <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Cartao</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Prazo estimado</p>
                <p className="mt-2 text-2xl font-black text-white">{product.productionWindow}</p>
<<<<<<< ours
<<<<<<< ours
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Material</p>
                <p className="mt-2 text-lg font-semibold text-white">{product.material}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Acabamento</p>
                <p className="mt-2 text-lg font-semibold text-white">{product.finish}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Peso medio</p>
                <p className="mt-2 text-lg font-semibold text-white">{product.grams} g</p>
=======
>>>>>>> theirs
=======
>>>>>>> theirs
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <span key={color} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {color}
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

      <div className="mt-12">
<<<<<<< ours
<<<<<<< ours
        <h2 className="text-2xl font-bold text-white">Voce tambem pode gostar</h2>
=======
        <h2 className="text-2xl font-bold text-white">Você também pode gostar</h2>
>>>>>>> theirs
=======
        <h2 className="text-2xl font-bold text-white">Você também pode gostar</h2>
>>>>>>> theirs
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
<<<<<<< ours
            <Link
              key={item.id}
              href={getProductUrl(item)}
              className="rounded-[28px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30"
            >
              <ProductImageGallery product={item} compact />
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-200">{getCommercialCategory(item.category)}</p>
=======
            <Link key={item.id} href={getProductUrl(item)} className="rounded-[28px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[22px]">
                <ProductImage src={`/catalog-assets/${item.id}.webp`} alt={item.name} label={`${item.name} • ${item.category}`} sizes="(max-width: 1200px) 50vw, 20vw" />
              </div>
=======
              <SafeProductImage product={item} alt={item.name} className="mb-4 aspect-square w-full rounded-[22px] object-cover" />
>>>>>>> theirs
=======
              <SafeProductImage product={item} alt={item.name} className="mb-4 aspect-square w-full rounded-[22px] object-cover" />
>>>>>>> theirs
=======
              <SafeProductImage product={item} alt={item.name} className="mb-4 aspect-square w-full rounded-[22px] object-cover" />
>>>>>>> theirs
=======
              <SafeProductImage product={item} alt={item.name} className="mb-4 aspect-square w-full rounded-[22px] object-cover" />
>>>>>>> theirs
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.category}</p>
>>>>>>> theirs
              <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-sm text-white/60">A partir de {formatCurrency(item.pricePix)} no Pix</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
