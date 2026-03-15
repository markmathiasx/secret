import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuoteForm } from "@/components/quote-form";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { PixPaymentCard } from "@/components/pix-payment-card";
import { SafeProductImage } from "@/components/safe-product-image";
import { catalog, findProductBySlug, getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { FavoriteButton } from "@/components/favorite-button";

const highlightBadges = ["Foto real", "Sob encomenda", "Personalizável", "Pronta entrega"];

export function generateStaticParams() {
  return catalog.slice(0, 120).map((product) => ({ slug: getProductUrl(product).split("/").pop()! }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  const related = catalog.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 flex flex-wrap gap-2 text-xs text-white/60">
            <Link href="/catalogo" className="rounded-full border border-white/10 px-3 py-1">Catálogo</Link>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">{product.collection}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{product.category}</span>
          </div>

          <div className="relative">
            <ProductImageGallery product={product} />
            <div className="absolute right-3 top-3"><FavoriteButton productId={product.id} /></div>
          </div>

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h1 className="text-4xl font-black text-white">{product.name}</h1>
            <p className="mt-4 text-base leading-8 text-white/68">{product.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {highlightBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/75">{badge}</span>
              ))}
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">Material PLA premium</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Preço inicial no Pix</p>
                <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Cartão</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Prazo estimado</p>
                <p className="mt-2 text-2xl font-black text-white">{product.productionWindow}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{tag}</span>
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
        <h2 className="text-2xl font-bold text-white">Você também pode gostar</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-[28px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30">
              <SafeProductImage product={item} alt={item.name} className="mb-4 aspect-square w-full rounded-[22px] object-cover" />
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-sm text-white/60">A partir de {formatCurrency(item.pricePix)} no Pix</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
