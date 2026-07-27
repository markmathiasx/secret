import Link from "next/link";
import type { Metadata } from "next";
import { Gamepad2, Instagram, MessageCircleMore, ShoppingBag, SlidersHorizontal, UploadCloud } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CinematicVideoBackground } from "@/components/media/CinematicVideoBackground";
import { StorefrontSearchBox } from "@/components/storefront-search-box";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { buildPublicCatalogStats } from "@/src/lib/catalog/stats";

export const metadata: Metadata = {
  title: "Catálogo MDH 3D",
  description: "Produtos em impressão 3D para presentear, organizar, decorar e personalizar, com preço Pix e cartão claros.",
  alternates: { canonical: "/catalogo" },
};

export const revalidate = 300;
export const dynamic = "force-static";

const priceStarts = [
  { label: "Até R$ 29,90", href: "/catalogo?max=29.90&sort=Preço" },
  { label: "Até R$ 49,90", href: "/catalogo?max=49.90&sort=Preço" },
  { label: "Até R$ 79,90", href: "/catalogo?max=79.90&sort=Preço" },
  { label: "Premium e sob medida", href: "/catalogo?min=99.90" },
] as const;

function whatsappHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default async function CatalogPage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const searchEntries = catalog.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    collection: product.collection,
    tags: product.tags,
    href: getProductUrl(product),
  }));
  const publicStats = buildPublicCatalogStats(catalog);
  const minPrice = publicStats.minPrice || 19.9;
  const quickProducts = catalog.filter((product) => product.pricePix <= 39.9 || product.readyToShip).length;
  const categoryLinks = [
    ...Array.from(new Set(catalog.map((product) => product.category))).map((category) => ({
      label: category,
      href: `/catalogo?category=${encodeURIComponent(category)}`,
    })),
    { label: "Personalizacao", href: "/catalogo?custom=1" },
    { label: "Brindes e lotes", href: "/brindes-e-lotes" },
  ].slice(0, 7);
  const whatsapp = whatsappHref("Quero ajuda para escolher no Catálogo MDH 3D. Quero ver Pix, cartão e prazo.");
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo MDH 3D", item: `${siteUrl}/catalogo` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#071016] pb-14 text-white" data-official-product-count={publicStats.activeProductCount}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#071016] px-4 pb-9 pt-10 sm:px-6 lg:pt-14">
        <CinematicVideoBackground
          variant="catalog"
          overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.70)_48%,rgba(2,6,23,0.86)),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.96))]"
          objectPosition="center"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="section-kicker">Loja online</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">Catálogo MDH 3D</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Produtos em impressão 3D para presentear, organizar, decorar e personalizar.
              </p>
              <div className="mt-7 max-w-3xl">
                <StorefrontSearchBox
                  products={searchEntries}
                  actionPath="/busca"
                  placeholder="Busque por chaveiro, suporte, organizador, nome 3D ou lote..."
                  quickQueries={["chaveiro personalizado", "organizador de mesa", "nome 3d", "luminaria personalizada"]}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/catalogo?custom=1" className="btn-secondary gap-2 px-4 py-2 text-sm">
                  <SlidersHorizontal className="h-4 w-4" /> Personalizáveis
                </Link>
                <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-whatsapp gap-2 px-4 py-2 text-sm">
                  <MessageCircleMore className="h-4 w-4" /> WhatsApp
                </a>
                <Link href="/imagem-para-impressao-3d" className="btn-secondary gap-2 px-4 py-2 text-sm">
                  <UploadCloud className="h-4 w-4" /> Peça personalizada
                </Link>
                <Link href="/jogue" className="btn-secondary gap-2 px-4 py-2 text-sm">
                  <Gamepad2 className="h-4 w-4" /> Jogue no site
                </Link>
                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-secondary gap-2 px-4 py-2 text-sm">
                  <Instagram className="h-4 w-4" /> @{brand.instagramHandle}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {[
                ["Produtos ativos", publicStats.activeProductCount.toLocaleString("pt-BR")],
                ["A partir de", formatCurrency(minPrice)],
                ["Personalizáveis", publicStats.customizableCount.toLocaleString("pt-BR")],
                ["Pronta entrega", publicStats.readyToShipCount.toLocaleString("pt-BR")],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/48">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-100" />
              <h2 className="font-black text-white">Comece pelo preço</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {priceStarts.map((item) => (
                <Link key={item.label} href={item.href} className="rounded-[8px] border border-white/10 bg-black/20 px-3 py-3 text-sm font-bold text-white/82 transition hover:border-emerald-300/30 hover:bg-emerald-300/10">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-100" />
              <h2 className="font-black text-white">Comprar por categoria</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryLinks.map((category) => (
                <Link key={category.href} href={category.href} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/76 transition hover:border-emerald-300/30 hover:text-white">
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link href="/catalogo?max=39.90&sort=Menor%20pre%C3%A7o" className="rounded-[8px] border border-emerald-300/18 bg-emerald-300/10 p-4 transition hover:bg-emerald-300/14">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-100/75">Compra rápida</p>
            <h2 className="mt-2 text-xl font-black text-white">Produtos com preço baixo e prazo curto</h2>
            <p className="mt-2 text-sm text-white/62">{quickProducts.toLocaleString("pt-BR")} itens para começar sem orçamento longo.</p>
          </Link>
          <Link href="/catalogo?custom=1" className="rounded-[8px] border border-cyan-300/16 bg-cyan-300/8 p-4 transition hover:bg-cyan-300/12">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-100/75">Personalizados</p>
            <h2 className="mt-2 text-xl font-black text-white">Nome, cor, tema ou ajuste</h2>
            <p className="mt-2 text-sm text-white/62">{publicStats.customizableCount.toLocaleString("pt-BR")} produtos aceitam personalização.</p>
          </Link>
        </div>
      </section>

      <section id="catalogo-vitrine" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-[8px] border border-white/10 bg-[#09121a] p-3 sm:p-4">
          <CatalogExplorer products={catalog} initialOrder="Preço" />
        </div>
      </section>
    </main>
  );
}
