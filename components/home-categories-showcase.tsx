"use client";

import Link from "next/link";
import { ArrowRight, Gamepad2, Gift, Heart, Home, Palette, Wrench } from "lucide-react";
import { Reveal } from "@/components/reveal";

const categories = [
  {
    icon: Gift,
    eyebrow: "Feito para marcar",
    title: "Presentes Personalizados",
    description: "Chaveiros, litofanias e luminárias com briefing claro, produção local e acabamento conferido.",
    href: "/catalogo?category=Presentes%20Personalizados",
    color: "from-violet-400/20 via-violet-500/8 to-transparent",
    iconColor: "text-violet-300",
    layout: "sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-[25rem]",
  },
  {
    icon: Gamepad2,
    eyebrow: "Mesa sem ruído",
    title: "Setup e Home Office",
    description: "Suportes e acessórios que organizam headphone, celular e controle sem pesar no ambiente.",
    href: "/catalogo?category=Setup%20e%20Home%20Office",
    color: "from-cyan-400/18 via-cyan-500/6 to-transparent",
    iconColor: "text-cyan-300",
    layout: "lg:col-span-2",
  },
  {
    icon: Home,
    eyebrow: "Forma e função",
    title: "Casa e Decoração",
    description: "Vasos e peças decorativas com material, escala e prazo apresentados sem ambiguidade.",
    href: "/catalogo?category=Casa%20e%20Decora%C3%A7%C3%A3o",
    color: "from-amber-400/18 via-amber-500/6 to-transparent",
    iconColor: "text-amber-300",
    layout: "lg:col-span-2",
  },
  {
    icon: Wrench,
    eyebrow: "Tudo no lugar",
    title: "Organização",
    description: "Organizadores de cabos, caixas e utilitários compactos para mesa, bancada e rotina.",
    href: "/catalogo?category=Organiza%C3%A7%C3%A3o",
    color: "from-emerald-400/18 via-emerald-500/6 to-transparent",
    iconColor: "text-emerald-300",
    layout: "lg:col-span-2",
  },
  {
    icon: Palette,
    eyebrow: "Seu projeto",
    title: "Personalizados",
    description: "Nome, cor, tema, escala e referência validados antes da produção.",
    href: "/catalogo?custom=1",
    color: "from-rose-400/18 via-rose-500/6 to-transparent",
    iconColor: "text-rose-300",
    layout: "lg:col-span-2",
  },
  {
    icon: Heart,
    eyebrow: "Escala comercial",
    title: "Brindes e Lotes",
    description: "Pedidos em quantidade para eventos, ações promocionais e repetição corporativa.",
    href: "/brindes-e-lotes",
    color: "from-fuchsia-400/18 via-fuchsia-500/6 to-transparent",
    iconColor: "text-fuchsia-300",
    layout: "sm:col-span-2 lg:col-span-4",
  },
] as const;

export function HomeCategoriesShowcase({ catalogCount }: { catalogCount: number }) {
  return (
    <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:py-28">
      <div className="mb-12 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="section-kicker">Coleções MDH 3D</p>
          <h2 className="max-w-[12ch] text-4xl font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Encontre pela intenção, não pelo excesso.
          </h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-white/58 lg:justify-self-end lg:text-lg">
          {catalogCount.toLocaleString("pt-BR")} referências organizadas, com uma vitrine direta enxuta e validação humana para projetos sob medida.
        </p>
      </div>
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Reveal key={category.title} direction="up" delay={index * 65} className={category.layout}>
              <Link
                href={category.href}
                className={`group relative flex h-full min-h-52 flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${category.color} p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-7`}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.06] blur-3xl transition duration-500 group-hover:scale-125" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 ${category.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs text-white/28">0{index + 1}</span>
                </div>
                <div className="relative mt-10">
                  <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${category.iconColor}`}>{category.eyebrow}</p>
                  <h3 className="mt-2 max-w-[15ch] text-2xl font-black leading-tight tracking-[-0.025em] text-white transition-colors group-hover:text-cyan-50 sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/56">{category.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/74 transition group-hover:text-white">
                    Explorar coleção
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
