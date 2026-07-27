import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowRight,
  Gamepad2,
  Instagram,
  MessageCircleMore,
  Search,
  ShoppingBag,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { HowItWorksSection } from "@/components/commerce/HowItWorksSection";
import { TrustProofSection } from "@/components/commerce/TrustProofSection";
import { WhatsAppQuoteCta } from "@/components/commerce/WhatsAppQuoteCta";
import { HomeCategoriesShowcase } from "@/components/home-categories-showcase";
import { HomeTestimonials } from "@/components/home-testimonials";
import { CinematicVideoBackground } from "@/components/media/CinematicVideoBackground";
import { Reveal } from "@/components/reveal";
import { SafeProductImage } from "@/components/safe-product-image";
import { RotatingProductHero, type RotatingHeroProduct } from "@/components/home/RotatingProductHero";
import { StorefrontSearchBox } from "@/components/storefront-search-box";
import { MagneticLink } from "@/components/ui/magnetic-link";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { buildUniqueHomeSections, getHomeDuplicateIds } from "@/lib/home-products";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { withProductPreviewCandidates } from "@/lib/product-image-variants";
import { PRODUCT_IMAGE_PLACEHOLDER, getProductImageAlt, getProductImageCandidates } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";
import { buildPublicCatalogStats } from "@/src/lib/catalog/stats";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "MDH 3D Store | Impressão 3D sob demanda",
  description: "Catálogo de produtos em impressão 3D para presentes, utilidades, decoração, setup e peças personalizadas.",
  alternates: { canonical: "/" },
};

const trustBar = [
  "Feito sob encomenda",
  "Impressão 3D personalizada",
  "Atendimento via WhatsApp",
  "Checkout externo quando disponível",
] as const;

function whatsappHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function productImageCandidates(product?: Product) {
  if (!product) return [PRODUCT_IMAGE_PLACEHOLDER];
  return withProductPreviewCandidates([...getProductImageCandidates(product), PRODUCT_IMAGE_PLACEHOLDER]);
}

function toRotatingHeroProducts(products: Product[]): RotatingHeroProduct[] {
  return products.map((product) => {
    const imageCandidates = productImageCandidates(product);
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      pricePix: product.pricePix,
      image: imageCandidates[0] || PRODUCT_IMAGE_PLACEHOLDER,
      imageCandidates,
      imageAlt: getProductImageAlt(product),
      href: getProductUrl(product),
      productionWindow: product.productionWindow,
      material: product.material,
    };
  });
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
      className="group overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-white/[0.065] hover:shadow-[0_18px_48px_rgba(2,8,23,0.42)]"
    >
      <Link href={href} prefetch={false} className="block">
        <div className="relative overflow-hidden bg-black/25" style={{ aspectRatio: "1 / 1" }}>
          <SafeProductImage
            candidates={imageCandidates}
            alt={getProductImageAlt(product)}
            priority={priority}
            fetchPriority={priority ? "high" : "low"}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">{product.productionWindow}</p>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <p className="line-clamp-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100/80">
          {product.category}
        </p>
        <Link href={href} prefetch={false} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-white">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-white/58">{shortText(product)}</p>
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/42">Pix</p>
          <p className="text-xl font-black text-emerald-100">{formatCurrency(product.pricePix)}</p>
          <p className="mt-0.5 text-xs font-semibold text-white/58">Cartão + R$ 1 {formatCurrency(cardPrice)}</p>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <Link href={href} prefetch={false} className="btn-primary justify-center px-3 py-2 text-xs">
            Comprar
          </Link>
          <a
            href={whatsappHref(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[8px] border border-emerald-300/25 bg-emerald-300/10 px-3 text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-300/15"
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
    <section id={id} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">{description}</p>
          </div>
          <Link href={href} prefetch={false} className="hidden items-center gap-2 text-sm font-bold text-emerald-100 hover:text-white sm:inline-flex">
            Ver mais <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
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
  const available = catalog.filter((product) => product.pricePix > 0);
  const searchEntries = available.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    collection: product.collection,
    tags: product.tags,
    href: getProductUrl(product),
  }));
  const publicStats = buildPublicCatalogStats(catalog);
  const minPix = [...available].sort((left, right) => left.pricePix - right.pricePix)[0]?.pricePix ?? 19.9;
  const quoteMessage = "Quero um orçamento na MDH 3D. Vim pela home e preciso de ajuda com produto, preço, prazo e personalização.";
  const sections = buildUniqueHomeSections(available);
  const duplicateIds = getHomeDuplicateIds(sections);

  return (
    <main className="min-h-screen bg-[#071016] text-white" data-home-duplicate-count={duplicateIds.length} data-official-product-count={publicStats.activeProductCount}>
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#071016]">
        <CinematicVideoBackground
          variant="home"
          overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.66)_48%,rgba(2,6,23,0.86)),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.95))]"
          objectPosition="center"
        />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-14 lg:pt-12">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-50">
                <Sparkles className="h-3.5 w-3.5" />
                Pix claro, cartão Pix + R$ 1,00
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl">
                Impressão 3D personalizada no Rio de Janeiro
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Chaveiros, presentes, organizadores, peças geek e projetos sob medida. Escolha um modelo ou mande sua ideia no WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={170}>
              <div className="mt-6 max-w-3xl">
                <StorefrontSearchBox
                  products={searchEntries}
                  actionPath="/busca"
                  placeholder="Busque por chaveiro, suporte, luminaria, nome 3D ou lote..."
                  quickQueries={["chaveiro personalizado", "brindes em lote", "nome 3d", "organizador de mesa"]}
                />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <MagneticLink href="#mais-pedidos" className="btn-primary justify-center gap-2 px-5 py-3">
                  <Search className="h-4 w-4" />
                  Ver mais pedidos
                </MagneticLink>
                <MagneticLink href={whatsappHref(quoteMessage)} external className="btn-whatsapp justify-center gap-2 px-5 py-3">
                  <MessageCircleMore className="h-4 w-4" />
                  Pedir personalização
                </MagneticLink>
                <MagneticLink href="/jogue" className="btn-secondary justify-center gap-2 px-5 py-3">
                  <Gamepad2 className="h-4 w-4" />
                  Jogue no site
                </MagneticLink>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">A partir de</p>
                  <p className="mt-1 text-xl font-black text-emerald-100">{formatCurrency(minPix)}</p>
                </div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Produtos</p>
                  <p className="mt-1 text-xl font-black text-white">{publicStats.activeProductCount}</p>
                </div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Cartão</p>
                  <p className="mt-1 text-xl font-black text-white">+ R$ 1</p>
                </div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Atendimento</p>
                  <p className="mt-1 text-xl font-black text-white">humano</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal direction="left" className="lg:pl-4">
            <RotatingProductHero products={toRotatingHeroProducts(sections.hero)} />
          </Reveal>
        </div>

        <div className="relative z-10 border-t border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {trustBar.map((item) => (
                <span key={item} className="rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-bold text-white/70">
                  {item}
                </span>
              ))}
            </div>
            <a href="#categorias" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-100">
              Explorar <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <Reveal>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/catalogo?custom=1" className="rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-4 transition hover:border-cyan-300/35 hover:bg-cyan-300/14">
              <p className="section-kicker">Personalizacao</p>
              <h2 className="mt-1 text-xl font-black text-white">Produtos com ajuste real de cor, nome, tema ou briefing</h2>
              <p className="mt-2 text-sm text-white/62">Entre pelo catalogo curado e siga para briefing ou checkout sem cair em SKU oculto.</p>
            </Link>
            <Link href="/brindes-e-lotes" className="rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-4 transition hover:border-emerald-300/35 hover:bg-emerald-300/14">
              <p className="section-kicker">B2B e lotes</p>
              <h2 className="mt-1 text-xl font-black text-white">Brindes, repeticao e tiragens sob capacidade real de producao</h2>
              <p className="mt-2 text-sm text-white/62">A vitrine abre a conversa e o atendimento fecha prazo, quantidade e impacto comercial.</p>
            </Link>
            <Link href="/imagem-para-impressao-3d" className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4 transition hover:border-white/20 hover:bg-white/[0.065]">
              <p className="section-kicker">Arquivo e briefing</p>
              <h2 className="mt-1 text-xl font-black text-white">Envie referencia, STL ou objetivo da peca sem fingir preview final</h2>
              <p className="mt-2 text-sm text-white/62">A analise humana continua sendo o ponto de aprovacao antes da producao.</p>
            </Link>
          </div>
        </Reveal>
      </section>

      <TrustProofSection />

      <div id="categorias">
        <HomeCategoriesShowcase catalogCount={publicStats.activeProductCount} />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <Reveal>
          <div className="grid gap-3 rounded-[8px] border border-white/10 bg-[linear-gradient(135deg,rgba(236,72,153,0.12),rgba(34,211,238,0.08))] p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div>
              <p className="section-kicker">Bastidores da impressão</p>
              <h2 className="mt-1 text-xl font-black text-white">Produtos prontos, testes e novidades no @{brand.instagramHandle}</h2>
            </div>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center gap-2">
              <Instagram className="h-4 w-4" />
              Ver bastidores no Instagram
            </a>
            <Link href="/jogue" className="btn-primary justify-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Print Quest
            </Link>
          </div>
        </Reveal>
      </section>

      <ProductRail
        id="mais-pedidos"
        kicker="Vitrine curada"
        title="Produtos em destaque"
        description="Seleção única da home: cada card aparece uma vez para evitar repetição visual e facilitar a decisão."
        href="/catalogo"
        products={sections.featured}
        siteUrl={siteUrl}
      />
      <ProductRail
        kicker="Entrada rápida"
        title="Ideias até R$ 50"
        description="Peças de entrada com Pix visível e cartão sempre calculado como Pix + R$ 1."
        href="/catalogo?max=50&sort=Preço"
        products={sections.entry}
        siteUrl={siteUrl}
      />
      <ProductRail
        kicker="Rotina e setup"
        title="Casa, organização e mesa"
        description="Suportes, organizadores e utilidades para resolver problemas pequenos com acabamento limpo."
        href="/catalogo?category=Setup%20e%20Home%20Office"
        products={sections.setup}
        siteUrl={siteUrl}
      />
      <ProductRail
        kicker="Presentes e identidade"
        title="Pecas personalizaveis e presentes com mais valor percebido"
        description="Selecao para quem quer nome, tema, litofania, luminaria ou ajuste visual antes de fechar."
        href="/catalogo?custom=1&intent=Presente"
        products={sections.geek}
        siteUrl={siteUrl}
      />

      <HowItWorksSection />
      <HomeTestimonials />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="section-kicker">Sob medida</p>
              <h2 className="text-3xl font-black text-white">Tem uma ideia, nome, cor, tema ou arquivo?</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/66">
                Envie o briefing pelo WhatsApp. A MDH confirma material, prazo, Pix e cartão antes de fechar.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/imagem-para-impressao-3d" className="btn-primary justify-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Pedir peça personalizada
                </Link>
                <a href={whatsappHref("Quero pedir uma peça personalizada na MDH 3D. Tenho uma ideia para orçamento.")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp justify-center gap-2">
                  <MessageCircleMore className="h-4 w-4" />
                  Enviar ideia
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sections.custom.map((product, index) => (
                <Reveal key={product.id} delay={index * 70}>
                  <HomeProductCard product={product} siteUrl={siteUrl} />
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Atendimento humano e FAQ curto</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">
                O bot ajuda a encontrar produto real, mas orçamento, urgência, lote e personalização sensível passam por uma pessoa da MDH 3D.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/atendimento" className="btn-primary justify-center gap-2">
                  <MessageCircleMore className="h-4 w-4" />
                  Abrir atendimento
                </Link>
                <WhatsAppQuoteCta
                  message="Quero atendimento humano na MDH 3D. Vim pela home e preciso confirmar produto, prazo e pagamento."
                  label="Chamar no WhatsApp"
                  className="btn-whatsapp justify-center gap-2 px-4 py-2"
                />
              </div>
            </div>
          </Reveal>
          <div className="grid gap-3">
            {[
              ["Qual é o preço no Pix?", "O Pix é o valor principal exibido no produto e no card."],
              ["Quanto fica no cartão?", "Cartão é sempre Pix + R$ 1,00 por item."],
              ["Posso personalizar?", "Quando o item permitir, confirme nome, cor, tema, quantidade e prazo pelo atendimento."],
              ["Qual o prazo?", "Cada produto mostra janela de produção; urgência precisa ser confirmada antes de fechar."],
            ].map(([question, answer], index) => (
              <Reveal key={question} delay={index * 60}>
                <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                  <h3 className="font-black text-white">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{answer}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <Reveal>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Checkout direto</p>
              <h2 className="mt-1 text-2xl font-black text-white">Carrinho, Pix, cartão e WhatsApp no mesmo fluxo.</h2>
            </div>
            <Link href="/catalogo" className="btn-primary mt-4 justify-center gap-2 sm:mt-0">
              <ShoppingBag className="h-4 w-4" />
              Começar compra
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
