import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Box, Clock3, Instagram, MessageCircleMore, UploadCloud } from "lucide-react";
import { HowItWorksSection } from "@/components/commerce/HowItWorksSection";
import { TrustProofSection } from "@/components/commerce/TrustProofSection";
import { HomeCategoriesShowcase } from "@/components/home-categories-showcase";
import { Reveal } from "@/components/reveal";
import { SafeProductImage } from "@/components/safe-product-image";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { buildUniqueHomeSections, getHomeDuplicateIds } from "@/lib/home-products";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { COMMERCIAL_STOREFRONT_IDS } from "@/lib/commercial-catalog-policy";
import { isDirectSaleCatalogProduct } from "@/lib/public-catalog";
import { PRODUCT_IMAGE_PLACEHOLDER, getProductImageAlt, getProductImageCandidates } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";
import { buildPublicCatalogStats } from "@/src/lib/catalog/stats";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "MDH 3D Store | Impressão 3D sob demanda",
  description: "Catálogo de produtos em impressão 3D para presentes, utilidades, decoração, setup e peças personalizadas.",
  alternates: { canonical: "/" },
};


const homeProductIds = new Set(COMMERCIAL_STOREFRONT_IDS);

function whatsappHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function productImageCandidates(product?: Product) {
  if (!product) return [PRODUCT_IMAGE_PLACEHOLDER];
  return [...getProductImageCandidates(product), PRODUCT_IMAGE_PLACEHOLDER];
}

function shortText(product: Product) {
  const source = product.description || "Produto em impressão 3D para presente, uso ou decoração.";
  return source.length > 96 ? `${source.slice(0, 93).trim()}...` : source;
}

function HomeProductCard({ product, siteUrl, priority = false }: { product: Product; siteUrl: string; priority?: boolean }) {
  const href = getProductUrl(product);
  const cardPrice = calculateCardPrice(product.pricePix);
  const productUrl = `${siteUrl}${href}`;
  const message = `Quero comprar ${product.name}. Quantidade: 1. Pix: ${formatCurrency(product.pricePix)}. Cartão + R$ 1: ${formatCurrency(cardPrice)}. Categoria: ${product.category}. Link: ${productUrl}`;
  const imageCandidates = productImageCandidates(product);

  return (
    <article
      data-product-id={product.id}
      className="experience-home-product group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.065]"
    >
      <Link href={href} prefetch={false} className="block">
        <div className="relative overflow-hidden bg-[#e7e9ed]" style={{ aspectRatio: "1 / 1" }}>
          <SafeProductImage
            candidates={imageCandidates}
            alt={getProductImageAlt(product)}
            priority={priority}
            fetchPriority={priority ? "high" : "low"}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px"
            className="absolute inset-0 h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">{product.productionWindow}</p>
          </div>
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <p className="experience-home-product-category line-clamp-1 text-[11px] font-bold uppercase tracking-[0.12em]">
          {product.category}
        </p>
        <Link href={href} prefetch={false} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-12 text-base font-black leading-6 tracking-[-0.015em] text-white">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-white/58">{shortText(product)}</p>
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/42">Pix</p>
          <p className="text-xl font-semibold text-white">{formatCurrency(product.pricePix)}</p>
          <p className="mt-0.5 text-xs text-slate-300">ou {formatCurrency(cardPrice)} no cartão</p>
          <p className="mt-2 text-xs text-slate-300">Produção: {product.productionWindow}</p>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <Link href={href} prefetch={false} className="btn-primary justify-center px-3 py-2 text-xs">
            Comprar
          </Link>
          <a
            href={whatsappHref(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="experience-home-whatsapp inline-flex items-center justify-center rounded-xl px-3 transition"
            aria-label={`Comprar ${product.name} pelo WhatsApp`}
          >
            <MessageCircleMore className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

function ProductRail({
  id,
  kicker,
  title,
  description,
  href,
  products,
  siteUrl,
}: {
  id?: string;
  kicker: string;
  title: string;
  description: string;
  href: string;
  products: Product[];
  siteUrl: string;
}) {
  if (!products.length) return null;

  return (
    <section id={id} className="experience-container py-12 lg:py-16">
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 className="text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">{description}</p>
          </div>
          <Link href={href} prefetch={false} className="experience-gold-link hidden items-center gap-2 text-sm font-bold hover:text-white sm:inline-flex">
            Ver mais <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * 45}>
            <HomeProductCard product={product} siteUrl={siteUrl} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const available = catalog.filter(isDirectSaleCatalogProduct).filter((product) => homeProductIds.has(product.id));
  const sections = buildUniqueHomeSections(available);
  const publicStats = buildPublicCatalogStats(catalog);
  const hero = sections.hero[0];
  const featured = [...sections.hero.slice(1), ...sections.featured, ...sections.entry, ...sections.setup, ...sections.geek, ...sections.custom];
  const duplicateIds = getHomeDuplicateIds(sections);
  const entryPixPrice = available.length ? Math.min(...available.map((product) => product.pricePix)) : null;

  return (
    <div className="experience-home" data-home-duplicate-count={duplicateIds.length} data-official-product-count={publicStats.activeProductCount}>
      <section className="experience-container experience-hero" aria-labelledby="home-title">
        <div>
          <p className="experience-eyebrow">Engenharia criativa · Impressão 3D</p>
          <h1 id="home-title">Dê forma ao<br /><span>extraordinário.</span></h1>
          <p className="experience-hero-copy">Objetos autorais para colecionar, presentear e transformar o seu universo. Produção 3D sob encomenda com transparência em cada etapa.</p>
          <div className="experience-hero-actions">
            <Link href="/catalogo" className="btn-primary gap-3">Encontrar minha peça <ArrowRight size={17} /></Link>
            <Link href="/sob-medida" className="btn-secondary">Criar algo meu</Link>
          </div>
          <div className="experience-hero-note">
            {entryPixPrice !== null ? <span>Seleção a partir de {formatCurrency(entryPixPrice)}</span> : null}
            <span>Produção no Rio de Janeiro</span>
          </div>
        </div>
        {hero ? (
          <article className="experience-hero-display" data-product-id={hero.id}>
            <Link className="experience-hero-image" href={getProductUrl(hero)} aria-label={hero.name}>
              <SafeProductImage candidates={productImageCandidates(hero)} alt={getProductImageAlt(hero)} priority fetchPriority="high" sizes="(max-width: 620px) 95vw, 45vw" className="absolute inset-0 h-full w-full object-contain" />
            </Link>
            <div className="experience-hero-caption">
              <div><p className="section-kicker">Uma peça, muitas possibilidades</p><h2><Link href={getProductUrl(hero)}>{hero.name}</Link></h2><p>Produção: {hero.productionWindow}</p></div>
              <div className="experience-hero-price"><p>No Pix</p><strong>{formatCurrency(hero.pricePix)}</strong><p>{formatCurrency(calculateCardPrice(hero.pricePix))} no cartão</p></div>
            </div>
          </article>
        ) : null}
      </section>
      <section className="experience-container experience-benefits" aria-label="Antes de comprar">
        <article><Box size={23} /><div><h2>Feito para o seu pedido</h2><p>Confira material, tamanho e opções em cada peça.</p></div></article>
        <article><Clock3 size={23} /><div><h2>Prazo explicado</h2><p>Produção e entrega são etapas diferentes.</p></div></article>
        <article><MessageCircleMore size={23} /><div><h2>Uma conversa resolve</h2><p><a href={whatsappHref("Olá! Preciso de ajuda para escolher uma peça na MDH 3D.")}>Fale com a equipe antes de escolher →</a></p></div></article>
      </section>
      <HomeCategoriesShowcase catalogCount={publicStats.activeProductCount} />
      <ProductRail id="mais-pedidos" kicker="Escolhidos para o seu dia" title="Detalhes que fazem diferença." description="Conheça as peças, compare os tamanhos e escolha o acabamento que combina com você." href="/catalogo" products={featured} siteUrl={siteUrl} />
      <section className="experience-container py-8" id="sob-medida">
        <div className="experience-custom">
          <div><p className="section-kicker">Do seu jeito</p><h2>A próxima peça pode começar com uma ideia sua.</h2><p>Tem um nome, uma referência ou um arquivo 3D? Conte o que você precisa. Combinamos as medidas, o material e o prazo antes de produzir.</p><Link href="/sob-medida" className="btn-primary gap-3">Pedir peça sob medida <UploadCloud size={18} /></Link><p className="!mb-0 !text-sm">Precisa de quantidade? <Link href="/brindes-e-lotes" className="underline underline-offset-4">Conheça brindes e lotes.</Link></p></div>
          <ol>
            <li><span>01</span><div><strong>Conte sua ideia</strong><br />Envie referência, medidas e como pretende usar.</div></li>
            <li><span>02</span><div><strong>Confirme os detalhes</strong><br />Você recebe o orçamento e aprova o que será feito.</div></li>
            <li><span>03</span><div><strong>Acompanhe a criação</strong><br />A equipe orienta a produção, a retirada ou o envio.</div></li>
          </ol>
        </div>
      </section>
      <HowItWorksSection />
      <TrustProofSection />
      <section className="experience-container py-12">
        <div className="experience-section-heading"><div><p className="section-kicker">Por trás de cada camada</p><h2>Conheça quem faz.</h2><p>Peças, processos e novidades da MDH. Veja nosso trabalho e converse com a equipe pelo Instagram.</p></div><a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-2"><Instagram size={18} />@{brand.instagramHandle}</a></div>
      </section>
      <section className="experience-container experience-faq">
        <div><p className="section-kicker">Pode perguntar</p><h2>Escolher bem começa sem dúvidas.</h2><p>Você não precisa entender de impressão 3D. Conte o que procura e ajudamos a encontrar uma opção.</p><Link href="/atendimento" className="btn-secondary">Atendimento humano <ArrowRight size={16} className="ml-2" /></Link></div>
        <div>
          {[
            ["Como escolher o tamanho e o material?", "As páginas dos produtos trazem as medidas e o material. Se a peça precisar encaixar em algo, confirme as medidas com a equipe antes de comprar."],
            ["Posso mudar a cor ou colocar um nome?", "Nos itens personalizáveis, confirme as opções e envie a referência. Alterações de tamanho ou projeto precisam de orçamento e aprovação antes da produção."],
            ["Quanto vou pagar?", "O preço no Pix aparece em cada produto. No cartão há acréscimo de R$ 1 por item. Frete e detalhes do pedido são informados antes da confirmação."],
            ["Quando minha peça fica pronta?", "Cada produto informa seu prazo de produção. O transporte tem prazo próprio, conforme destino e serviço. Para urgências, consulte a equipe antes de fechar."],
            ["Como acompanho ou resolvo um problema?", "Use Acompanhar pedido ou sua conta. Para dúvidas, trocas e pós-venda, nossos contatos e políticas ficam disponíveis no rodapé."],
          ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div>
      </section>
    </div>
  );
}
