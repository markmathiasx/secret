<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageEvent } from "@/components/analytics-page-event";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { categories } from "@/lib/catalog";
import { brand, homepageCollections, socialLinks, whatsappNumber } from "@/lib/constants";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";
import { getCategorySlug } from "@/lib/seo-content";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { getCatalogStats, listFeaturedProducts } from "@/lib/catalog-server";

export const metadata: Metadata = {
  title: "Loja premium de impressões 3D no Rio de Janeiro",
  description:
    "Compre pecas 3D da MDH 3D com curadoria geek, decoracao, setup, personalizados, Pix e atendimento rapido pelo WhatsApp.",
  alternates: {
    canonical: `${getSiteUrl()}/`
  },
  openGraph: {
    title: "MDH 3D | Loja premium de impressões 3D",
    description:
      "Curadoria de pecas 3D para presentes, setup, decoracao e personalizados com Pix e atendimento rapido.",
    url: getSiteUrl(),
    images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Loja premium de impressões 3D",
    description: "Curadoria de pecas 3D, Pix com melhor valor e atendimento rapido no WhatsApp.",
    images: [getAbsoluteUrl("/logo-mdh.jpg")]
  }
};

export default async function HomePage() {
  const [featuredProducts, stats] = await Promise.all([listFeaturedProducts(), getCatalogStats()]);
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, "Oi! Vim pela home da MDH 3D e quero atendimento para comprar.");
  const highlightCategories = [
    {
      title: "Geek, anime e presentes criativos",
      description: "Escolhas que transformam presente, estante e quarto em algo mais marcante logo no primeiro olhar.",
      href: "/catalogo?q=anime",
      accent: "from-cyan-400/20 to-violet-400/20"
    },
    {
      title: "Setup com personalidade e utilidades",
      description: "Suportes, docks e organizadores que deixam a mesa mais bonita, funcional e com cara de setup bem resolvido.",
      href: "/catalogo?q=suporte",
      accent: "from-emerald-400/18 to-cyan-400/16"
    },
    {
      title: "Casa, decoracao e personalizados",
      description: "Pecas sob medida para decorar, presentear e destacar ambientes com mais identidade e acabamento premium.",
      href: "/catalogo?q=personalizado",
      accent: "from-amber-300/18 to-rose-300/12"
    }
  ];
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
=======
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
>>>>>>> theirs
import { QuoteForm } from "@/components/quote-form";
import { featuredCatalog } from "@/lib/catalog";
import { homepageCollections, socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/browser";

const sectionCards = [
  { title: "Sob encomenda", text: "Projetos com briefing completo de material, escala e acabamento para peças únicas." },
  { title: "Personalizados", text: "Nomes, logos, brindes e itens especiais com foco em presente, setup e marca." },
  { title: "Materiais e acabamentos", text: "PLA premium, controle de qualidade e revisão visual antes de liberar para entrega." },
  { title: "Entrega local e prazos", text: "Operação no RJ com janela combinada e suporte direto no WhatsApp." }
];

const processSteps = [
  { title: "1. Briefing e validação", text: "Você define referência, cor, uso e prazo. Nossa equipe confirma viabilidade e custo." },
  { title: "2. Produção própria", text: "Impressão em equipamento calibrado, com monitoramento técnico e acabamento dedicado." },
  { title: "3. Revisão e entrega", text: "Conferência final, embalagem segura e envio local com confirmação de recebimento." }
];

export default function HomePage() {
  const formProduct = featuredCatalog[0];
  const [name, setName] = useState<string | null>(null);
  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  useEffect(() => {
    const client = supabaseBrowser;
    if (!client) return;
    client.auth.getUser().then(({ data }) => {
      const label = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || data.user?.email?.split("@")[0] || null;
      setName(label);

      if (data.user?.id) {
        client.from("profiles").upsert({ id: data.user.id, email: data.user.email, full_name: label }, { onConflict: "id" });
      }
    });
  }, []);
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

  return (
    <div>
      <AnalyticsPageEvent eventName="view_home" payload={{ featuredCount: featuredProducts.length }} />
      <Hero />

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="section-shell rounded-[40px] p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Colecao em destaque</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black text-white sm:text-4xl">
                Uma selecao pensada para ajudar voce a encontrar mais rapido a peca certa para presentear, decorar ou organizar.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Aqui entram as pecas com maior apelo de compra: presentes criativos, decoracao geek, utilidades para setup e personalizados com acabamento premium.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo" className="premium-btn premium-btn-primary">
                Explorar catálogo
              </Link>
              <Link href="/carrinho" className="premium-btn premium-btn-secondary">
                Revisar carrinho
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="premium-btn premium-btn-emerald">
                Comprar por WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { value: String(stats.totalProducts).padStart(2, "0"), label: "Pecas na colecao" },
              { value: String(stats.totalCategories).padStart(2, "0"), label: "Categorias da loja" },
              { value: "Sob medida", label: "personalizacao para presentes, decoracao e negocios" },
              { value: "Pix", label: "melhor valor para comprar com mais vantagem" }
            ].map((card) => (
              <div key={card.label} className="glass-surface rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{card.label}</p>
                <h3 className="mt-3 text-3xl font-black text-white">{card.value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 lg:grid-cols-3">
          {highlightCategories.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`section-shell rounded-[32px] bg-gradient-to-br ${item.accent} p-6 transition hover:-translate-y-1`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Selecao em destaque</p>
              <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
              <span className="premium-btn premium-btn-secondary mt-6 inline-flex w-fit px-4 py-2 text-sm">
                Ver colecao
              </span>
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      {name ? (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-[30px] border border-cyan-300/25 bg-cyan-400/10 p-6">
            <p className="text-sm text-cyan-100">Bem-vindo de volta, {name}. Seus favoritos e solicitações ficam salvos para acelerar o próximo pedido.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/conta#favoritos" className="rounded-full border border-cyan-300/30 bg-black/30 px-4 py-2 text-sm text-white">Favoritos</Link>
              <Link href="/conta" className="rounded-full border border-cyan-300/30 bg-black/30 px-4 py-2 text-sm text-white">Minha conta</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Seleção com maior saída para conversão imediata</h2>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white">Ver catálogo</Link>
        </div>
        <CatalogGrid products={featuredCatalog.slice(0, 8)} />
      </section>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
      {name ? (
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-[30px] border border-cyan-300/25 bg-cyan-400/10 p-6">
            <p className="text-sm text-cyan-100">Bem-vindo de volta, {name}. Seus favoritos e solicitações ficam salvos para acelerar o próximo pedido.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/conta#favoritos" className="rounded-full border border-cyan-300/30 bg-black/30 px-4 py-2 text-sm text-white">Favoritos</Link>
              <Link href="/conta" className="rounded-full border border-cyan-300/30 bg-black/30 px-4 py-2 text-sm text-white">Minha conta</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Seleção com maior saída para conversão imediata</h2>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white">Ver catálogo</Link>
        </div>
        <CatalogGrid products={featuredCatalog.slice(0, 8)} />
      </section>

>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {homepageCollections.map((item) => (
            <Link key={item} href="/catalogo" className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm font-medium text-white/90 hover:border-cyan-300/30">
              {item}
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            </Link>
          ))}
        </div>
      </section>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais pedidos da loja</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Os favoritos que mais convencem logo na primeira visita</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Esta selecao reune as pecas com melhor leitura comercial para presente, setup, decoracao e compra por impulso com mais valor percebido.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogo" className="premium-btn premium-btn-secondary">
              Ver todos os produtos
            </Link>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="premium-btn premium-btn-secondary">
              Instagram oficial
            </a>
          </div>
        </div>
        <CatalogGrid products={featuredProducts} />
      </section>

      <MediaStrip />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-shell rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Por que escolher a MDH 3D</p>
          <h2 className="mt-3 text-3xl font-black text-white">Uma experiência de compra clara, bonita e rápida do primeiro clique até a entrega</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Voce ve preco, prazo, estilo e personalizacao com clareza. Quando a peca pede ajuste fino, o WhatsApp entra para acelerar a decisao e deixar a compra ainda mais segura.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Selecao mais enxuta, com menos ruido e mais pecas realmente desejaveis",
              "Preco no Pix, parcelamento e prazo visiveis sem exigir clique demais",
              "Checkout simples para comprar rapido, com apoio humano quando precisar",
              "Personalizacao sob medida para presentes, decoracao, setup e negocios"
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/carrinho" className="premium-btn premium-btn-primary">
              Abrir carrinho
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="premium-btn premium-btn-emerald">
              Falar no WhatsApp
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="premium-btn premium-btn-secondary">
              Instagram oficial
            </a>
          </div>
        </div>
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Presentes com mais impacto e menos cara de lembrança comum",
              text: "Peças pensadas para surpreender de verdade, com presença visual, acabamento premium e mais valor percebido."
            },
            {
              title: "Prazo e entrega com comunicação clara",
              text: "Prazo visível nos produtos, referência de entrega no Rio e acompanhamento simples desde o pedido até a chegada."
            },
            {
              title: "Sob medida sem transformar a compra em dor de cabeça",
              text: "Quando a peça pede nome, cor, logo ou acabamento especial, o atendimento ajuda você a fechar com segurança e rapidez."
            }
          ].map((card) => (
            <div key={card.title} className="section-shell rounded-[32px] p-6">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{card.text}</p>
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-white/65">{card.text}</p>
>>>>>>> theirs
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-white/65">{card.text}</p>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
=======
>>>>>>> theirs
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
=======
>>>>>>> theirs
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
=======
>>>>>>> theirs
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-white/65">{card.text}</p>
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
=======
>>>>>>> theirs
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-white/65">{card.text}</p>
>>>>>>> theirs
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
=======
>>>>>>> theirs
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Peças em alta</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Modelos geek, itens para setup e personalizados seguem entre os mais compartilhados da semana.</p>
            <div className="mt-5 flex gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold text-pink-100">Ver no Instagram</a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100">Ver no TikTok</a>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">Conteúdo da semana</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">Bastidores da produção, acabamento e entrega para aumentar confiança de quem chega pelas redes.</p>
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-100">Acompanhar no Facebook</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold text-white">Como produzimos as peças</h3>
          <p className="mt-2 text-sm text-white/70">Processo completo em três etapas para garantir padrão visual e confiança na entrega.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <video className="aspect-video w-full object-cover" src="/media/finishing-closeup.mp4" controls poster="/backgrounds/process-detail.jpg" />
            </div>
            <div className="space-y-3">
              {processSteps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

>>>>>>> theirs
      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-white/65">{card.text}</p>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            </div>
          ))}
        </div>
      </section>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex flex-wrap items-center gap-2">
          {homepageCollections.slice(0, 4).map((collection) => (
            <span key={collection} className="premium-badge premium-badge-info px-4 py-2 text-sm normal-case tracking-[0.04em]">
              {collection}
            </span>
          ))}
          {categories.map((category) => (
            <Link
              key={category}
              href={getCategorySlug(category) ? `/categorias/${getCategorySlug(category)}` : `/catalogo?category=${encodeURIComponent(category)}`}
              className="premium-chip px-4 py-2 text-sm"
            >
              {category}
            </Link>
          ))}
=======
=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
        </div>
      </section>

=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

=======
>>>>>>> theirs
=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

=======
>>>>>>> theirs
=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>

=======
>>>>>>> theirs
      <section className="mx-auto max-w-7xl px-6 pb-14" id="orcamento">
        <QuoteForm initialProduct={formProduct} />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={whatsappHref} className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
          <Link href="/entregas" className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Ver entrega e prazos
          </Link>
        </div>
      </section>
    </div>
  );
}
