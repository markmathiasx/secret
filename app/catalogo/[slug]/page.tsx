import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CopyPlus, MessageCircleMore, Share2 } from 'lucide-react';
import { catalog, findProductBySlug } from '@/lib/catalog';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductModelPanel } from '@/components/product-model-panel';
import { ProductRelatedShelf } from '@/components/product-related-shelf';
import { ProductVisualBadge, ProductVisualNotice } from '@/components/product-visual-authenticity';
import { ProductPurchaseTools } from '@/components/product-purchase-tools';
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
      title: 'Produto não encontrado',
    };
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/catalogo/${slug}`;
  const resolvedImage = resolveProductImage(product);
  const imageUrl = resolvedImage.startsWith("http") ? resolvedImage : `${siteUrl}${resolvedImage}`;
  const longDescription = getProductLongDescription(product);

  return {
    title: product.name,
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
      title: `${product.name} | MDH 3D`,
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
  const customizationHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\nQuero personalizar ${product.name} (${product.sku}).`)}`;
  const primaryActionLabel = product.pricingMode === 'faixa-auditada' ? 'Comprar agora' : 'Pedir orçamento';
  const priceLabel = product.pricingMode === 'faixa-auditada' ? 'Preço no Pix' : 'Estimativa inicial no Pix';
  const idealFor = Array.from(
    new Set(
      [
        product.featured ? 'boa peça âncora para começar a compra' : null,
        product.readyToShip ? 'funciona bem quando o cliente quer mais rapidez' : null,
        product.customizable ? 'aceita ajustes de cor, escala ou briefing' : null,
        product.category.includes('Geek') || product.theme.toLowerCase().includes('anime')
          ? 'combina com presente, coleção e decoração de setup'
          : null,
        product.category.includes('Setup') || product.category.includes('Utilidade')
          ? 'ajuda mais quem está comprando por função e praticidade'
          : null,
      ].filter(Boolean)
    )
  ) as string[];
  const decisionRoutes = [
    { label: `Ver mais em ${product.category}`, href: `/catalogo?category=${encodeURIComponent(product.category)}&mode=all` },
    { label: `Explorar coleção ${product.collection}`, href: `/catalogo?collection=${encodeURIComponent(product.collection)}&mode=all` },
    product.readyToShip
      ? { label: 'Abrir pronta entrega', href: '/catalogo?status=Pronta%20entrega&mode=all' }
      : { label: 'Buscar opções mais rápidas', href: '/catalogo?intent=Compra%20r%C3%A1pida&mode=all' },
    product.customizable
      ? { label: 'Ver personalizáveis', href: '/catalogo?custom=1&mode=all' }
      : { label: 'Pedir algo sob medida', href: '/imagem-para-impressao-3d' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
        <Link href="/" className="transition hover:text-cyan-100">Início</Link>
        <span>/</span>
        <Link href="/catalogo" className="transition hover:text-cyan-100">Catálogo</Link>
        <span>/</span>
        <span className="text-white/78">{product.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/catalogo" className="btn-ghost-sm inline-flex">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>
        <div className="flex flex-wrap gap-2">
          <span className="chip-nav"><CopyPlus className="h-4 w-4" /> SKU {product.sku}</span>
          <span className="chip-nav"><Share2 className="h-4 w-4" /> página individual</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <ProductImageGallery product={product} />
          <ProductModelPanel product={product} />
        </div>

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
              <p className="text-sm text-emerald-100/70">{priceLabel}</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
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

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Produção</p>
              <p className="mt-2 font-semibold text-white">{product.readyToShip ? 'Pronta para produção rápida' : 'Feita sob encomenda'}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Personalização</p>
              <p className="mt-2 font-semibold text-white">{product.customizable ? 'Aceita ajustes de cor, escala ou briefing' : 'Modelo fechado com acabamento padronizado'}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Atendimento</p>
              <p className="mt-2 font-semibold text-white">Suporte direto no WhatsApp com código do pedido</p>
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

          <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-sm text-cyan-50">
              <strong>Compra com clareza:</strong> se você quiser validar cor, escala, prazo ou acabamento antes de pagar, a equipe confirma tudo pelo WhatsApp.
            </p>
          </div>

          {idealFor.length > 0 ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Este item funciona bem quando</p>
              <div className="mt-3 grid gap-3">
                {idealFor.map((item) => (
                  <div key={item} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Faixa comercial</p>
            <p className="mt-2 font-semibold text-white">
              {product.pricingMode === 'faixa-auditada' ? 'Preço confirmado para compra direta' : 'Estimativa inicial para produção sob medida'}
            </p>
            <p className="mt-2">{product.pricingNarrative}</p>
            {product.marketBenchmark ? (
              <p className="mt-2 text-white/60">
                Faixa observada no mercado para {product.marketBenchmark.label.toLowerCase()}: de {formatCurrency(product.marketBenchmark.min)} até cerca de {formatCurrency(product.marketBenchmark.premium)}.
              </p>
            ) : null}
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

          <div className="mt-6">
            <ProductPurchaseTools
              productId={product.id}
              productName={product.name}
              sku={product.sku}
              pricePix={product.pricePix}
              priceCard={product.priceCard}
              customizable={product.customizable}
              whatsappHref={whatsappHref}
              customizationHref={customizationHref}
            />
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Se este item não for o encaixe ideal</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {decisionRoutes.map((item) => (
                <Link key={item.label} href={item.href} className="chip-nav">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/checkout?product=${product.id}`} className="btn-primary">{primaryActionLabel}</Link>
            {product.customizable && (
              <a href={customizationHref} target="_blank" rel="noreferrer" className="btn-secondary">
                Solicitar personalização
              </a>
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

      <ProductRelatedShelf product={product} />
    </section>
    </>
  );
}
