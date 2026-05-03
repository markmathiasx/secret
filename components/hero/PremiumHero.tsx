"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, ctaPulse } from "@/lib/animations";

interface PremiumHeroProps {
  catalogCount?: number;
  realPhotoCount?: number;
  readyRealCount?: number;
  ratingLabel?: string;
  reviewCount?: number;
}

export function PremiumHero({
  ratingLabel = "4.9",
  reviewCount,
}: PremiumHeroProps) {
  const shouldReduce = useReducedMotion();

  return (
    <section
      aria-label="Hero MDH3D"
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#111827] to-[#1e1b4b] px-4 py-20 sm:px-6 sm:py-28 lg:py-36"
    >
      {/* Animated background glow */}
      {!shouldReduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(99,102,241,0.08)] blur-3xl" />
        </motion.div>
      )}

      <div className="relative mx-auto max-w-4xl text-center">
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
            className="block bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent"
          >
            em objeto real
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...(shouldReduce ? {} : { ...fadeInUp, initial: "hidden", animate: "visible" })}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl"
        >
          Arquivo STL → Objeto físico em{" "}
          <strong className="text-white">24–48h</strong> ·{" "}
          <strong className="text-white">Foto real</strong> do seu produto antes
          de comprar
        </motion.p>

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
              className="group inline-flex min-h-[56px] items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:shadow-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
            className="inline-flex min-h-[56px] items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
