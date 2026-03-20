import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { catalog, findProductBySlug, getProductUrl } from "@/lib/catalog";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuoteForm } from "@/components/quote-form";
import { ProductActions } from "@/components/product-actions";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

function resolveImageUrl(siteUrl: string, image?: string) {
  if (!image) return `${siteUrl}/catalog-assets/product-placeholder.webp`;
  return image.startsWith("http") ? image : `${siteUrl}${image}`;
}

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: getProductUrl(product).replace("/catalogo/", "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) {
    return { title: "Produto nao encontrado | MDH 3D" };
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/catalogo/${slug}`;
  const imageUrl = resolveImageUrl(siteUrl, product.images?.[0]);

  return {
    title: `${product.name} | MDH 3D`,
    description: product.seoMetaDescription,
    keywords: [
      ...product.tags,
      product.sku,
      product.technical.partNumber || "",
      "pecas a1 mini",
      "marketplace tecnico",
    ].join(", "),
    openGraph: {
      title: product.seoTitle,
      description: product.seoMetaDescription,
      url: productUrl,
      images: [{ url: imageUrl, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seoTitle,
      description: product.seoMetaDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/catalogo/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: (product.images || []).map((item) => resolveImageUrl(siteUrl, item)),
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "MDH 3D",
    },
    offers: {
      "@type": "Offer",
      price: product.pricePix,
      priceCurrency: "BRL",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
    },
    category: product.category,
    material: product.material,
  };

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `${whatsappMessage}\n\nTenho interesse em ${product.name} (${product.sku}).`
  )}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
        <Link href="/catalogo" className="inline-flex items-center gap-2 rounded-full border border-[#e6d5bf] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff8ef]">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catalogo
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <ProductImageGallery product={product} />

          <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff8ef] p-6 text-slate-900 shadow-[0_26px_70px_rgba(15,23,42,0.10)] md:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{product.category}</span>
              <span className="rounded-full bg-[#e8f4ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{product.technical.typeProduct}</span>
              <span className="rounded-full bg-[#eef7ec] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{product.status}</span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 md:text-5xl">{product.name}</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">{product.description}</p>

            <div className="mt-5 rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">SKU / PN / Compatibilidade</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {product.sku} {product.technical.partNumber ? `| ${product.technical.partNumber}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-600">{product.technical.compatibilityModels.join(" / ")} (verificado)</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700/75">Pix</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
                <p className="text-sm text-slate-500">Cartao</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(product.priceCard)}</p>
              </div>
              <div className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
                <p className="text-sm text-slate-500">Prazo</p>
                <p className="mt-2 text-lg font-black text-slate-900">{product.productionWindow}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Material" value={product.material} />
              <InfoCard label="Acabamento" value={product.finish} />
              <InfoCard label="Peso" value={product.plaWeight ?? `${product.grams} g`} />
              <InfoCard label="Dimensoes" value={product.dimensions} />
              <InfoCard label="Fornecedor" value={product.technical.supplierType} />
              <InfoCard label="Originalidade" value={product.technical.originalityLevel} />
            </div>

            <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
                <ShieldCheck className="h-4 w-4" />
                Seguranca obrigatoria de manutencao
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-900/90">
                {product.technical.safetyWarnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>

            <ProductActions productId={product.id} checkoutHref="/checkout" whatsappHref={whatsappHref} />
          </div>
        </div>

        {product.technical.bomItems?.length ? (
          <section className="mt-8 rounded-[32px] border border-[#e8dac7] bg-white p-6">
            <h2 className="text-2xl font-black text-slate-900">BOM do kit</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {product.technical.bomItems.map((item) => (
                <div key={item.sku} className="rounded-2xl border border-[#e8dac7] bg-[#fff8ef] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.sku}</p>
                  <p className="mt-2 font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">Quantidade: {item.qty}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-12 rounded-[36px] border border-[#e8dac7] bg-slate-950 p-4 shadow-[0_26px_70px_rgba(2,8,23,0.28)] md:p-6">
          <QuoteForm product={product} />
        </div>
      </section>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#ead8c1] bg-white p-4 text-sm text-slate-600">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

