import Image from "next/image";
import Link from "next/link";
import { brand, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getHeroBackgroundMedia } from "@/lib/media";

export function Hero() {
  const heroMedia = getHeroBackgroundMedia();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative isolate min-h-[76vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image src={heroMedia.fallbackImageSrc} alt="Produção MDH 3D" fill priority className="h-full w-full object-cover" />
        {heroMedia.hasVideo ? (
          <video
            className="hero-video h-full w-full object-cover"
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
            </a>
          </div>

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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
