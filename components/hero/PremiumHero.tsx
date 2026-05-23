"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, ctaPulse } from "@/lib/animations";
import { SafeBackgroundVideo } from "@/components/safe-background-video";

interface PremiumHeroProps {
  catalogCount?: number;
  realPhotoCount?: number;
  readyRealCount?: number;
  ratingLabel?: string;
  reviewCount?: number;
  backgroundVideoSrc?: string | null;
  backgroundPosterSrc?: string | null;
}

export function PremiumHero({
  catalogCount = 0,
  realPhotoCount = 0,
  readyRealCount = 0,
  ratingLabel = "4.9",
  reviewCount,
  backgroundVideoSrc,
  backgroundPosterSrc,
}: PremiumHeroProps) {
  const shouldReduce = useReducedMotion();
  const heroStats = [
    { label: "catalogo", value: catalogCount ? catalogCount.toLocaleString("pt-BR") : "500+" },
    { label: "foto real", value: String(realPhotoCount || "curada") },
    { label: "pronta entrega", value: String(readyRealCount || "sob consulta") },
  ];

  return (
    <section
      aria-label="Hero MDH3D"
      className="relative isolate min-h-[calc(100svh-72px)] overflow-hidden bg-[#05070a] px-4 pb-24 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:pb-32 lg:pt-36"
    >
      <SafeBackgroundVideo
        src={backgroundVideoSrc}
        poster={backgroundPosterSrc}
        videoClassName="hero-video-layer"
        overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.92),rgba(2,6,23,0.58)_48%,rgba(2,6,23,0.82)),linear-gradient(180deg,rgba(2,6,23,0.34),rgba(2,6,23,0.84)_82%,#05070a)]"
      />
      <div className="hero-scanlines -z-10" />

      {/* Animated background glow */}
      {!shouldReduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <div className="absolute left-[-8%] top-1/3 h-40 w-[120%] -rotate-6 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.12),rgba(16,185,129,0.10),transparent)] blur-2xl" />
        </motion.div>
      )}

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Trust badge */}
        <motion.div
          {...(shouldReduce ? {} : fadeInUp)}
          initial={shouldReduce ? undefined : "hidden"}
          animate={shouldReduce ? undefined : "visible"}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-300"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Produção RJ · Frete p/ todo Brasil
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={staggerContainer}
          initial={shouldReduce ? undefined : "hidden"}
          animate={shouldReduce ? undefined : "visible"}
          className="mt-2 font-sans text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          <motion.span variants={fadeInUp} className="block">
            Transforme sua ideia
          </motion.span>
          <motion.span
            variants={fadeInUp}
            className="block bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent"
          >
            em objeto real
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...(shouldReduce ? {} : { ...fadeInUp, initial: "hidden", animate: "visible" })}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl"
        >
          Arquivo STL → Objeto físico em{" "}
          <strong className="text-white">24–48h</strong> ·{" "}
          <strong className="text-white">Foto real</strong> do seu produto antes
          de comprar
        </motion.p>

        <motion.div
          {...(shouldReduce ? {} : { ...fadeInUp, initial: "hidden", animate: "visible" })}
          className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3"
        >
          {heroStats.map((item) => (
            <div key={item.label} className="rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">{item.label}</p>
              <p className="mt-1 text-lg font-black text-white">{item.value}</p>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          {...(shouldReduce ? {} : { ...fadeInUp, initial: "hidden", animate: "visible" })}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <motion.div
            variants={ctaPulse}
            initial="rest"
            animate={shouldReduce ? "rest" : "pulse"}
          >
            <Link
              href="/catalogo"
              className="group inline-flex min-h-[56px] items-center gap-2 rounded-[8px] bg-emerald-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300 hover:shadow-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Começar agora — ver catálogo de produtos"
            >
              Começar agora
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          <Link
            href="/catalogo"
            className="inline-flex min-h-[56px] items-center gap-2 rounded-[8px] border border-white/20 bg-white/[0.04] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:border-cyan-200/40 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Ver catálogo
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          {...(shouldReduce ? {} : { ...fadeInUp, initial: "hidden", animate: "visible" })}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-400"
          role="list"
          aria-label="Garantias e diferenciais"
        >
          <span role="listitem" className="flex items-center gap-1.5">
            <Star
              className="h-4 w-4 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            <strong className="text-white">{ratingLabel ?? "4.9"}</strong>
            {reviewCount ? `/${reviewCount} avaliações` : "/5"}
          </span>
          <span aria-hidden="true" className="hidden sm:block">·</span>
          <span role="listitem" className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            Entrega RJ/SP em 24h
          </span>
          <span aria-hidden="true" className="hidden sm:block">·</span>
          <span role="listitem" className="flex items-center gap-1.5">
            <ShieldCheck
              className="h-4 w-4 text-indigo-400"
              aria-hidden="true"
            />
            Compra segura
          </span>
        </motion.div>

        {/* Scroll indicator */}
        {!shouldReduce && (
          <motion.div
            aria-hidden="true"
            className="mt-16 flex justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/20 p-1">
              <div className="h-1.5 w-0.5 animate-pulse rounded-full bg-white/40" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
