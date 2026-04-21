"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Layers,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  Upload,
  Volume2,
  Zap,
} from "lucide-react";
import { whatsappNumber } from "@/lib/constants";
import { getProductUrl } from "@/lib/catalog";
import { verifiedCatalog } from "@/lib/verified-catalog";
import { SafeProductImage } from "@/components/safe-product-image";

// ─── Video sources (locally-owned assets, no external licensing) ────────────
const HERO_VIDEOS = [
  {
    src: "/assets/videos/hero-bg.mp4",
    poster: "/assets/videos/hero-poster.jpg",
  },
  {
    src: "/media/hero-printer-loop.mp4",
    poster: "/backgrounds/hero-printer-fallback.jpg",
  },
];

// ─── Highlights ──────────────────────────────────────────────────────────────
const HIGHLIGHTS = [
  "Presentes personalizados, utilidades, decoração e projetos sob medida",
  "Portfólio com foto real para reduzir dúvida e melhorar a confiança",
  "Checkout claro, atendimento humano e produção local no Rio de Janeiro",
];

// ─── Bambu Lab A1 mini — especificações reais ─────────────────────────────────
const PRINTER_SPECS = [
  { Icon: Zap, label: "Velocidade máx.", value: "500 mm/s" },
  { Icon: Layers, label: "Volume", value: "180³ mm" },
  { Icon: Volume2, label: "Ruído", value: "≤ 45 dB" },
];

// ─── Bambu Lab A1 mini — diferenciais de produção ────────────────────────────
const PRINTER_FEATURES = [
  {
    icon: "⚡",
    title: "Calibração automática ponta a ponta",
    body: "Nivelamento assistido, compensação de vibração e fluxo automática — sem ajuste manual entre impressões.",
  },
  {
    icon: "🎨",
    title: "Impressão multicolor com AMS Lite",
    body: "Até 4 cores por peça. Peças geek, presentes personalizados e decoração ganham outra dimensão visual.",
  },
  {
    icon: "🔇",
    title: "Operação silenciosa ≤ 45 dB",
    body: "Ciclo completo abaixo de 45 dB. Produção contínua em ambiente residencial sem impacto no entorno.",
  },
  {
    icon: "🔌",
    title: "Plug and print — sem fricção",
    body: "Da caixa à primeira peça impressa em menos de 1 hora. Zero configuração manual avançada.",
  },
];

export function Hero() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [wrapperOpacity, setWrapperOpacity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const featuredRealPieces = verifiedCatalog.slice(0, 3);

  // ── Detect prefers-reduced-motion ──────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Pause/resume video based on motion preference ─────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (reducedMotion) {
      vid.pause();
    } else {
      vid.play().catch(() => {});
    }
  }, [reducedMotion]);

  // ── Rotate between videos every 14 s (crossfade via wrapper opacity) ──────
  useEffect(() => {
    if (reducedMotion || HERO_VIDEOS.length < 2) return;
    const timer = setInterval(() => {
      // fade out
      setWrapperOpacity(0);
      setTimeout(() => {
        setActiveVideoIdx((prev) => (prev + 1) % HERO_VIDEOS.length);
        // fade in
        setWrapperOpacity(1);
      }, 700);
    }, 14000);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = [".stl", ".obj", ".3mf"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      alert("Arquivo inválido. Aceite apenas .stl, .obj ou .3mf.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo excede 50 MB.");
      return;
    }
    setSelectedFile(file.name);
  }

  const currentVideo = HERO_VIDEOS[activeVideoIdx];

  return (
    <section id="home-hero" className="relative overflow-hidden px-6 pb-24 pt-28 md:pb-24 md:pt-32">

      {/* ── Video background layer ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          opacity: wrapperOpacity,
          transition: "opacity 700ms ease",
        }}
      >
        {/*
          Decorative video — locally owned assets.
          aria-hidden removes it from the accessibility tree.
          muted + autoPlay works on all modern browsers.
          preload="metadata" avoids blocking LCP with a large video fetch.
        */}
        <video
          ref={videoRef}
          key={currentVideo.src}
          className="hero-video-layer h-full w-full object-cover"
          src={currentVideo.src}
          poster={currentVideo.poster}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      </div>

      {/* ── Gradient overlay — ensures AA+ contrast on all text ───────────── */}
      <div className="hero-overlay absolute inset-0 -z-20" />

      {/* ── Ambient decorative glows ──────────────────────────────────────── */}
      <div className="hero-scanlines -z-10" />
      <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-0 h-64 w-64 rounded-full bg-violet-500/12 blur-3xl" />

      {/* ── Main content grid ─────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">

        {/* Left column — headline, CTA, trust */}
        <div className="animate-fadeInUp">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/12 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-50 shadow-[0_0_24px_rgba(3,233,244,0.16)]">
            <ShieldCheck className="h-4 w-4" />
            Produção local no Rio de Janeiro
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
            Impressão 3D com cara de{" "}
            <span className="text-gradient-brand">produto pronto</span>{" "}
            para vender, presentear e usar.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
            A MDH 3D reúne presentes criativos, peças geek, utilidades e
            projetos personalizados — catálogo com prova visual real,
            atendimento direto e produção no Rio de Janeiro.
          </p>

          {/* Trust chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {["Foto real", "Produção local RJ", "Pix visível", "Suporte humano"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Highlight bullets */}
          <div className="mt-8 grid gap-3 md:max-w-2xl">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item}
                className="surface-stat flex items-start gap-3 rounded-[22px] px-4 py-4 text-sm leading-7 text-white/80"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-glow shadow-[0_0_16px_rgba(3,233,244,0.7)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/catalogo" className="btn-primary gap-2">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Oi!%20Vim%20pelo%20site%20da%20MDH%203D%20e%20quero%20atendimento%20para%20comprar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              Falar no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary gap-2"
            >
              <Upload className="h-4 w-4" />
              Enviar STL
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.3mf"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Enviar arquivo STL para orçamento"
            />
          </div>

          {selectedFile ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/12 px-4 py-2 text-sm text-emerald-50 shadow-[0_0_20px_rgba(37,211,102,0.15)]">
              <Upload className="h-4 w-4" />
              Arquivo pronto para orçamento: {selectedFile}
            </div>
          ) : null}
        </div>

        {/* Right column — Bambu Lab A1 mini showcase + products */}
        <div className="glass-panel relative overflow-hidden border-white/12 p-6 md:p-7 lg:translate-y-2">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />

          {/* Printer identity */}
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/78">
            Bambu Lab A1 mini
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white">
            Calibração automática. Multicolor. Silenciosa. Plug and print.
          </h2>

          {/* Specs */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {PRINTER_SPECS.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="surface-stat flex flex-col items-center rounded-[22px] p-4 text-center"
              >
                <Icon className="mb-2 h-4 w-4 text-cyan-300/70" />
                <p className="text-[10px] uppercase leading-tight tracking-[0.15em] text-white/45">
                  {label}
                </p>
                <p className="mt-2 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="mt-5 grid gap-2">
            {PRINTER_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-white/4 px-4 py-3"
              >
                <span className="mt-0.5 text-base leading-none">{feat.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-snug text-white">
                    {feat.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/58">{feat.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout signal */}
          <div className="mt-5 rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-4 shadow-[0_0_28px_rgba(37,211,102,0.08)]">
            <div className="flex items-center gap-3 text-emerald-50">
              <QrCode className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">
                Pix, cartão e atendimento humano — sem redirecionar para gateway externo.
              </p>
            </div>
          </div>

          {/* Featured real pieces */}
          <div className="mt-5 grid gap-2">
            {featuredRealPieces.map((item) => (
              <Link
                key={item.id}
                href={getProductUrl(item)}
                className="group flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/45 hover:shadow-[0_18px_36px_rgba(3,233,244,0.12)]"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-black/20">
                  <SafeProductImage
                    candidates={[item.image || item.images[0]]}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">
                    Foto real
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white">
                    {item.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
                    <Clock3 className="h-3 w-3" />
                    <span>
                      A partir de R${" "}
                      {item.pricePix.toFixed(2).replace(".", ",")} no Pix
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-cyan-100 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll hint ───────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <Link
          href="#home-featured"
          className="group inline-flex flex-col items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/65 transition hover:text-cyan-100"
        >
          <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 backdrop-blur-sm">
            descer
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_22px_rgba(3,233,244,0.12)]">
            <ChevronDown className="h-4 w-4 animate-bounce text-cyan-100" />
          </span>
        </Link>
      </div>
    </section>
  );
}
