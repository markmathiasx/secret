import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { PixPaymentCard } from "@/components/pix-payment-card";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { QuoteForm } from "@/components/quote-form";
import { StoreProductCard } from "@/components/store-product-card";
import { catalog, findProductBySlug, getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

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
            <Link href="/catalogo" className="rounded-full border border-white/10 px-3 py-1">
              Catálogo
            </Link>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
              {product.collection}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">{product.category}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{product.sku}</span>
          </div>

          <ProductImageGallery product={product} />

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h1 className="text-4xl font-black text-white">{product.name}</h1>
            <p className="mt-4 text-base leading-8 text-white/68">{product.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Preço base</p>
                <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Horas de produção</p>
                <p className="mt-2 text-2xl font-black text-white">{product.hours} h</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/55">Material / peso</p>
                <p className="mt-2 text-2xl font-black text-white">{product.grams} g</p>
              </div>
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
          <ProductPurchasePanel product={product} />
          <DeliveryCalculator />
          <QuoteForm initialProduct={product} />
          <PixPaymentCard title={product.name} amount={product.pricePix} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white">Projetos parecidos</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <StoreProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
