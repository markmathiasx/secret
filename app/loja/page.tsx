import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MessageCircleMore, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { SmartStorefront } from "@/components/mdh-store/SmartStorefront";
import { getStorefrontWhatsappNumber } from "@/lib/mdh-store/config";
import { getLocalStoreCategories, getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Loja inteligente MDH3D",
  description: "Vitrine de produtos MDH3D em impressão 3D com compra por Nuvemshop quando disponível e orçamento pelo WhatsApp como fallback.",
  alternates: { canonical: "/loja" },
};

const trustBadges = [
  { label: "Feito sob encomenda", icon: Sparkles },
  { label: "Impressão 3D personalizada", icon: BadgeCheck },
  { label: "Atendimento via WhatsApp", icon: MessageCircleMore },
  { label: "Compra segura via checkout externo quando houver link Nuvemshop", icon: ShieldCheck },
] as const;

const commercialBanners = [
  { title: "Presentes personalizados", text: "Peças com nome, tema, cor e briefing rápido pelo WhatsApp.", href: "/loja" },
  { title: "Setup gamer", text: "Suportes, organizadores e decoração para mesa e controle.", href: "/loja" },
  { title: "Casa organizada", text: "Utilidades compactas para cabos, bancada, nichos e cantinhos.", href: "/loja" },
  { title: "Peças sob medida", text: "Envie referência, STL ou medidas e receba estimativa inicial.", href: "/orcamento-personalizado" },
] as const;

export default function LojaPage() {
  const products = getLocalStoreProducts();
  const categories = getLocalStoreCategories(products);
  const whatsappNumber = getStorefrontWhatsappNumber();
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Loja inteligente MDH3D",
    url: `${siteUrl}/loja`,
    hasPart: products.slice(0, 12).map((product) => ({
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      url: `${siteUrl}/produto/${product.slug}`,
      offers: {
        "@type": "Offer",
        price: product.pixPrice,
        priceCurrency: "BRL",
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#071016] pb-14 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_12%_10%,rgba(34,211,238,0.18),transparent_30%),linear-gradient(180deg,#071016,#09131b)] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <div>
              <p className="section-kicker">Loja inteligente</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
                MDH3D com checkout externo ou WhatsApp automático
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Produtos locais carregados do CSV da loja. Quando houver link Nuvemshop, o botão abre o checkout; quando não houver, o orçamento vai pronto para o WhatsApp.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="#produtos" className="btn-primary gap-2 px-5 py-3">
                  <ShoppingBag className="h-4 w-4" /> Ver produtos
                </a>
                <Link href="/comprar-na-mdh3d" className="btn-secondary gap-2 px-5 py-3">
                  Como comprar
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4">
                  <badge.icon className="h-5 w-5 text-cyan-100" />
                  <p className="mt-3 text-sm font-black leading-5 text-white">{badge.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-6 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
        {commercialBanners.map((banner) => (
          <Link key={banner.title} href={banner.href} className="group rounded-[8px] border border-white/10 bg-white/[0.045] p-5 transition hover:border-cyan-200/30 hover:bg-white/[0.065]">
            <p className="text-lg font-black text-white">{banner.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{banner.text}</p>
            <span className="mt-4 inline-flex text-sm font-black text-cyan-100 underline-offset-4 group-hover:underline">Explorar</span>
          </Link>
        ))}
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SmartStorefront products={products} categories={categories} whatsappNumber={whatsappNumber} siteUrl={siteUrl} />
      </section>
    </main>
  );
}
