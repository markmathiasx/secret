import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BadgeCheck, Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { SmartProductActions } from "@/components/mdh-store/SmartProductActions";
import {
  LocalReviewsAndQuestions,
  ProductMediaGallery,
  ProductShippingEstimator,
  ProductSpecsPanel,
} from "@/components/mdh-store/ProductExperience";
import { StoreAnimatedBackground } from "@/components/mdh-store/StoreAnimatedBackground";
import { findProductBySlug, getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { findLocalStoreProduct, getLocalStoreProducts, getRelatedLocalProducts } from "@/lib/mdh-store/products";
import { getStorefrontWhatsappNumber } from "@/lib/mdh-store/config";
import { getLocalQuestions, getLocalReviews, getReviewSummary } from "@/lib/mdh-store/social-proof";
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
  return getLocalStoreProducts()
    .slice(0, 1000)
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalogProduct = findProductBySlug(slug);

  if (catalogProduct) {
    const canonicalPath = getProductUrl(catalogProduct);
    return {
      title: catalogProduct.name,
      description: catalogProduct.description,
      alternates: { canonical: canonicalPath },
    };
  }

  const product = findLocalStoreProduct(slug);
  if (!product) {
    return {
      title: "Produto não encontrado | MDH 3D",
      robots: { index: false, follow: true },
    };
  }

  const productPath = buildProductPagePath(product);
  const productUrl = `${getSiteUrl()}${productPath}`;
  const image = absoluteUrl(product.image || product.gallery[0]);

  return {
    title: product.seoTitle || `${product.name} | MDH 3D`,
    description: product.seoDescription || product.description,
    alternates: {
      canonical: productPath,
    },
    keywords: [...product.tags, product.category, product.material, "impressão 3D", "Bambu Lab A1"].join(", "),
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      url: productUrl,
      type: "website",
      images: [{ url: image, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.seoDescription || product.description,
      images: [image],
    },
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const catalogProduct = findProductBySlug(slug);

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
  const productPath = buildProductPagePath(product);
  const productUrl = `${siteUrl}${productPath}`;
  const whatsappNumber = getStorefrontWhatsappNumber();
  const reviews = getLocalReviews(product.slug);
  const questions = getLocalQuestions(product.slug);
  const reviewSummary = getReviewSummary(product.slug);
  const relatedProducts = getRelatedLocalProducts(product, 4);
  const imageUrls = Array.from(new Set([product.image, ...product.gallery].filter(Boolean).map(absoluteUrl)));
  const dimensionParts = [
    product.dimensions.lengthCm ? `${product.dimensions.lengthCm} cm C` : null,
    product.dimensions.widthCm ? `${product.dimensions.widthCm} cm L` : null,
    product.dimensions.heightCm ? `${product.dimensions.heightCm} cm A` : null,
  ].filter(Boolean);
  const structuredProperties = [
    { name: "Material", value: product.material },
    { name: "Prazo de produção", value: product.productionWindow },
    { name: "Personalização", value: product.personalizable ? "Aceita ajustes de cor, nome, logo ou briefing" : "Modelo com ajustes sob consulta" },
    ...(dimensionParts.length ? [{ name: "Dimensões", value: dimensionParts.join(" x ") }] : []),
  ];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    url: productUrl,
    name: product.name,
    description: product.description,
    image: imageUrls,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "MDH3D" },
    category: product.category,
    material: product.material,
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.pixPrice,
      priceCurrency: "BRL",
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "MDH 3D Store", url: siteUrl },
      priceSpecification: {
        "@type": "PriceSpecification",
        price: product.pixPrice,
        priceCurrency: "BRL",
        valueAddedTaxIncluded: true,
      },
    },
    additionalProperty: structuredProperties.map((item) => ({
      "@type": "PropertyValue",
      name: item.name,
      value: item.value,
    })),
    ...(reviewSummary.average && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewSummary.average,
        reviewCount: reviewSummary.total,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews.length && {
      review: reviews.map((review) => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.author },
        datePublished: review.createdAt,
        name: review.title,
        reviewBody: review.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${siteUrl}/catalogo` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${siteUrl}/catalogo?category=${encodeURIComponent(product.category)}` },
      { "@type": "ListItem", position: 4, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <main className="relative isolate min-h-screen overflow-hidden bg-[#071016] px-4 pb-16 pt-8 text-white sm:px-6 lg:pt-12">
        <StoreAnimatedBackground />
        <div className="relative z-10 mx-auto max-w-7xl">
          <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-100/78 transition hover:text-cyan-50">
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>

          <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)] lg:items-start">
            <div>
              <ProductMediaGallery product={product} />
            </div>

            <aside className="rounded-[8px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur">
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
                  [PackageCheck, product.material],
                  [Clock3, product.productionWindow],
                  [ShieldCheck, product.personalizable ? "Personalizável sob validação" : "Compra com validação de acabamento"],
                  [Truck, "Frete/retirada confirmados antes do fechamento"],
                ].map(([Icon, label]) => (
                  <div key={String(label)} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/20 px-3 py-2">
                    <Icon className="h-4 w-4 text-cyan-100" />
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[8px] border border-amber-200/18 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50/88">
                <strong>Compra honesta:</strong> preço, prazo e imagem são exibidos como dados comerciais da loja. Cor, escala, logo e acabamento são confirmados antes da produção quando houver personalização.
              </div>

              <div className="mt-5">
                <SmartProductActions product={product} productUrl={productUrl} whatsappNumber={whatsappNumber} />
              </div>
            </aside>
          </section>

          <section className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              ["Feito sob encomenda", "Produção Bambu Lab A1/A1 Mini com validação visual antes de embalar."],
              ["Compra segura via checkout externo", "Quando há checkout parceiro, o link é aberto fora do site sem expor dados de cartão."],
              ["Suporte humano", "WhatsApp oficial para confirmar prazo, cor, escala, retirada ou entrega."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
                <BadgeCheck className="h-5 w-5 text-emerald-100" />
                <h2 className="mt-3 text-lg font-black text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
              </div>
            ))}
          </section>

          <ProductSpecsPanel product={product} />
          <ProductShippingEstimator product={product} />
          <LocalReviewsAndQuestions product={product} reviews={reviews} questions={questions} />

          {relatedProducts.length ? (
            <section className="mt-8 rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
              <p className="section-kicker">Relacionados</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <Link key={item.slug} href={buildProductPagePath(item)} className="rounded-[8px] border border-white/10 bg-black/20 p-3 transition hover:border-cyan-200/35">
                    <span className="block aspect-square overflow-hidden rounded-[8px] bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || item.gallery[0] || "/catalog-assets/product-placeholder.webp"} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    </span>
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
