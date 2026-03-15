import Image from "next/image";
import Link from "next/link";
import { Box, CreditCard, MapPinned, MessageCircleMore } from "lucide-react";
import { brand, trustHighlights, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getHeroBackgroundMedia } from "@/lib/media";

const spotlightStats = [
  { label: "Origem", value: "Rio de Janeiro" },
  { label: "Fluxo", value: "Site, Mercado Livre e Shopee" },
  { label: "Atendimento", value: "WhatsApp rapido" }
];

export function Hero() {
  const heroMedia = getHeroBackgroundMedia();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroMedia.fallbackImageSrc}
          alt="Bastidores da producao MDH 3D"
          fill
          priority
          className="object-cover"
        />
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
      </div>

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(103,232,249,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.12),transparent_18%),linear-gradient(180deg,rgba(4,8,22,0.15),rgba(4,8,22,0.88))]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="flex flex-col justify-end">
          <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
            {brand.name} • impressao 3D premium no RJ
          </span>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] text-white md:text-6xl">
            Impressao 3D sob medida no Rio de Janeiro para presentes, colecionaveis, setup e projetos personalizados.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
            Produzimos pecas com acabamento limpo, revisao visual, prazo claro e atendimento direto para quem compra pelo site,
            Mercado Livre, Shopee ou WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
            >
              Ver catalogo
            </Link>
            <a
              href={whatsappHref}
              className="rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Pedir orcamento
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {trustHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-medium text-white/75"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel self-end rounded-[36px] p-6 shadow-glow">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {spotlightStats.map((item, index) => {
              const Icon = index === 0 ? MapPinned : index === 1 ? Box : MessageCircleMore;
              return (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <span className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Condicoes comerciais</p>
                <p className="mt-2 text-lg font-semibold text-white">Pix, cartao e boleto com fechamento assistido</p>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  O site sustenta descoberta e orcamento rapido, enquanto o fechamento pode seguir pelo canal ideal para cada cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
