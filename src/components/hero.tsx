import Link from "next/link";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { getHeroBackgroundMedia } from "@/lib/media";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustSignals = [
  "Atendimento rapido",
  "Acabamento premium",
  "Entrega local no RJ",
  "Pronta entrega e encomenda",
  "Projetos personalizaveis"
];
=======
import { brand, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getHeroBackgroundMedia } from "@/lib/media";
>>>>>>> theirs
=======
import { brand, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getHeroBackgroundMedia } from "@/lib/media";
>>>>>>> theirs
=======
import { brand, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getHeroBackgroundMedia } from "@/lib/media";
>>>>>>> theirs
=======
import { brand, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getHeroBackgroundMedia } from "@/lib/media";
>>>>>>> theirs

export function Hero() {
  const heroMedia = getHeroBackgroundMedia();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroMedia.fallbackImageSrc}
          alt="Impressora 3D em funcionamento"
          fill
          priority
          className="object-cover"
        />
        {heroMedia.hasVideo ? (
          <video
            className="hero-video absolute inset-0 h-full w-full object-cover"
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
    <section className="relative isolate min-h-[76vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image src={heroMedia.fallbackImageSrc} alt="Produção MDH 3D" fill priority className="h-full w-full object-cover" />
        {heroMedia.hasVideo ? (
          <video
            className="hero-video h-full w-full object-cover"
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
            poster={heroMedia.posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            {heroMedia.sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : null}
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      </div>

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(46,240,214,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(91,130,255,0.18),transparent_26%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.65),transparent_46%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.25),rgba(2,6,23,0.62)_48%,rgba(2,6,23,0.94)_100%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.78)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-14 pt-28 md:pb-20">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100">
            Atelier MDH 3D • Rio de Janeiro
          </span>

          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] text-white md:text-7xl">
            Impressao 3D com presenca de marca, acabamento comercial e impacto visual real.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
            Pecas geek, utilidades, presentes e projetos personalizados com processo proprio, video hero real, atendimento humano e rota clara para fechar no WhatsApp.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
            >
              Ver catalogo
            </Link>
            <Link
              href="/#orcamento"
              className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Pedir orcamento
            </Link>
            <a
              href={whatsappHref}
              className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
            >
              Falar no WhatsApp
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
        <Image src="/placeholders/printer-layer.svg" alt="" fill priority className="pointer-events-none object-cover opacity-25 mix-blend-screen" aria-hidden />
      </div>

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_84%_22%,rgba(168,85,247,0.16),transparent_38%)]" />
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/65 to-base" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24">
        <div>
          <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            Produção local • acabamento premium • entrega no RJ
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
            {brand.name}: impressão 3D com acabamento profissional para vender e presentear.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Criamos peças em anime, geek, utilidades e personalizados com processo local, controle de qualidade e atendimento rápido via WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
              Ver catálogo
            </Link>
            <a href={whatsappHref} className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15">
              Pedir orçamento
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
            </a>
          </div>
        </div>

<<<<<<< ours
        <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {trustSignals.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white/80 backdrop-blur"
            >
=======
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

=======
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

>>>>>>> theirs
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
<<<<<<< ours
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
>>>>>>> theirs
              {item}
=======
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Acabamento", "premium e limpo"],
              ["Entrega", "local no RJ"],
              ["Atendimento", "humano + WhatsApp"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-glow backdrop-blur">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/75">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-400/25 blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-4 shadow-violet backdrop-blur-lg">
            <Image src="/logo-mdh.jpg" alt="Logo MDH" width={1200} height={900} className="h-auto w-full rounded-[24px] object-cover" priority />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Qualidade visual</p>
                <p className="mt-2 text-sm text-white/80">Cada peça passa por revisão de acabamento, limpeza e padrão de cor antes da entrega.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Fluxo comercial</p>
                <p className="mt-2 text-sm text-white/80">Catálogo, orçamento, Pix e atendimento prontos para conversão diária.</p>
              </div>
>>>>>>> theirs
=======
        </div>

        <div className="mt-8 grid gap-2 md:grid-cols-5">
          {trustSignals.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/80">
              {item}
>>>>>>> theirs
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
