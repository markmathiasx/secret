"use client";

import Image from "next/image";
import Link from "next/link";
import { trackWhatsAppClick } from "@/lib/analytics-client";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Hero() {
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, "Oi! Vim pela home da MDH 3D e quero atendimento.");
  const heroShortcuts = [
    { label: "Anime & Geek", href: "/catalogo?q=anime" },
    { label: "Presentes", href: "/catalogo?q=presente" },
    { label: "Setup & Organização", href: "/catalogo?q=suporte" },
    { label: "Personalizados", href: "/catalogo?q=personalizado" }
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="ambient-orb absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="ambient-orb absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-400/12 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
            Producao local no RJ, acabamento caprichado e Pix com melhor valor
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.02] text-white md:text-6xl">
            Pecas 3D com
            <span className="text-brand-gradient"> cara de presente, setup e decoracao</span>
            {" "}para quem quer comprar algo com personalidade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            A {brand.name} cria utilidades, decor geek, presentes criativos e pecas sob encomenda com uma curadoria mais enxuta, visual forte e atendimento rapido pelo WhatsApp quando voce quiser personalizar.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/52">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Curadoria enxuta</span>
            <span className="rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-2 text-emerald-100/90">Pix com melhor preço</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Entrega local no RJ</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Personalização sob encomenda</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:shadow-[0_18px_42px_rgba(34,211,238,0.22)]">
              Explorar a colecao
            </Link>
            <Link href="/carrinho" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Revisar carrinho
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick({ placement: "hero_primary" })}
              className="rounded-full border border-emerald-400/25 bg-emerald-400/14 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/45"
            >
              Pedir atendimento
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/84 transition hover:border-white/30 hover:bg-white/10"
            >
              Ver Instagram
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {heroShortcuts.map((shortcut) => (
              <Link
                key={shortcut.label}
                href={shortcut.href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/78 transition hover:border-cyan-300/30 hover:text-white"
              >
                {shortcut.label}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Selecao enxuta", "menos ruido e mais produtos com cara de best seller"],
              ["1-3 dias", "prazo comum nas linhas mais vendaveis"],
              ["RJ", "producao local com atendimento mais proximo"]
            ].map(([value, label]) => (
              <div key={label} className="glass-surface rounded-[24px] p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[42px] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-400/25 blur-2xl" />
          <div className="glass-surface-strong premium-shadow relative overflow-hidden rounded-[36px] p-4">
            <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Curadoria MDH 3D
            </div>
            <Image src="/logo-mdh.jpg" alt="Logo MDH" width={1200} height={900} className="h-auto w-full rounded-[28px] object-cover" priority />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="glass-surface rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Presentes e setup</p>
                <p className="mt-2 text-sm text-white/75">Uma selecao feita para vender melhor: presentes criativos, decor geek e utilidades que deixam a mesa mais bonita.</p>
              </div>
              <div className="glass-surface rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Marca com assinatura</p>
                <p className="mt-2 text-sm text-white/75">Acabamento limpo, atendimento rapido e linguagem mais comercial para transformar curiosidade em compra.</p>
                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-violet-200">
                  @{brand.instagramHandle}
                </a>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Mais pedidos", "produtos pensados para presente, setup e decor"],
                ["Pix", "melhor preco para decidir mais rapido"],
                ["Sob encomenda", "ajustes de cor, nome e acabamento quando fizer sentido"]
              ].map(([label, text]) => (
                <div key={label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
