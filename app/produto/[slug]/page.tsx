import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, PackageCheck, Ruler, Tag, type LucideIcon } from "lucide-react";
import { SmartProductActions } from "@/components/mdh-store/SmartProductActions";
import { getStorefrontWhatsappNumber } from "@/lib/mdh-store/config";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { findLocalStoreProduct, getLocalStoreProducts, getRelatedLocalProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = 300;

export async function generateStaticParams() {
  return getLocalStoreProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findLocalStoreProduct(slug);
  if (!product) return { title: "Produto não encontrado" };

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: { canonical: buildProductPagePath(product) },
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      type: "website",
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  };
}

function dimensionsLabel(product: ReturnType<typeof findLocalStoreProduct>) {
  if (!product) return "Sob consulta";
  const { heightCm, widthCm, lengthCm } = product.dimensions;
  const parts = [
    heightCm ? `${heightCm} cm alt.` : "",
    widthCm ? `${widthCm} cm larg.` : "",
    lengthCm ? `${lengthCm} cm comp.` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" x ") : "Sob consulta";
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findLocalStoreProduct(slug);
  if (!product) notFound();

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}${buildProductPagePath(product)}`;
  const related = getRelatedLocalProducts(product);
  const whatsappNumber = getStorefrontWhatsappNumber();
  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${siteUrl}${product.image}`
    : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    image: imageUrl ? [imageUrl] : undefined,
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: product.nuvemshopUrl || productUrl,
      price: product.pixPrice,
      priceCurrency: "BRL",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Prazo de produção", value: product.productionWindow },
      { "@type": "PropertyValue", name: "Medidas", value: dimensionsLabel(product) },
      { "@type": "PropertyValue", name: "Peso", value: product.weightKg ? `${product.weightKg} kg` : "Sob consulta" },
    ],
  };
  const details: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Categoria", value: product.category, icon: Tag },
    { label: "SKU", value: product.sku, icon: PackageCheck },
    { label: "Prazo de produção", value: product.productionWindow, icon: Clock3 },
    { label: "Medidas", value: dimensionsLabel(product), icon: Ruler },
  ];

  return (
    <main className="min-h-screen bg-[#071016] pb-14 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
            <div className="aspect-square overflow-hidden rounded-[8px] bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image || "/catalog-assets/product-placeholder.webp"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div>
          <Link href="/loja" className="text-sm font-bold text-cyan-100 underline-offset-4 hover:underline">
            Voltar para loja
          </Link>
          <p className="section-kicker mt-5">{product.category}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">{product.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/68">{product.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[8px] border border-emerald-300/18 bg-emerald-300/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/68">Preço Pix</p>
              <p className="mt-2 text-3xl font-black text-white">{formatCurrency(product.pixPrice)}</p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/46">Cartão</p>
              <p className="mt-2 text-3xl font-black text-white">{product.cardPrice ? formatCurrency(product.cardPrice) : "Sob consulta"}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
            <SmartProductActions product={product} productUrl={productUrl} whatsappNumber={whatsappNumber} />
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/46">
                  <Icon className="h-4 w-4 text-cyan-100" /> {label}
                </dt>
                <dd className="mt-2 font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <p className="section-kicker">Relacionados</p>
            <h2 className="mt-1 text-2xl font-black text-white">Outras ideias da mesma vitrine</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <Link key={item.slug} href={buildProductPagePath(item)} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-200/30">
                  <p className="font-black text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-white/50">{item.category}</p>
                  <p className="mt-2 text-sm font-black text-emerald-100">{formatCurrency(item.pixPrice)}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
