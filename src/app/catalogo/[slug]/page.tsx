import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsPageEvent } from "@/components/analytics-page-event";
import { ProductMediaImage } from "@/components/product-media-image";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { PixPaymentCard } from "@/components/pix-payment-card";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { getProductUrl } from "@/lib/catalog";
import { getRelatedProducts, getStorefrontProductBySlug, listStorefrontProducts } from "@/lib/catalog-server";
import { getAbsoluteUrl, getBreadcrumbStructuredData, getProductStructuredData, getSiteUrl } from "@/lib/seo";
import { formatCurrency, formatInstallment } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await listStorefrontProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado"
    };
  }

  const title = `${product.name} - ${product.category}`;
  const description = `${product.description} Compre na MDH 3D com ${formatCurrency(product.pricePix)} no Pix e prazo de ${product.productionWindow}.`;
  const canonical = `${getSiteUrl()}${getProductUrl(product)}`;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: getAbsoluteUrl(product.imagePath || "/logo-mdh.jpg"), alt: product.imageAlt || product.name }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getAbsoluteUrl(product.imagePath || "/logo-mdh.jpg")]
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const productLd = getProductStructuredData(product);
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Catalogo", item: `${getSiteUrl()}/catalogo` },
    { name: product.category, item: `${getSiteUrl()}/catalogo?category=${encodeURIComponent(product.category)}` },
    { name: product.name, item: `${getSiteUrl()}${getProductUrl(product)}` }
  ]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <AnalyticsPageEvent
        eventName="view_product"
        payload={{
          productId: product.id,
          sku: product.sku,
          category: product.category,
          pricePix: product.pricePix
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_72px_rgba(2,8,23,0.32)]">
            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Catalogo
              </Link>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">{product.collection}</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">{product.category}</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">{product.productionWindow}</span>
            </div>

            <div className="mt-5 grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Hero do produto</p>
                <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{product.name}</h1>
                <p className="mt-4 text-lg leading-8 text-white/72">{product.merchandising}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/12 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Pix</p>
                  <p className="mt-2 text-3xl font-black text-white">{formatCurrency(product.pricePix)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Cartao</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
                  <p className="mt-2 text-xs text-white/55">{formatInstallment(product.priceCard)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">SKU</p>
                  <p className="mt-2 text-sm font-semibold text-white">{product.sku}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Pedido real com timeline",
                "Pix com melhor valor",
                "Checkout guest rapido",
                product.imageStatus === "imported" ? "Imagem local pronta" : "Preview premium estavel"
              ].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/68">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <ProductImageGallery product={product} />

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_22px_64px_rgba(2,8,23,0.26)]">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Descricao e beneficios</p>
              <p className="mt-4 text-base leading-8 text-white/72">{product.description}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[
                  "Acabamento pensado para presente, setup ou decoracao sem exigir briefing longo.",
                  "Prazo e faixa de preco visiveis antes do checkout para reduzir atrito.",
                  "Pode ser combinado com cores e detalhes sob orientacao pelo WhatsApp.",
                  "Bom para compra impulsiva, kit tematico ou reposicao rapida de setup."
                ].map((benefit) => (
                  <div key={benefit} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/64">
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-6 shadow-[0_22px_64px_rgba(2,8,23,0.24)]">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Leitura operacional</p>
              <div className="mt-5 grid gap-3">
                {[
                  ["Tema", product.theme],
                  ["Colecao", product.collection],
                  ["Prazo", product.productionWindow],
                  ["Materiais", product.materials.join(", ")],
                  ["Cores", product.colors.join(", ")],
                  ["Peso", `${product.grams} g`],
                  ["Impressao", `${product.hours} h`],
                  ["Midia", product.imageStatus === "imported" ? "Imagem real local" : "Placeholder premium"]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
                    <span>{label}</span>
                    <strong className="max-w-[60%] text-right text-white">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <ProductPurchasePanel product={product} />
          <DeliveryCalculator />
          <PixPaymentCard title={product.name} amount={product.pricePix} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white">Projetos parecidos</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-[28px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30">
              <ProductMediaImage product={item} className="mb-4 aspect-square w-full rounded-[22px] object-cover" />
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-sm text-white/60">{formatCurrency(item.pricePix)} no Pix</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
