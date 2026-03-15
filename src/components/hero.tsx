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
"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClassName, buttonFamilies } from "@/components/ui/buttons";
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
          <span className="premium-badge premium-badge-info px-4 py-1 text-xs">
            Producao local no RJ, qualidade premium e Pix com melhor valor
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.02] text-white md:text-6xl">
            Peças 3D que transformam presentes, setup e decoração em algo
            <span className="text-brand-gradient"> mais bonito, pessoal e desejável</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            A {brand.name} reune pecas unicas para presentear, organizar a mesa, decorar o ambiente e criar itens personalizados com compra simples, entrega rapida e acabamento que valoriza cada detalhe.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/52">
            <span className="premium-badge premium-badge-neutral">Mais pedidos</span>
            <span className="premium-badge premium-badge-success">Pix com melhor preco</span>
            <span className="premium-badge premium-badge-neutral">Entrega local no RJ</span>
            <span className="premium-badge premium-badge-neutral">Personalizacao sob medida</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalogo" className={buttonFamilies.primary}>
              Explorar a colecao
            </Link>
            <Link href="/carrinho" className={buttonFamilies.secondary}>
              Revisar carrinho
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick({ placement: "hero_primary" })}
              className={buttonFamilies.primaryPix}
            >
              Pedir atendimento
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className={buttonFamilies.secondary}
            >
              Ver Instagram
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {heroShortcuts.map((shortcut) => (
              <Link
                key={shortcut.label}
                href={shortcut.href}
                className={buttonClassName("premium-chip px-4 py-2 text-sm font-medium")}
              >
                {shortcut.label}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Curadoria forte", "mais favoritos da marca e menos produtos sem apelo"],
              ["Entrega rapida", "linhas com prazo curto para vender e presentear melhor"],
              ["Atendimento proximo", "producao local com suporte direto quando voce precisar"]
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
                <p className="mt-2 text-sm text-white/75">Presentes criativos, decoração geek e utilidades que impressionam mais e resolvem a compra com rapidez.</p>
              </div>
              <div className="glass-surface rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Marca com assinatura</p>
                <p className="mt-2 text-sm text-white/75">Acabamento limpo, atendimento ágil e uma vitrine montada para valorizar cada peça como produto desejável.</p>
                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-violet-200">
                  @{brand.instagramHandle}
                </a>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Mais pedidos", "peças com maior apelo para presente, setup e decoração"],
                ["Pix", "melhor preço para fechar a compra com mais vantagem"],
                ["Sob medida", "ajustes de cor, nome e acabamento quando fizer sentido"]
              ].map(([label, text]) => (
                <div key={label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{text}</p>
                </div>
              ))}
            </div>
          </div>
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
=======
import Link from "next/link";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Entrega local no Rio de Janeiro",
  "Produção própria",
  "Acabamento premium",
  "Pagamento facilitado",
  "Atendimento rápido"
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/backgrounds/hero-printer-fallback.jpg">
        <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/72 to-black/92" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,255,220,0.22),transparent_35%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 pt-24 md:min-h-[88vh] md:pb-16">
        <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Atelier MDH 3D • Rio de Janeiro
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          Peças 3D sob medida com acabamento de marca, feitas para vender, presentear e surpreender.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Produção local, personalização orientada por briefing e atendimento rápido para transformar ideia em peça pronta.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Ver catálogo
          </Link>
          <Link href="/#orcamento" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
            Pedir orçamento
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
>>>>>>> theirs
        </div>
      </div>
    </section>
  );
}
