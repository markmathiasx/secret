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
        </div>
      </div>
    </section>
  );
}
