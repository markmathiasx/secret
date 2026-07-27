"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ArrowRight, Gift, Gamepad2, Home, Wrench, Palette, Heart } from "lucide-react";

const categories = [
  {
    icon: Gift,
    title: "Presentes Personalizados",
    description: "Chaveiros, nomes 3D, litofanias e luminarias para presente com briefing claro.",
    href: "/catalogo?category=Presentes%20Personalizados",
    color: "from-violet-400/20 to-violet-600/5",
    iconColor: "text-violet-300",
  },
  {
    icon: Gamepad2,
    title: "Setup e Home Office",
    description: "Suportes e acessorios para mesa, headphone, celular e controle gamer.",
    href: "/catalogo?category=Setup%20e%20Home%20Office",
    color: "from-cyan-400/20 to-cyan-600/5",
    iconColor: "text-cyan-300",
  },
  {
    icon: Home,
    title: "Casa e Decoracao",
    description: "Vasos e pecas decorativas com leitura honesta de material, prazo e acabamento.",
    href: "/catalogo?category=Casa%20e%20Decora%C3%A7%C3%A3o",
    color: "from-amber-400/20 to-amber-600/5",
    iconColor: "text-amber-300",
  },
  {
    icon: Wrench,
    title: "Organizacao",
    description: "Organizadores de cabos, caixas e utilitarios para mesa, bancada e rotina.",
    href: "/catalogo?category=Organiza%C3%A7%C3%A3o",
    color: "from-emerald-400/20 to-emerald-600/5",
    iconColor: "text-emerald-300",
  },
  {
    icon: Palette,
    title: "Personalizados",
    description: "Filtre o catalogo por itens com ajuste de nome, cor, tema, escala ou briefing.",
    href: "/catalogo?custom=1",
    color: "from-rose-400/20 to-rose-600/5",
    iconColor: "text-rose-300",
  },
  {
    icon: Heart,
    title: "Brindes e Lotes",
    description: "Pedidos em quantidade para eventos, acoes promocionais e repeticao corporativa.",
    href: "/brindes-e-lotes",
    color: "from-pink-400/20 to-pink-600/5",
    iconColor: "text-pink-300",
  },
];

export function HomeCategoriesShowcase({ catalogCount }: { catalogCount: number }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center mb-10">
        <p className="section-kicker">Explore por categoria</p>
        <h2 className="section-title mx-auto">{catalogCount.toLocaleString("pt-BR")} peças organizadas para você encontrar rápido.</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <Reveal key={cat.title} direction="up" delay={i * 80}>
              <Link
                href={cat.href}
                className={`group flex items-start gap-4 rounded-[8px] border border-white/10 bg-gradient-to-br ${cat.color} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(2,8,23,0.3)]`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border border-white/10 bg-black/30 ${cat.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-100 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-white/55">{cat.description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
