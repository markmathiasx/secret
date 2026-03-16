'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Box, Gamepad2, Gift, PackageCheck } from 'lucide-react';

const tabs = [
  {
    id: 'geek',
    title: 'Geek & Anime',
    subtitle: 'Colecionáveis, displays e peças com apelo visual forte.',
    icon: Gamepad2,
    bullets: ['Miniaturas e displays decorativos', 'Peças para presente com forte apelo visual', 'Itens de mesa e estante para fãs'],
    ctaLabel: 'Explorar coleção geek',
    href: '/catalogo?category=Geek%20%26%20Anime'
  },
  {
    id: 'gift',
    title: 'Presentes Criativos',
    subtitle: 'Articulados, nomes 3D e itens feitos para surpreender.',
    icon: Gift,
    bullets: ['Linha com efeito “uau” para presente', 'Modelos compactos e fáceis de vender', 'Ótima saída para datas sazonais'],
    ctaLabel: 'Ver presentes criativos',
    href: '/catalogo?category=Presentes%20Criativos'
  },
  {
    id: 'setup',
    title: 'Setup & Organização',
    subtitle: 'Suportes, docks e acessórios para mesa premium.',
    icon: Box,
    bullets: ['Organizadores de mesa com visual limpo', 'Peças úteis para trabalho e home office', 'Linha ideal para uso diário e recompra'],
    ctaLabel: 'Abrir linha de setup',
    href: '/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o'
  }
] as const;

export function HomePersonalized() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('geek');

  const current = useMemo(() => tabs.find((item) => item.id === activeTab) ?? tabs[0], [activeTab]);
  const Icon = current.icon;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Linhas principais</p>
          <h2 className="section-title">Uma vitrine mais clara, segmentada e fácil de vender</h2>
          <p className="section-copy max-w-3xl">
            Em vez de parecer um catálogo genérico, a home passa a guiar o cliente por intenções de compra com hierarquia visual mais forte.
          </p>
        </div>
        <Link href="/catalogo" className="btn-dark">
          Abrir catálogo completo
        </Link>
      </div>

      <div className="tab-shell">
        <div className="tab-nav">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`tab-pill ${active ? 'is-active' : ''}`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <TabIcon className="h-4 w-4" />
                  {tab.title}
                </span>
                <span className="mt-2 block text-xs leading-6 text-white/55">{tab.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="tab-content-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="section-kicker">Curadoria em destaque</p>
                <h3 className="mt-1 text-2xl font-black text-white">{current.title}</h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/72">{current.subtitle}</p>

            <div className="mt-5 grid gap-3">
              {current.bullets.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={current.href} className="btn-gradient">
                {current.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/checkout" className="btn-glass">
                Ir para compra rápida
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              {
                title: 'Pronta entrega',
                text: 'Itens com apelo imediato para venda rápida via catálogo e WhatsApp.',
                icon: PackageCheck
              },
              {
                title: 'Escala visual',
                text: 'Peças pensadas para render bem em cards, reels, stories e vitrines.',
                icon: Gamepad2
              },
              {
                title: 'Personalização',
                text: 'Nome, cor, escala e acabamento adaptados ao objetivo do pedido.',
                icon: Gift
              }
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <article key={card.title} className="feature-card">
                  <div className="relative z-10">
                    <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-100">
                      <CardIcon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
