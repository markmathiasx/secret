import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircleMore } from 'lucide-react';
import { catalog, findProductBySlug } from '@/lib/catalog';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductVisualBadge, ProductVisualNotice } from '@/components/product-visual-authenticity';
import { QuoteForm } from '@/components/quote-form';
import { formatCurrency } from '@/lib/utils';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';
import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/env';
import { getProductHighlights, getProductLongDescription } from '@/lib/catalog-content';
import { resolveProductImage } from '@/lib/product-images';

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: `${product.id}-${product.name.toLowerCase().replace(/\s+/g, '-')}` }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado | MDH 3D Store',
    };
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/catalogo/${slug}`;
  const resolvedImage = resolveProductImage(product);
  const imageUrl = resolvedImage.startsWith("http") ? resolvedImage : `${siteUrl}${resolvedImage}`;
  const longDescription = getProductLongDescription(product);

  return {
    title: `${product.name} | MDH 3D Store`,
    description: longDescription,
    keywords: [...product.tags, 'impressão 3D', 'PLA', 'Bambu Lab', 'personalizado'].join(', '),
    openGraph: {
      title: `${product.name} - Impressão 3D`,
      description: longDescription,
      url: productUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | MDH 3D Store`,
      description: longDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/catalogo/${slug}`;
  const resolvedImage = resolveProductImage(product);
  const imageUrl = resolvedImage.startsWith("http") ? resolvedImage : `${siteUrl}${resolvedImage}`;
  const resolvedImages = Array.from(
    new Set([
      imageUrl,
      ...(product.images?.map((image) => (image.startsWith("http") ? image : `${siteUrl}${image}`)) || []),
    ])
  );
  const highlights = getProductHighlights(product);
  const longDescription = getProductLongDescription(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: longDescription,
    image: resolvedImages,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'MDH 3D Store',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: product.pricePix,
      priceCurrency: 'BRL',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MDH 3D Store',
      },
    },
    category: product.category,
    material: product.material,
  };

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\nTenho interesse em ${product.name} (${product.sku}).`)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
      <Link href="/catalogo" className="btn-ghost-sm mb-6 inline-flex">
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <ProductImageGallery product={product} />

        <div className="glass-panel p-6 md:p-7">
          <div className="flex flex-wrap gap-2">
            <span className="glass-chip">{product.category}</span>
            <span className="chip-nav">{product.subcategory}</span>
            <span className="chip-nav">{product.collection}</span>
            <span className="chip-nav">{product.readyToShip ? 'Pronta entrega' : 'Sob encomenda'}</span>
            <ProductVisualBadge product={product} />
          </div>
          <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-base leading-8 text-white/70">{longDescription}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
                {highlight}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-100/70">Pix</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.price ?? product.pricePix)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Cartão</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Prazo</p>
              <p className="mt-2 text-lg font-bold text-white">{product.printTime ?? product.productionWindow}</p>
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-white/70 mb-3">Cores disponíveis</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.color}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      variant.available
                        ? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/50'
                        : 'border-white/10 bg-white/5 text-white/45 cursor-not-allowed'
                    }`}
                    disabled={!variant.available}
                  >
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 rounded-[24px] border border-amber-400/20 bg-amber-400/10">
            <p className="text-sm text-amber-100">
              <strong>Aviso:</strong> Confirme a licença comercial antes de revender.
              Este produto é para uso {product.licenseType === 'personal' ? 'pessoal' : 'comercial'}.
            </p>
          </div>

          <div className="mt-6">
            <ProductVisualNotice product={product} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Material', product.material],
              ['Acabamento', product.finish],
              ['Peso PLA', product.plaWeight ?? `${product.grams} g`],
              ['Dimensões', product.dimensions]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                <p className="mt-2 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/checkout?product=${product.id}`} className="btn-primary">Ir para checkout</Link>
            {product.customizable && (
              <button className="btn-secondary">Personalizar (Escala, Cor)</button>
            )}
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <QuoteForm product={product} />
      </div>
    </section>
    </>
  );
}
