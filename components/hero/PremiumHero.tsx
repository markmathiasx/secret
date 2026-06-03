"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, CreditCard, Factory, MessageCircleMore, UploadCloud } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SafeBackgroundVideo } from "@/components/SafeBackgroundVideo";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

interface PremiumHeroProps {
  catalogCount?: number;
  realPhotoCount?: number;
  readyRealCount?: number;
  ratingLabel?: string;
  reviewCount?: number;
  backgroundVideoSrc?: string | null;
  backgroundPosterSrc?: string | null;
}

const FLOATING_CARDS = [
  { icon: CreditCard, title: "Pix e cartão", body: "fechamento claro" },
  { icon: Factory, title: "Produção no RJ", body: "operação local" },
  { icon: BadgeCheck, title: "Mídia honesta", body: "mídia validada ou prévia técnica" },
  { icon: Box, title: "Sob demanda", body: "peças e lotes" },
] as const;

export function PremiumHero({
  catalogCount = 0,
  realPhotoCount = 0,
  readyRealCount = 0,
  ratingLabel = "avaliações reais",
  reviewCount,
  backgroundVideoSrc,
  backgroundPosterSrc,
}: PremiumHeroProps) {
  const shouldReduce = useReducedMotion();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const stats = [
    { label: "Produtos públicos", value: catalogCount ? catalogCount.toLocaleString("pt-BR") : "500+" },
    { label: "Mídias validadas", value: realPhotoCount ? realPhotoCount.toLocaleString("pt-BR") : "curadoria" },
    { label: "Pronta entrega", value: readyRealCount ? readyRealCount.toLocaleString("pt-BR") : "sob consulta" },
  ];

  return (
    <section className="mdh-hero-cinematic relative isolate min-h-[calc(100svh-76px)] overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-14">
      <SafeBackgroundVideo
        src={backgroundVideoSrc}
        poster={backgroundPosterSrc}
        videoClassName="opacity-[0.72] saturate-[1.18] contrast-[1.08]"
        overlayClassName="bg-[linear-gradient(90deg,rgba(1,5,10,0.94),rgba(1,5,10,0.58)_45%,rgba(1,5,10,0.88)),linear-gradient(180deg,rgba(1,5,10,0.30),rgba(1,5,10,0.86)_76%,#020509)]"
      />
      <div className="mdh-cad-grid absolute inset-0 -z-10 opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-[linear-gradient(180deg,transparent,#020509)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-px w-[82vw] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.55),rgba(167,139,250,0.4),transparent)]" />

      {!shouldReduce ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          animate={{ opacity: [0.35, 0.62, 0.35], y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute right-[-12%] top-24 h-44 w-[58vw] rotate-[-9deg] bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.18),rgba(132,204,22,0.10),transparent)] blur-2xl" />
          <div className="absolute bottom-24 left-[-10%] h-40 w-[42vw] rotate-[7deg] bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.17),rgba(245,158,11,0.10),transparent)] blur-2xl" />
        </motion.div>
      ) : null}

      <div className="relative mx-auto grid min-h-[calc(100svh-150px)] max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.78fr)]">
        <div className="max-w-4xl">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 18 }}
            animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="max-w-5xl text-balance font-display text-[clamp(2.6rem,5.45vw,5.9rem)] font-black leading-[0.92] text-white">
              Impressão 3D sob demanda com acabamento de produto final.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-white/76 md:text-xl md:leading-9">
              Presentes, utilidades, colecionáveis, peças personalizadas e lotes produzidos no RJ com atendimento direto.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.58, ease: "easeOut" }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link href="/catalogo" className="btn-primary min-h-[58px] gap-2 px-7 py-4 text-base">
              Explorar catálogo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href={whatsappHref} className="btn-whatsapp min-h-[58px] gap-2 px-7 py-4 text-base">
              <MessageCircleMore className="h-5 w-5" />
              Pedir orçamento no WhatsApp
            </a>
            <Link href="/imagem-para-impressao-3d" className="btn-secondary min-h-[58px] gap-2 px-7 py-4 text-base">
              <UploadCloud className="h-5 w-5" />
              Enviar arquivo 3D
            </Link>
          </motion.div>

          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.58, ease: "easeOut" }}
            className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3"
          >
            {stats.map((item) => (
              <div key={item.label} className="mdh-instrument-panel px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, x: 24 }}
          animate={shouldReduce ? undefined : { opacity: 1, x: 0 }}
          transition={{ delay: 0.18, duration: 0.65, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          <div className="mdh-orbit-frame">
            <div className="mdh-orbit-frame__inner">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Laboratório digital</p>
              <h2 className="mt-4 text-4xl font-black leading-none text-white">Modelo, impressão, acabamento e venda no mesmo fluxo.</h2>
              <div className="mt-8 grid gap-3">
                {FLOATING_CARDS.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      className="mdh-floating-proof"
                      animate={shouldReduce ? undefined : { y: [0, index % 2 ? -6 : 6, 0] }}
                      transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <strong className="block text-sm text-white">{card.title}</strong>
                        <span className="text-xs text-white/58">{card.body}</span>
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-8 rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-4">
                <p className="text-sm font-semibold text-amber-100">
                  {ratingLabel}
                  {reviewCount ? ` · ${reviewCount} avaliações` : ""} · atendimento humano para validar cor, escala e prazo.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
