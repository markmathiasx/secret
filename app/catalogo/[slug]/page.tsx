import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Boxes, ChevronRight, CircleDollarSign, Clock3, PackageCheck, ShieldCheck, Star, Tag, Truck, Wrench } from "lucide-react";
import { Metadata } from "next";
import { catalog, findProductBySlug, getProductUrl } from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";
import { CopyButton } from "@/components/copy-button";
import { ProductMobileStickyBar } from "@/components/product-mobile-sticky-bar";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { QuoteForm } from "@/components/quote-form";
import { RecentlyViewedTracker } from "@/components/recently-viewed-tracker";
import { ProductActions } from "@/components/product-actions";
import { ProductShelf } from "@/components/product-shelf";
import { ShareButton } from "@/components/share-button";
import { deliveryZones, faqItems, whatsappMessage, whatsappNumber } from "@/lib/constants";
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
  const relatedProducts = catalog
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.theme === product.theme || item.collection === product.collection || item.category === product.category)
    )
    .slice(0, 3);
  const secondaryRelatedProducts = catalog
    .filter(
      (item) =>
        item.id !== product.id &&
        item.material === product.material &&
        item.collection !== product.collection &&
        item.theme !== product.theme
    )
    .slice(0, 4);
  const visualLabel = product.realPhoto ? "Foto real" : "Imagem conceitual";
  const visualDescription = product.realPhoto
    ? "A galeria principal mostra uma foto real da peça produzida."
    : "A galeria principal mostra uma imagem conceitual de referência; a peça final segue o título, briefing e especificações do anúncio.";
  const pixSavings = product.priceCard - product.pricePix;
  const installmentOptions = [3, 6, 12]
    .filter((count) => count <= product.parcelamentoMax)
    .map((count) => ({
      count,
      value: formatCurrency(product.priceCard / count),
    }));
  const supportLinks = [
    { href: "/suporte/envio", label: "Entrega e frete", helper: "Consulte janelas e regiões atendidas" },
    { href: "/trocas-e-devolucoes", label: "Trocas e devoluções", helper: "Entenda o fluxo de arrependimento e troca" },
    { href: "/faq", label: "FAQ", helper: "Veja respostas rápidas antes de falar com o suporte" },
    { href: "/politica-de-privacidade", label: "Privacidade e LGPD", helper: "Regras de dados e contato da operação" },
  ];
  const catalogLinks = [
    { href: `/catalogo?q=${encodeURIComponent(product.theme)}`, label: `Mais de ${product.theme}` },
    { href: `/catalogo?collection=${encodeURIComponent(product.collection)}`, label: `Mais da coleção ${product.collection}` },
    { href: `/catalogo?material=${encodeURIComponent(product.material)}`, label: `Mais em ${product.material}` },
    { href: `/catalogo?category=${encodeURIComponent(product.category)}`, label: `Mais de ${product.category}` },
  ];
  const decisionCards = [
    {
      icon: <BadgeCheck className="h-4 w-4" />,
      label: "Leitura principal",
      value: product.realPhoto ? "Produto com prova visual real" : "Produto com referência conceitual explícita",
      helper: "A vitrine não mistura foto real com imagem conceitual sem aviso.",
    },
    {
      icon: <Truck className="h-4 w-4" />,
      label: "Ritmo de fechamento",
      value: product.status === "Pronta entrega" ? "Fechamento mais curto" : "Fechamento com produção sob curadoria",
      helper: `${product.productionWindow} • lead time técnico de ${product.leadTimeDays} dia(s).`,
    },
    {
      icon: <Boxes className="h-4 w-4" />,
      label: "Personalização",
      value: product.customizable ? "Aceita briefing" : "Segue especificação do anúncio",
      helper: product.customizable
        ? "Ideal quando o cliente quer ajustar cor, nome, detalhe ou acabamento."
        : "Mais indicado quando a prioridade é velocidade e previsibilidade.",
    },
    {
      icon: <Wrench className="h-4 w-4" />,
      label: "Escopo técnico",
      value: product.technical.componentScope,
      helper: "Bom para entender rapidamente em que família do catálogo este item se encaixa.",
    },
  ];
  const technicalSummary = [
    `Produto: ${product.name}`,
    `SKU: ${product.sku}`,
    product.technical.partNumber ? `PN: ${product.technical.partNumber}` : null,
    `Categoria: ${product.category}`,
    `Tipo técnico: ${product.technical.typeProduct}`,
    `Material: ${product.material}`,
    `Acabamento: ${product.finish}`,
    `Compatibilidade: ${product.technical.compatibilityModels.join(" / ")}`,
    `Preço Pix: ${formatCurrency(product.pricePix)}`,
    `Prazo: ${product.productionWindow}`,
    `Status: ${product.status}`,
  ]
    .filter(Boolean)
    .join("\n");
  const sectionAnchors = [
    { href: "#galeria", label: "Galeria" },
    { href: "#preco", label: "Preço" },
    { href: "#tecnica", label: "Técnica" },
    { href: "#faq", label: "FAQ" },
    { href: "#orcamento", label: "Orçamento" },
  ];

  return (
    <>
      <RecentlyViewedTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Link href="/" className="transition hover:text-slate-900">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/catalogo" className="transition hover:text-slate-900">
            Catálogo
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/catalogo?category=${encodeURIComponent(product.category)}`} className="transition hover:text-slate-900">
            {product.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-700">{product.name}</span>
        </nav>

        <Link href="/catalogo" className="inline-flex items-center gap-2 rounded-full border border-[#e6d5bf] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff8ef]">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catalogo
        </Link>

        <div className="mt-4 flex flex-wrap gap-2">
          {sectionAnchors.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div id="galeria" className="scroll-mt-28">
            <ProductImageGallery product={product} />
          </div>

          <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff8ef] p-6 text-slate-900 shadow-[0_26px_70px_rgba(15,23,42,0.10)] md:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{product.category}</span>
              <span className="rounded-full bg-[#e8f4ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{product.technical.typeProduct}</span>
              <span className="rounded-full bg-[#eef7ec] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{product.status}</span>
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  product.realPhoto ? "bg-[#fff0da] text-orange-700" : "bg-[#efe9ff] text-violet-700"
                }`}
              >
                {visualLabel}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 md:text-5xl">{product.name}</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">{product.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <FavoriteButton productId={product.id} label={product.name} showLabel className="h-auto w-auto gap-2 px-4 py-2" />
              <ShareButton url={productUrl} title={product.name} text={`Olha esse produto da MDH 3D: ${product.name}`} />
              <CopyButton value={product.sku} label="Copiar SKU" />
              {product.technical.partNumber ? <CopyButton value={product.technical.partNumber} label="Copiar PN" /> : null}
              <CopyButton value={technicalSummary} label="Copiar resumo técnico" />
            </div>

            <div className="mt-5 rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prova visual</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{visualLabel}</p>
                  <p className="mt-1 text-sm text-slate-600">{visualDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8ef] px-3 py-2 text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                    {product.rating.toFixed(1)} ({product.reviewCount})
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8ef] px-3 py-2 text-slate-700">
                    <Clock3 className="h-3.5 w-3.5" />
                    {product.leadTimeDays} dia(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">SKU / PN / Compatibilidade</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {product.sku} {product.technical.partNumber ? `| ${product.technical.partNumber}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-600">{product.technical.compatibilityModels.join(" / ")} (verificado)</p>
            </div>

            <div id="preco" className="mt-6 grid scroll-mt-28 gap-4 sm:grid-cols-4">
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
              <div className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
                <p className="text-sm text-slate-500">Economia no Pix</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatCurrency(pixSavings)}</p>
              </div>
            </div>

            {installmentOptions.length ? (
              <div className="mt-5 rounded-[24px] border border-[#ead8c1] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Simulação rápida de parcelamento</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {installmentOptions.map((item) => (
                    <div key={item.count} className="rounded-[20px] border border-[#eadcc8] bg-[#fff8ef] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.count}x no cartão</p>
                      <p className="mt-2 text-xl font-black text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Leitura comercial rápida: Pix economiza {formatCurrency(pixSavings)} frente ao preço total no cartão.
                </p>
              </div>
            ) : null}

            <div id="tecnica" className="mt-6 grid scroll-mt-28 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Material" value={product.material} />
              <InfoCard label="Acabamento" value={product.finish} />
              <InfoCard label="Peso" value={product.plaWeight ?? `${product.grams} g`} />
              <InfoCard label="Dimensoes" value={product.dimensions} />
              <InfoCard label="Fornecedor" value={product.technical.supplierType} />
              <InfoCard label="Originalidade" value={product.technical.originalityLevel} />
              <InfoCard label="Colecao" value={product.collection} />
              <InfoCard label="Parcelamento" value={`${product.parcelamentoMax}x`} />
              <InfoCard label="Escopo tecnico" value={product.technical.componentScope} />
            </div>

            <div className="mt-6 rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tags de navegacao</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.slice(0, 8).map((tag) => (
                  <Link
                    key={tag}
                    href={`/catalogo?q=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ead8c1] bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                  </Link>
                ))}
              </div>
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

            <div className="mt-6 rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ideal para</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {decisionCards.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {item.icon}
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-black text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Continue a navegação por afinidade</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {catalogLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
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

        {(product.technical.toolsRequired?.length || product.technical.crossRefSkus?.length || product.technical.cadFiles?.length) ? (
          <section className="mt-8 grid gap-5 xl:grid-cols-3">
            {product.technical.toolsRequired?.length ? (
              <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
                <h2 className="text-xl font-black text-slate-900">Ferramentas necessárias</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.technical.toolsRequired.map((item) => (
                    <span key={item} className="rounded-full bg-[#fff8ef] px-3 py-2 text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {product.technical.crossRefSkus?.length ? (
              <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
                <h2 className="text-xl font-black text-slate-900">SKUs relacionados</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.technical.crossRefSkus.map((item) => (
                    <span key={item} className="rounded-full bg-[#fff8ef] px-3 py-2 text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {product.technical.cadFiles?.length ? (
              <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
                <h2 className="text-xl font-black text-slate-900">Arquivos técnicos</h2>
                <div className="mt-4 grid gap-2">
                  {product.technical.cadFiles.map((item) => (
                    <a key={item} href={item} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-slate-700">
                      {item.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fluxo comercial</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Como esse item costuma ser fechado</h2>
            <div className="mt-5 grid gap-3">
              {[
                "1. Escolha a prova visual certa: foto real ou referência conceitual.",
                "2. Confirme coleção, material, acabamento e prazo comercial.",
                "3. Salve nos favoritos ou compare com itens parecidos.",
                "4. Feche pelo checkout ou mande o SKU no WhatsApp para atendimento humano.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Entrega no Rio</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Referência rápida de prazo local</h2>
            <div className="mt-5 grid gap-3">
              {deliveryZones.map((zone) => (
                <div key={zone.region} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
                  <p className="font-semibold text-slate-900">{zone.region}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Frete a partir de {formatCurrency(zone.fee)} • prazo {zone.eta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-4">
          {supportLinks.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[28px] border border-[#e8dac7] bg-white p-5 transition hover:-translate-y-0.5">
              <p className="text-lg font-black text-slate-900">{item.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.helper}</p>
            </Link>
          ))}
        </section>

        <section id="faq" className="mt-8 scroll-mt-28 rounded-[32px] border border-[#e8dac7] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Perguntas frequentes</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">O que normalmente perguntam antes de comprar</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {faqItems.slice(0, 4).map((item) => (
              <div key={item.question} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
                <p className="font-semibold text-slate-900">{item.question}</p>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="mt-8 rounded-[32px] border border-[#e8dac7] bg-white p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Continuar navegando</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Itens relacionados à mesma linha</h2>
              </div>
              <Link href="/catalogo" className="rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
                Ver todo o catalogo
              </Link>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={getProductUrl(item)} className="rounded-[28px] border border-[#eadcc8] bg-[#fff8ef] p-4 transition-transform duration-300 hover:-translate-y-1">
                  <ProductImageGallery product={item} compact />
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.collection}</p>
                  <h3 className="mt-2 text-lg font-black text-slate-900">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{formatCurrency(item.pricePix)} no Pix</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {secondaryRelatedProducts.length ? (
          <div className="mt-8">
            <ProductShelf
              title="Mais itens com o mesmo material"
              description="Bom para continuar a exploração mantendo textura, acabamento e leitura de fabricação próximos do item atual."
              products={secondaryRelatedProducts}
              href="/catalogo"
              hrefLabel="Voltar ao catálogo"
              variant="recent"
            />
          </div>
        ) : null}

        <div id="orcamento" className="mt-12 scroll-mt-28 rounded-[36px] border border-[#e8dac7] bg-slate-950 p-4 shadow-[0_26px_70px_rgba(2,8,23,0.28)] md:p-6">
          <QuoteForm product={product} />
        </div>
      </section>

      <ProductMobileStickyBar
        checkoutHref="/checkout"
        whatsappHref={whatsappHref}
        pricePix={product.pricePix}
        installmentText={`${product.parcelamentoMax}x de ${formatCurrency(product.priceCard / product.parcelamentoMax)}`}
      />
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
