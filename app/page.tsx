import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MessageCircleMore, Search, ShoppingBag, Sparkles, UploadCloud } from "lucide-react";
import { CinematicVideoBackground } from "@/components/media/CinematicVideoBackground";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { getProductCardImage } from "@/lib/product-card-image";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "MDH 3D Store | Impressão 3D sob demanda",
  description: "Catálogo de produtos em impressão 3D para presentes, utilidades, decoração, setup e peças personalizadas.",
  alternates: { canonical: "/" },
};

const quickBlocks = [
  { label: "Produtos a partir de R$ 19,90", href: "/catalogo?maxPrice=29.90" },
  { label: "Chaveiros e presentes rápidos", href: "/catalogo?category=Chaveiros%20e%20Acess%C3%B3rios" },
  { label: "Utilidades para casa e setup", href: "/catalogo?category=Casa%20e%20Organiza%C3%A7%C3%A3o" },
  { label: "Geek e colecionáveis", href: "/catalogo?category=Geek%20%26%20Colecion%C3%A1veis" },
  { label: "Sob medida e lotes", href: "/imagem-para-impressao-3d" },
] as const;

function whatsappHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function productImage(product?: Product) {
  return getProductCardImage(product).src;
}

function shortText(product: Product) {
  const source = product.description || "Produto em impressão 3D para presente, uso ou decoração.";
  return source.length > 90 ? `${source.slice(0, 87).trim()}...` : source;
}

function HomeProductCard({ product, siteUrl }: { product: Product; siteUrl: string }) {
  const href = getProductUrl(product);
  const cardPrice = calculateCardPrice(product.pricePix);
  const productUrl = `${siteUrl}${href}`;
  const message = `Quero comprar ${product.name}. Quantidade: 1. Pix: ${formatCurrency(product.pricePix)}. Cartão: ${formatCurrency(cardPrice)}. Categoria: ${product.category}. Intenção: compra pela home. Link: ${productUrl}`;

  return (
    <article className="group overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] transition hover:border-emerald-300/30">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-black/25">
          <Image
            src={productImage(product)}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-3">
        <p className="line-clamp-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100/80">
          {product.category}
        </p>
        <Link href={href} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-white">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-white/58">{shortText(product)}</p>
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/42">Pix</p>
          <p className="text-xl font-black text-emerald-100">{formatCurrency(product.pricePix)}</p>
          <p className="mt-0.5 text-xs font-semibold text-white/58">Cartão {formatCurrency(cardPrice)}</p>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <Link href={href} className="btn-primary justify-center px-3 py-2 text-xs">
            Comprar
          </Link>
          <a
            href={whatsappHref(message)}
            target="_blank"
            rel="noreferrer"
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

function ProductRail({ title, href, products, siteUrl }: { title: string; href: string; products: Product[]; siteUrl: string }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Compra rápida</p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">{title}</h2>
        </div>
        <Link href={href} className="hidden items-center gap-2 text-sm font-bold text-emerald-100 hover:text-white sm:inline-flex">
          Ver mais <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <HomeProductCard key={product.id} product={product} siteUrl={siteUrl} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const available = catalog.filter((product) => product.pricePix > 0);
  const cheapest = [...available].sort((left, right) => left.pricePix - right.pricePix);
  const heroProduct = cheapest.find((product) => product.images?.length || product.image) || cheapest[0];
  const minPix = cheapest[0]?.pricePix ?? 19.9;
  const heroUrl = heroProduct ? getProductUrl(heroProduct) : "/catalogo";
  const heroWhatsapp = whatsappHref("Quero comprar pela MDH 3D. Vim pela home e quero ver produtos, Pix e cartão.");

  const entryProducts = cheapest.filter((product) => product.pricePix <= 29.9);
  const homeSetup = available.filter((product) => /casa|organiza|setup|office|suporte|organizador/i.test(`${product.category} ${product.name}`));
  const geek = available.filter((product) => /geek|colecion|anime|gamer|miniatura/i.test(`${product.category} ${product.name}`));
  const custom = available.filter((product) => product.customizable);

  return (
    <main className="min-h-screen bg-[#071016] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#071016]">
        <CinematicVideoBackground
          variant="home"
          overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.66)_48%,rgba(2,6,23,0.86)),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.95))]"
          objectPosition="center"
        />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-14 lg:pt-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Pix claro, cartão Pix + R$ 3,00
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl">
              Impressão 3D sob demanda para presentes, utilidades e peças personalizadas.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Escolha no catálogo, peça pelo WhatsApp ou envie sua ideia. Produção local com Pix, cartão e atendimento direto.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalogo" className="btn-primary justify-center gap-2 px-5 py-3">
                <Search className="h-4 w-4" />
                Ver catálogo
              </Link>
              <a href={heroWhatsapp} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2 px-5 py-3">
                <MessageCircleMore className="h-4 w-4" />
                Comprar pelo WhatsApp
              </a>
              <Link href="/imagem-para-impressao-3d" className="btn-secondary justify-center gap-2 px-5 py-3">
                <UploadCloud className="h-4 w-4" />
                Pedir peça personalizada
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">A partir de</p>
                <p className="mt-1 text-xl font-black text-emerald-100">{formatCurrency(minPix)}</p>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Produtos</p>
                <p className="mt-1 text-xl font-black text-white">{available.length}</p>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Pix</p>
                <p className="mt-1 text-xl font-black text-white">claro</p>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Cartão</p>
                <p className="mt-1 text-xl font-black text-white">+ R$ 3</p>
              </div>
            </div>
          </div>

          <Link href={heroUrl} className="group relative aspect-[4/3] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04] shadow-2xl">
            <Image
              src={productImage(heroProduct)}
              alt={heroProduct?.imageAlt || heroProduct?.name || "Imagem do produto MDH 3D"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {heroProduct ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-100">Produto em destaque</p>
                <p className="mt-1 line-clamp-1 text-lg font-black text-white">{heroProduct.name}</p>
                <p className="mt-1 text-sm text-white/75">Pix {formatCurrency(heroProduct.pricePix)} • Cartão {formatCurrency(calculateCardPrice(heroProduct.pricePix))}</p>
              </div>
            ) : null}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickBlocks.map((block) => (
            <Link key={block.label} href={block.href} className="flex min-h-24 items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-4 text-sm font-black text-white transition hover:border-emerald-300/30 hover:bg-emerald-300/10">
              <span>{block.label}</span>
              <ArrowRight className="h-4 w-4 text-emerald-100" />
            </Link>
          ))}
        </div>
      </section>

      <ProductRail title="Até R$ 29,90" href="/catalogo?maxPrice=29.90" products={entryProducts} siteUrl={siteUrl} />
      <ProductRail title="Casa, organização e setup" href="/catalogo?category=Casa%20e%20Organiza%C3%A7%C3%A3o" products={homeSetup} siteUrl={siteUrl} />
      <ProductRail title="Geek e colecionáveis" href="/catalogo?category=Geek%20%26%20Colecion%C3%A1veis" products={geek} siteUrl={siteUrl} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
              <a href={whatsappHref("Quero pedir uma peça personalizada na MDH 3D. Tenho uma ideia para orçamento.")} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2">
                <MessageCircleMore className="h-4 w-4" />
                Enviar ideia
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {custom.slice(0, 4).map((product) => (
              <HomeProductCard key={product.id} product={product} siteUrl={siteUrl} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
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
      </section>
    </main>
  );
}
