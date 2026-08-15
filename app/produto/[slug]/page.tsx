import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, Clock3, MessageCircleMore, ShieldCheck, Truck } from "lucide-react";
import { findCatalogProductBySlug } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/product-routing";
import { getSiteUrl } from "@/lib/env";
import { getStorefrontWhatsappNumber } from "@/lib/mdh-store/config";
import { findLocalStoreProduct, getLocalStoreProducts, getRelatedLocalProducts } from "@/lib/mdh-store/products";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 300;
export const dynamic = "force-static";

type ProdutoPageProps = {
  params: Promise<{ slug: string }>;
};

function absoluteUrl(pathOrUrl?: string) {
  const siteUrl = getSiteUrl();
  if (!pathOrUrl) return `${siteUrl}/catalog-assets/product-placeholder.webp`;
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${siteUrl}${pathOrUrl}`;
}

function slugToSearchQuery(slug: string) {
  return slug
    .replace(/^[a-z]+-\d+-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateStaticParams() {
  return getLocalStoreProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalogProduct = await findCatalogProductBySlug(slug);

  if (catalogProduct) {
    return {
      title: catalogProduct.name,
      description: catalogProduct.description,
      alternates: { canonical: getProductUrl(catalogProduct) },
      robots: { index: false, follow: true },
    };
  }

  const product = findLocalStoreProduct(slug);
  if (!product) {
    return {
      title: "Produto não encontrado | MDH 3D",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${product.name} | MDH 3D`,
    description: product.seoDescription || product.description,
    alternates: { canonical: `/produto/${product.slug}` },
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const catalogProduct = await findCatalogProductBySlug(slug);

  if (catalogProduct) {
    redirect(getProductUrl(catalogProduct));
  }

  const product = findLocalStoreProduct(slug);
  if (!product) {
    const query = slugToSearchQuery(slug);
    if (query) redirect(`/busca?q=${encodeURIComponent(query)}`);
    notFound();
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/produto/${product.slug}`;
  const whatsappNumber = getStorefrontWhatsappNumber();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Quero comprar ${product.name} (${product.sku}). Confirmar cor, prazo e pagamento.`
  )}`;
  const imageUrls = Array.from(new Set([product.image, ...product.gallery].filter(Boolean).map(absoluteUrl)));
  const relatedProducts = getRelatedLocalProducts(product, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrls,
    sku: product.sku,
    category: product.category,
    material: product.material,
    url: productUrl,
    offers: {
      "@type": "Offer",
      price: product.pixPrice,
      priceCurrency: "BRL",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: "MDH 3D",
        url: siteUrl,
      },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Produto", item: `${siteUrl}/produto/${product.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <main className="min-h-screen bg-[#071016] px-4 pb-16 pt-8 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-100/78 transition hover:text-cyan-50">
            Voltar ao catálogo curado
          </Link>

          <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.6fr)]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[8px] border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image || product.gallery[0]} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {product.gallery.slice(1, 4).map((image) => (
                  <div key={image} className="overflow-hidden rounded-[8px] border border-white/10 bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[8px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <p className="section-kicker">{product.category}</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">{product.name}</h1>
              <p className="mt-4 text-sm leading-7 text-white/68">{product.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[8px] border border-emerald-300/18 bg-emerald-300/10 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100/72">Pix</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatCurrency(product.pixPrice)}</p>
                </div>
                <div className="rounded-[8px] border border-cyan-300/18 bg-cyan-300/10 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100/72">Cartão</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatCurrency(product.cardPrice || product.price)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-sm text-white/68">
                {[
                  [BadgeCheck, `SKU ${product.sku}`],
                  [Clock3, product.productionWindow],
                  [ShieldCheck, "Compra segura via checkout externo"],
                  [Truck, "Produção local com confirmação humana antes do envio"],
                ].map(([Icon, label]) => (
                  <div key={String(label)} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/20 px-3 py-2">
                    <Icon className="h-4 w-4 text-cyan-100" />
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[8px] border border-amber-200/18 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50/88">
                <strong>Compra honesta:</strong> esta página existe para itens reais do smart store. Cor, acabamento e prazo seguem confirmação humana antes da produção.
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2">
                  <MessageCircleMore className="h-4 w-4" />
                  Comprar no WhatsApp
                </a>
                <Link href="/checkout" className="btn-primary justify-center gap-2">
                  Ir para checkout
                </Link>
              </div>
            </aside>
          </section>

          {relatedProducts.length ? (
            <section className="mt-10 rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
              <p className="section-kicker">Relacionados</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <Link key={item.slug} href={`/produto/${item.slug}`} className="rounded-[8px] border border-white/10 bg-black/20 p-3 transition hover:border-cyan-200/35">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image || item.gallery[0]} alt={item.name} className="aspect-square w-full rounded-[8px] object-cover" loading="lazy" />
                    <span className="mt-3 block text-sm font-black text-white">{item.name}</span>
                    <span className="mt-1 block text-xs text-white/55">{formatCurrency(item.pixPrice)} no Pix</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
