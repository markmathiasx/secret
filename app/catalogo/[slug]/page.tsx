import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CopyPlus, MessageCircleMore, ShieldCheck, Clock, Star, MessageCircle } from 'lucide-react';
import { BackInStockButton } from '@/components/back-in-stock-button';
import { ShareButton } from '@/components/share-button';
import { findCatalogProductBySlug, getCatalogStaticParams } from '@/lib/catalog-repository';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductModelPanel } from '@/components/product-model-panel';
import { ProductPriceStack } from '@/components/product-price-stack';
import { ProductRelatedShelf } from '@/components/product-related-shelf';
import { ProductVisualBadge, ProductVisualNotice } from '@/components/product-visual-authenticity';
import { ProductPurchaseTools } from '@/components/product-purchase-tools';
import { ProductAnalytics } from '@/components/product-analytics';
import { ProductCatalogBackLink } from '@/components/product-catalog-back-link';
import { ProductReviews } from '@/components/product-reviews';
import { DeliveryCalculator } from '@/components/delivery-calculator';
import { CommerceFaq } from '@/components/commerce-faq';
import { QuoteForm } from '@/components/quote-form';
import { GuaranteeBar } from '@/components/guarantee-bar';
import { ProductSocialProof, TrustBadges } from '@/components/product-social-proof';
import { StickyPdpCta } from '@/components/sticky-pdp-cta';
import { ProductBundleSuggestion } from '@/components/product-bundle-suggestion';
import { RecentlyViewedShelf } from '@/components/recently-viewed-shelf';
import { PurchaseProtectionBanner } from '@/components/purchase-protection-banner';
import { SafeBackgroundVideo } from '@/components/SafeBackgroundVideo';
import { formatCurrency } from '@/lib/utils';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';
import { Metadata } from 'next';
import { getSiteUrl, isCardCheckoutConfigured } from '@/lib/env';
import { getProductHighlights, getProductLongDescription } from '@/lib/catalog-content';
import { resolveProductImage } from '@/lib/product-images';
import { catalog, featuredCatalog, getProductUrl } from '@/lib/catalog';
import { getProductMarketplaceSignals, getStoreReputationSummary, getProductReviewSnippets } from '@/lib/marketplace-signals';
import { validateProductMedia, isPublicSafe } from '@/lib/media-validation';
import { getProductVisual } from '@/lib/product-visuals';
import { getLicensedVideoAsset } from '@/lib/video-assets';

export const revalidate = 300;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return getCatalogStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await findCatalogProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado',
    };
  }

  const siteUrl = getSiteUrl();
  const productPath = getProductUrl(product);
  const productUrl = `${siteUrl}${productPath}`;
  const resolvedImage = resolveProductImage(product);
  const imageUrl = resolvedImage.startsWith("http") ? resolvedImage : `${siteUrl}${resolvedImage}`;
  const longDescription = getProductLongDescription(product);
  const visual = getProductVisual(product);
  const [productSignals, storeSummary, reviewSnippets] = await Promise.all([
    getProductMarketplaceSignals(product.id, product.sku),
    getStoreReputationSummary(),
    getProductReviewSnippets(product.sku, 5),
  ]);
  const metaMediaRecord = validateProductMedia(product);
  const metaMediaSafe = isPublicSafe(metaMediaRecord.status) && metaMediaRecord.gallery.length >= 1;
  // Only use real/verified images in OG/Twitter; fallback to brand logo
  const ogImageUrl = metaMediaSafe ? imageUrl : `${siteUrl}/logo-mdh-3d.webp`;

  return {
    title: `${product.name} - Impressão 3D Premium | MDH 3D Rio`,
    description: `Compre ${product.name} em ${product.material || "PLA Premium"} com imagem classificada como ${visual.label.toLowerCase()}, produção local no RJ e atendimento humano para validar cor, escala e prazo.`,
    alternates: {
      canonical: productPath,
    },
    keywords: [...product.tags, 'impressão 3D', 'PLA', 'Bambu Lab', 'personalizado'].join(', '),
    openGraph: {
      title: `${product.name} - Impressão 3D`,
      description: longDescription,
      url: productUrl,
      images: [
        {
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await findCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const cardCheckoutReady = isCardCheckoutConfigured();
  const productPath = getProductUrl(product);
  const productUrl = `${siteUrl}${productPath}`;
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
  const productProcessVideo = getLicensedVideoAsset("filament-detail-loop");
  const [productSignals, storeSummary, reviewSnippets] = await Promise.all([
    getProductMarketplaceSignals(product.id, product.sku),
    getStoreReputationSummary(),
    getProductReviewSnippets(product.sku, 5),
  ]);
  const mediaRecord = validateProductMedia(product);
  const mediaIsPublicSafe = isPublicSafe(mediaRecord.status) && mediaRecord.gallery.length >= 1;
  const mediaIsVerifiedForSchema =
    (mediaRecord.status === 'verified' || mediaRecord.status === 'render-verified') && mediaRecord.gallery.length >= 1;
  const visualTrustCopy =
    mediaRecord.status === 'verified'
      ? {
          title: 'Mídia validada sinalizada',
          body: 'A galeria está classificada como mídia validada de peça física, com leitura clara antes da compra.',
        }
      : mediaRecord.status === 'render-verified'
        ? {
            title: 'Prévia técnica sinalizado',
            body: 'A galeria está classificada como prévia técnica derivado do modelo, separada de mídia validada.',
          }
        : {
            title: 'Imagem sinalizada',
            body: 'A página separa mídia conceitual de mídia validada e prévia técnica para não vender referência como prova física.',
          };
  const structuredDataImages = mediaIsVerifiedForSchema ? resolvedImages : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    url: productUrl,
    name: product.name,
    description: longDescription,
    image: structuredDataImages,
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
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: product.pricePix,
        priceCurrency: 'BRL',
        valueAddedTaxIncluded: true,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'BRL',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: product.readyToShip ? 2 : 5,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
      seller: {
        '@type': 'Organization',
        name: 'MDH 3D Store',
        url: siteUrl,
      },
      acceptedPaymentMethod: [
        { '@type': 'PaymentMethod', '@id': 'http://purl.org/goodrelations/v1#Cash' },
        { '@type': 'PaymentMethod', name: 'Pix' },
        ...(cardCheckoutReady ? [{ '@type': 'PaymentMethod', name: 'Cartão de Crédito' }] : []),
      ],
    },
    category: product.category,
    material: product.material,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Acabamento',
        value: product.finish,
      },
      {
        '@type': 'PropertyValue',
        name: 'Prazo de produção',
        value: product.productionWindow,
      },
      {
        '@type': 'PropertyValue',
        name: 'Personalização',
        value: product.customizable ? 'Aceita ajustes de cor, escala ou briefing' : 'Modelo fechado com acabamento padronizado',
      },
    ],
    ...(productSignals && productSignals.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: productSignals.averageRating,
        reviewCount: productSignals.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviewSnippets.length > 0 && {
      review: reviewSnippets.map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.authorName },
        datePublished: r.createdAt.slice(0, 10),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        ...(r.title && { name: r.title }),
        ...(r.body && { reviewBody: r.body }),
      })),
    }),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catálogo',
        item: `${siteUrl}/catalogo`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };
  const faqItems = [
    {
      question: `Como funciona a compra de ${product.name}?`,
      answer:
        product.pricingMode === 'faixa-auditada'
          ? `Esta peça já tem preço confirmado no Pix e pode seguir para checkout direto. Se você quiser validar cor, escala, acabamento ou prazo antes de pagar, a equipe confirma tudo pelo WhatsApp.`
          : `Esta peça funciona como referência comercial para orçamento inicial. A compra avança com briefing e validação de escala, cor, acabamento e prazo antes do fechamento.`,
    },
    {
      question: 'Qual é o prazo e o tipo de produção?',
      answer: product.readyToShip
        ? `Hoje o item aparece como pronta entrega ou produção rápida. A janela comercial informada é ${product.productionWindow}.`
        : `Hoje o item aparece como sob encomenda. A janela comercial informada é ${product.productionWindow}, ajustada conforme acabamento e personalização.`,
    },
    {
      question: 'Posso pedir alteração de cor, escala ou briefing?',
      answer: product.customizable
        ? 'Sim. Este produto aceita ajustes de cor, escala ou briefing e a rota principal para isso é o CTA de personalização na própria página.'
        : 'Este modelo está configurado como versão fechada. Se você precisa de algo próximo, mas não igual, vale abrir um pedido sob medida em vez de comprar e tentar adaptar depois.',
    },
    {
      question: 'A imagem desta página representa mídia validada ou referência visual?',
      answer: mediaIsPublicSafe
        ? 'As imagens públicas desta página passaram pela validação de mídia da loja e entram no fluxo visível de prova visual do produto.'
        : 'Quando a galeria pública não é segura o suficiente para prova visual, a página reduz o uso comercial dessas imagens e preserva a leitura honesta da vitrine.',
    },
  ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\nTenho interesse em ${product.name} (${product.sku}).`)}`;
  const customizationHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\nQuero personalizar ${product.name} (${product.sku}).`)}`;
  const primaryActionLabel = product.pricingMode === 'faixa-auditada' ? 'Comprar agora (Pix)' : 'Pedir orçamento';
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <ProductAnalytics
        product={{
          id: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          collection: product.collection,
          pricePix: product.pricePix,
        }}
      />
      <section className="pdp-visual-shell relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="mdh-cad-grid pointer-events-none absolute inset-x-4 top-0 -z-10 h-[520px] rounded-[8px] opacity-30" />
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
        <Link href="/" className="transition hover:text-cyan-100">Início</Link>
        <span>/</span>
        <Link href="/catalogo" className="transition hover:text-cyan-100">Catálogo</Link>
        <span>/</span>
        <span className="text-white/78">{product.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<Link href="/catalogo" className="btn-ghost-sm inline-flex">Voltar ao catálogo</Link>}>
          <ProductCatalogBackLink className="btn-ghost-sm inline-flex" />
        </Suspense>
        <div className="flex flex-wrap gap-2">
          <span className="chip-nav"><CopyPlus className="h-4 w-4" /> SKU {product.sku}</span>
          <ShareButton
            title={product.name}
            text={`Produto MDH 3D Store: ${product.name}`}
            className="chip-nav inline-flex items-center gap-1.5"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.78fr)]">
        <div className="space-y-6">
          <div className="mdh-pdp-gallery-shell p-3 md:p-4">
            <ProductImageGallery product={product} />
          </div>
          <PurchaseProtectionBanner summary={storeSummary} />
          <ProductModelPanel product={product} />
        </div>

        <div className="mdh-pdp-buybox p-5 md:p-7 lg:sticky lg:top-32 lg:self-start">
          <div className="flex flex-wrap gap-2">
            <span className="glass-chip">{product.category}</span>
            <span className="chip-nav">{product.subcategory}</span>
            <span className="chip-nav">{product.collection}</span>
            <span className="chip-nav">{product.readyToShip ? 'Pronta entrega' : 'Sob encomenda'}</span>
            <ProductVisualBadge product={product} />
          </div>
          <div className="mt-4">
            <ProductSocialProof
              productId={product.id}
              averageRating={productSignals?.averageRating ?? storeSummary?.averageRating ?? null}
              reviewCount={productSignals?.reviewCount ?? storeSummary?.reviewCount ?? 0}
              soldTotal={productSignals?.soldTotal}
              soldLast30Days={productSignals?.soldLast30Days}
              stockLevel={product.stock}
            />
          </div>
          <TrustBadges />
          <h1 className="mt-5 text-balance text-4xl font-black leading-[0.98] text-white md:text-6xl">{product.name}</h1>
          <p className="mt-4 text-base leading-8 text-white/70">{longDescription}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
                {highlight}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1.45fr_0.8fr]">
            <div className="rounded-[8px] border border-emerald-400/24 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(2,6,23,0.56))] p-5 shadow-[0_24px_70px_rgba(16,185,129,0.10)]">
              <ProductPriceStack product={product} label={priceLabel} showInstallments={cardCheckoutReady} />
            </div>
            <div className="rounded-[8px] border border-white/12 bg-white/[0.055] p-5">
              <p className="text-sm text-white/55">Prazo</p>
              <p className="mt-2 text-lg font-bold text-white">{product.printTime ?? product.productionWindow}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Produção</p>
              <p className="mt-2 font-semibold text-white">{product.readyToShip ? 'Pronta para produção rápida' : 'Feita sob encomenda'}</p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Personalização</p>
              <p className="mt-2 font-semibold text-white">{product.customizable ? 'Aceita ajustes de cor, escala ou briefing' : 'Modelo fechado com acabamento padronizado'}</p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
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

          <div className="mt-6 rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-sm text-cyan-50">
              <strong>Compra com clareza:</strong> se você quiser validar cor, escala, prazo ou acabamento antes de pagar, a equipe confirma tudo pelo WhatsApp.
            </p>
          </div>

          {idealFor.length > 0 ? (
            <div className="mt-6 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Este item funciona bem quando</p>
              <div className="mt-3 grid gap-3">
                {idealFor.map((item) => (
                  <div key={item} className="rounded-[8px] border border-white/10 bg-white/5 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
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
              <div key={label} className="rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                <p className="mt-2 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div id="pdp-purchase-tools" className="mt-6">
            <ProductPurchaseTools
              productId={product.id}
              productName={product.name}
              sku={product.sku}
              pricePix={product.pricePix}
              priceCard={product.priceCard}
              productionWindow={product.productionWindow}
              readyToShip={product.readyToShip ?? false}
              productImage={resolvedImage}
              material={product.material}
              colors={product.colors}
              customizable={product.customizable}
              whatsappHref={whatsappHref}
              customizationHref={customizationHref}
              cardCheckoutReady={cardCheckoutReady}
            />
            {product.stock <= 0 && (
              <div className="mt-4">
                <BackInStockButton productId={product.id} productName={product.name} />
              </div>
            )}
          </div>

          <div className="mt-6">
            <GuaranteeBar />
          </div>

          <div className="mt-6 rounded-[8px] border border-white/10 bg-black/20 p-4">
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
            <Link href="#pdp-purchase-tools" className="btn-primary">{primaryActionLabel}</Link>
            <a
              href={product.customizable ? customizationHref : whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              {product.customizable ? 'Personalizar via WhatsApp' : 'Falar no WhatsApp'}
            </a>
          </div>
        </div>
      </div>

      {/* Trust Section — Por que comprar na MDH3D? */}
      <div className="mt-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Por que comprar na MDH3D?</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { icon: ShieldCheck, title: "Garantia no produto", body: "Peça com defeito de impressão? Reenviamos sem custo." },
            { icon: Clock, title: "Produção local RJ", body: "Impresso e enviado direto do nosso estúdio no Rio de Janeiro." },
            { icon: Star, title: visualTrustCopy.title, body: visualTrustCopy.body },
            { icon: MessageCircle, title: "Suporte humano", body: "Atendimento via WhatsApp em horário comercial." },
          ] as const).map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
              <span className="inline-flex rounded-full border border-indigo-300/20 bg-indigo-300/10 p-2 text-indigo-200">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mdh-instrument-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">Mídia validada x prévia técnica</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white">A página não vende referência como se fosse prova física.</h2>
          <p className="mt-4 text-sm leading-7 text-white/65">{visualTrustCopy.body}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Mídia", visualTrustCopy.title],
            ["Material", product.material],
            ["Acabamento", product.finish],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">{label}</p>
              <p className="mt-2 text-lg font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative isolate mt-10 overflow-hidden rounded-[8px] border border-white/12 bg-slate-950 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.22)] md:p-8">
        <SafeBackgroundVideo
          src={productProcessVideo.src}
          poster={productProcessVideo.poster}
          overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.92),rgba(2,6,23,0.76)_48%,rgba(2,6,23,0.50)),linear-gradient(180deg,rgba(2,6,23,0.35),rgba(2,6,23,0.88))]"
        />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/75">Como é produzido</p>
          <h2 className="mt-3 text-3xl font-black text-white">Do filamento ao acabamento, este pedido segue uma rotina visível.</h2>
          <p className="mt-4 text-sm leading-7 text-white/72 md:text-base md:leading-8">
            Antes de embalar, a equipe revisa primeira camada, aderência, acabamento e leitura visual. Quando o item pede ajuste de cor, escala ou briefing, a validação acontece pelo atendimento antes do fechamento.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Primeira camada", "Acabamento", "Embalagem"].map((item) => (
              <span key={item} className="rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/82 backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12">
        <QuoteForm product={product} />
      </div>

      <div className="mt-12">
        <DeliveryCalculator />
      </div>

      <div className="mt-12">
        <ProductBundleSuggestion
          currentProduct={product}
          relatedProducts={catalog
            .filter((p) => (p.category === product.category || p.collection === product.collection) && p.id !== product.id && p.pricingMode === "faixa-auditada")
            .slice(0, 3)}
        />
      </div>

      <div className="mt-12">
        <ProductReviews productSlug={slug} productSku={product.sku} />
      </div>

      <div className="mt-12">
        <CommerceFaq
          eyebrow="FAQ do produto"
          title="As respostas que mais ajudam a tirar a compra do quase."
          description="Este bloco existe para reduzir a dúvida básica dentro do próprio PDP e manter a conversa comercial na mesma página."
          items={faqItems}
        />
      </div>

      <ProductRelatedShelf product={product} />

      <RecentlyViewedShelf
        currentProductId={product.id}
        catalog={featuredCatalog.map((p) => ({ id: p.id, slug: p.slug, name: p.name, pricePix: p.pricePix, images: p.images?.slice(0, 1) ?? [] }))}
      />

      <StickyPdpCta
        productId={product.id}
        productName={product.name}
        pricePix={product.pricePix}
        priceCard={product.priceCard}
        productImage={resolvedImage}
        sku={product.sku}
        checkoutHref="/checkout"
      />

    </section>
    </>
  );
}
