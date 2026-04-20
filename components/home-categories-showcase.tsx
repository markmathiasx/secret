"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ArrowRight, Gift, Gamepad2, Home, Wrench, Palette, Heart } from "lucide-react";

const categories = [
  {
    icon: Gamepad2,
    title: "Geek & Colecionáveis",
    description: "Miniaturas chibi, personagens de anime e gaming em PLA premium.",
    href: "/colecionaveis-geek-3d",
    color: "from-cyan-400/20 to-cyan-600/5",
    iconColor: "text-cyan-300",
  },
  {
    icon: Gift,
    title: "Presentes Criativos",
    description: "Ideias únicas para quem quer surpreender com algo diferente.",
    href: "/presentes-3d",
    color: "from-violet-400/20 to-violet-600/5",
    iconColor: "text-violet-300",
  },
  {
    icon: Home,
    title: "Decoração & Casa",
    description: "Vasos, luminárias e peças decorativas com design moderno.",
    href: "/decoracao-3d-para-casa",
    color: "from-amber-400/20 to-amber-600/5",
    iconColor: "text-amber-300",
  },
  {
    icon: Wrench,
    title: "Setup & Organização",
    description: "Suportes para fone, celular, cabos e acessórios de mesa.",
    href: "/setup-e-organizacao-3d",
    color: "from-emerald-400/20 to-emerald-600/5",
    iconColor: "text-emerald-300",
  },
  {
    icon: Palette,
    title: "Personalizados",
    description: "Envie sua referência e receba um orçamento sob medida.",
    href: "/imagem-para-impressao-3d",
    color: "from-rose-400/20 to-rose-600/5",
    iconColor: "text-rose-300",
  },
  {
    icon: Heart,
    title: "Brindes Corporativos",
    description: "Chaveiros, troféus e itens para eventos empresariais.",
    href: "/brindes-personalizados-3d",
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
                className={`group flex items-start gap-4 rounded-2xl border border-white/10 bg-gradient-to-br ${cat.color} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(2,8,23,0.3)]`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 ${cat.iconColor}`}>
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
