"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
import { QuoteForm } from "@/components/quote-form";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
=======
>>>>>>> theirs
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { homepageCollections, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { HomeEntryGate } from "@/components/home-entry-gate";
import { HomePersonalized } from "@/components/home-personalized";

const curatedCategories = ["Anime", "Geek", "Utilidades", "Personalizados", "Escritorio", "Casa"] as const;

export default function HomePage() {
  const formProduct = featuredCatalog[0];
  const bestSellers = featuredCatalog.slice(0, 8);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { homepageCollections, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { HomeEntryGate } from "@/components/home-entry-gate";
import { HomePersonalized } from "@/components/home-personalized";

const curatedCategories = ["Anime", "Geek", "Utilidades", "Personalizados", "Escritorio", "Casa"] as const;

export default function HomePage() {
  const formProduct = featuredCatalog[0];
  const bestSellers = featuredCatalog.slice(0, 8);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
>>>>>>> theirs

  return (
<<<<<<< ours
    <div>
      <HomeEntryGate />
=======
    <div className="pb-20">
>>>>>>> theirs
      <Hero />
      <HomePersonalized />

<<<<<<< ours
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Seleção com maior saída para conversão imediata</h2>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white">Ver catálogo</Link>
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Curadoria MDH 3D</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Mais vendidos e coleções com maior conversão</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Seleção comercial para venda diária com foco em itens de alta procura, personalização e recompra.
            </p>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Ver catálogo
=======
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Coleções</p>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Visual premium para uma loja de impressão 3D confiável</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
              A homepage combina descoberta visual, blocos com hierarquia clara e cards consistentes para facilitar navegação, orçamento e fechamento.
            </p>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10">
            Abrir os 1000 exemplos
>>>>>>> theirs
          </Link>
>>>>>>> theirs
        </div>
        <CatalogGrid products={featuredCatalog.slice(0, 8)} />
      </section>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {homepageCollections.map((item) => (
            <Link key={item} href="/catalogo" className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm font-medium text-white/90 hover:border-cyan-300/30">
              {item}
            </Link>
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {homepageCollections.map((item, index) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item}</h3>
=======
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {homepageCollections.map((item, index) => (
            <div key={item} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">Curadoria visual pensada para facilitar descoberta, clique e pedido por WhatsApp.</p>
>>>>>>> theirs
            </div>
>>>>>>> theirs
          ))}
        </div>
      </section>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo destaque</p>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Produtos campeões para começar vendendo</h2>
>>>>>>> theirs
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
=======
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Produtos campeões em orçamento e fechamento</h2>
        </div>
        <CatalogGrid products={bestSellers} />
>>>>>>> theirs
=======
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Produtos campeões em orçamento e fechamento</h2>
        </div>
        <CatalogGrid products={bestSellers} />
>>>>>>> theirs
      </section>

      {curatedCategories.map((category) => {
        const items = catalog.filter((item) => item.category === category).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={category} className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h3 className="text-2xl font-bold text-white">{category}</h3>
              <Link href="/catalogo" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">Ver mais</Link>
            </div>
            <CatalogGrid products={items} />
          </section>
        );
      })}

<<<<<<< ours
      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-white/65">{card.text}</p>
=======
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Produtos campeões em orçamento e fechamento</h2>
        </div>
        <CatalogGrid products={bestSellers} />
      </section>

      {curatedCategories.map((category) => {
        const items = catalog.filter((item) => item.category === category).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={category} className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h3 className="text-2xl font-bold text-white">{category}</h3>
              <Link href="/catalogo" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">Ver mais</Link>
            </div>
            <CatalogGrid products={items} />
          </section>
        );
      })}

=======
>>>>>>> theirs
      <MediaStrip />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] md:py-20">
        <QuoteForm initialProduct={formProduct} />
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Entrega local no Rio de Janeiro",
              text: "Cobertura por região com prazo claro e suporte rápido para pedidos sob encomenda."
            },
            {
              title: "Pagamento flexível",
              text: "Pix, cartão e boleto com jornada simples para converter orçamento em pedido."
            },
            {
              title: "Atendimento comercial",
              text: "WhatsApp ativo para negociação, personalização e acompanhamento de produção."
            }
          ].map((card) => (
            <div key={card.title} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-emerald-300/25 bg-emerald-400/10 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-emerald-100">Pronto para fechar seu pedido?</p>
            <p className="text-xs text-emerald-100/80">Atendimento direto para orçamento, personalização e prazo.</p>
          </div>
          <a href={whatsappHref} className="rounded-full border border-emerald-200/40 bg-emerald-300/25 px-5 py-2.5 text-sm font-semibold text-emerald-50">
            Pedir orçamento no WhatsApp
          </a>
        </div>
<<<<<<< ours
<<<<<<< ours
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
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      </section>
    </div>
  );
}
