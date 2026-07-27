"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Layers,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  TimerReset,
  Upload,
  Zap,
} from "lucide-react";
import { whatsappNumber } from "@/lib/constants";
import { getProductUrl } from "@/lib/product-routing";
import { verifiedCatalog } from "@/lib/verified-catalog";
import { SafeProductImage } from "@/components/safe-product-image";

const HERO_VIDEO = {
  src: null as string | null,
  poster: "/media/posters/hero-printer-poster.webp",
};

const HERO_SIGNALS = [
  "Mídia validada e prévia técnica separados",
  "Produção local no Rio",
  "Personalização com STL, imagem e briefing",
];

const HERO_STEPS = [
  {
    value: "01",
    title: "Ache a peça certa",
    body: "Comece por presente, utilidade, pronta entrega ou mídia validada sem navegar uma vitrine confusa.",
  },
  {
    value: "02",
    title: "Confirme sem ruído",
    body: "Página do produto, consultor e WhatsApp ajudam a validar material, prazo e acabamento.",
  },
  {
    value: "03",
    title: "Feche com clareza",
    body: "Pix, cartão, rastreio e pós-venda seguem no mesmo fluxo para evitar dúvida na hora de comprar.",
  },
] as const;

type HeroProps = {
  catalogCount: number;
  realPhotoCount: number;
  readyRealCount: number;
  ratingLabel: string;
  reviewCount?: number;
};

export function Hero({
  catalogCount,
  realPhotoCount,
  readyRealCount,
  ratingLabel,
  reviewCount,
}: HeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [enableVideo, setEnableVideo] = useState(true);
  const [closeoutClock, setCloseoutClock] = useState("hoje");
  const featuredRealPieces = verifiedCatalog.slice(0, 3);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator as Navigator & { connection?: { saveData?: boolean } };

    const syncMotionState = () => {
      const saveData = Boolean(connection.connection?.saveData);
      const mobileViewport = window.innerWidth < 768;
      const shouldReduce = motionQuery.matches;
      setReducedMotion(shouldReduce);
      setEnableVideo(!shouldReduce && !saveData && !mobileViewport);
    };

    syncMotionState();
    motionQuery.addEventListener("change", syncMotionState);
    window.addEventListener("resize", syncMotionState);

    return () => {
      motionQuery.removeEventListener("change", syncMotionState);
      window.removeEventListener("resize", syncMotionState);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!enableVideo) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  }, [enableVideo]);

  useEffect(() => {
    const syncCloseoutClock = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);
      setCloseoutClock(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    syncCloseoutClock();
    const timer = window.setInterval(syncCloseoutClock, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || !sectionRef.current) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    sectionRef.current.style.setProperty("--hero-spotlight-x", `${x.toFixed(2)}%`);
    sectionRef.current.style.setProperty("--hero-spotlight-y", `${y.toFixed(2)}%`);
  }

  function handlePointerLeave() {
    if (reducedMotion || !sectionRef.current) return;
    sectionRef.current.style.setProperty("--hero-spotlight-x", "32%");
    sectionRef.current.style.setProperty("--hero-spotlight-y", "24%");
  }

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

  const heroStyle = {
    "--hero-spotlight-x": "32%",
    "--hero-spotlight-y": "24%",
  } as CSSProperties;

  const proofTiles = [
    {
      label: "Peças públicas",
      value: catalogCount.toLocaleString("pt-BR"),
      helper: "somente itens seguros para exposição",
      icon: Layers,
      accent: "text-cyan-100",
    },
    {
      label: "Mídias validadas",
      value: String(realPhotoCount).padStart(2, "0"),
      helper: "prova visual mais forte para decidir",
      icon: ShieldCheck,
      accent: "text-emerald-100",
    },
    {
      label: "Pronta entrega",
      value: String(readyRealCount).padStart(2, "0"),
      helper: "itens com resposta comercial mais rápida",
      icon: Clock3,
      accent: "text-violet-100",
    },
  ] as const;

  return (
    <section
      ref={sectionRef}
      style={heroStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative isolate overflow-hidden px-6 pb-20 pt-8 md:pb-24 md:pt-10"
    >
      <div className="absolute inset-0 -z-30">
        {enableVideo && HERO_VIDEO.src ? (
          <video
            ref={videoRef}
            className="hero-video-layer h-full w-full object-cover"
            src={HERO_VIDEO.src}
            poster={HERO_VIDEO.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_VIDEO.poster})` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="hero-overlay absolute inset-0 -z-20" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90 transition-opacity duration-300"
        style={{
          background: [
            "radial-gradient(circle at var(--hero-spotlight-x) var(--hero-spotlight-y), rgba(3,233,244,0.18), transparent 16%)",
            "radial-gradient(circle at calc(var(--hero-spotlight-x) + 18%) calc(var(--hero-spotlight-y) + 8%), rgba(123,44,191,0.16), transparent 26%)",
          ].join(","),
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.22]" />
      <div className="hero-scanlines -z-10" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/12 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-50 shadow-[0_0_24px_rgba(3,233,244,0.16)]">
              <ShieldCheck className="h-4 w-4" />
              Fabricação digital com acabamento premium
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {HERO_SIGNALS.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72"
                >
                  {signal}
                </span>
              ))}
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.92] text-white md:text-7xl">
              Impressão 3D premium com{" "}
              <span className="text-gradient-brand">mídia validada</span>, produção local e acabamento de vitrine.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
              Explore presentes, utilidades, colecionáveis e projetos sob medida com uma jornada clara para comparar,
              validar detalhes e fechar no checkout ou no atendimento.
            </p>

            <div className="mt-7 grid max-w-3xl gap-3 rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50 shadow-[0_22px_60px_rgba(16,185,129,0.12)] md:grid-cols-[auto_1fr_auto] md:items-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/12">
                <TimerReset className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">Rodada de fechamento de hoje</p>
                <p className="mt-1 text-emerald-50/75">
                  Priorize {readyRealCount} pronta entrega e {realPhotoCount} itens com mídia validada antes de pedir orçamento sob medida.
                </p>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-black/20 px-4 py-2 font-mono text-sm font-bold text-emerald-100">
                {closeoutClock}
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/catalogo?intent=Compra%20r%C3%A1pida&mode=real" className="btn-primary gap-2">
                <ShoppingBag className="h-4 w-4" />
                Comprar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Oi!%20Quero%20tirar%20uma%20d%C3%BAvida%20antes%20de%20comprar%20na%20MDH%203D.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp gap-2"
              >
                <MessageCircleMore className="h-4 w-4" />
                Tirar dúvida agora
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

            <p className="mt-4 text-sm leading-7 text-white/58">
              Mídia validada, prévia técnica e projeto personalizado aparecem com sinalização clara antes de qualquer pagamento.
            </p>

            {selectedFile ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/12 px-4 py-2 text-sm text-emerald-50 shadow-[0_0_20px_rgba(37,211,102,0.15)]">
                <Upload className="h-4 w-4" />
                Arquivo pronto para orçamento: {selectedFile}
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 md:max-w-3xl md:grid-cols-3">
              {proofTiles.map(({ icon: Icon, label, value, helper, accent }) => (
                <div key={label} className="surface-stat rounded-[24px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</p>
                    <Icon className={`h-4 w-4 ${accent}`} />
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden border-white/12 p-6 md:p-7 lg:translate-y-2">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />

            <div className="relative">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/78">
                Decisão rápida
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                Escolha com menos dúvida e feche com mais segurança.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                A entrada do site já separa mídia validada, pronta entrega, personalizados e pagamento para encurtar o caminho entre descobrir, validar e comprar.
              </p>
            </div>

            <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
              <div className="surface-stat rounded-[22px] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Avaliações</p>
                <p className="mt-3 text-2xl font-black text-white">{ratingLabel}</p>
                <p className="mt-2 text-sm text-white/62">
                  {reviewCount ? `${reviewCount} sinais públicos já visíveis.` : "Atendimento direto, política clara e leitura honesta da vitrine."}
                </p>
              </div>
              <div className="surface-stat rounded-[22px] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Checkout</p>
                <p className="mt-3 flex items-center gap-2 text-2xl font-black text-white">
                  <QrCode className="h-5 w-5 text-emerald-200" />
                  Pix visível
                </p>
                <p className="mt-2 text-sm text-white/62">
                  Pix visível, cartão seguro quando disponível e status claros no pós-venda.
                </p>
              </div>
            </div>

            <div className="relative mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <Zap className="h-4 w-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Fluxo comercial visível</p>
              </div>

              <div className="mt-4 grid gap-3">
                {HERO_STEPS.map((step, index) => (
                  <div key={step.value} className="rounded-[20px] border border-white/8 bg-white/4 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">
                          {step.value}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{step.title}</p>
                          <p className="mt-1 text-xs leading-6 text-white/58">{step.body}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-300 transition-all duration-700"
                        style={{ width: `${(index + 1) * 33}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-5 grid gap-2">
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
                      Mídia validada
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white">
                      {item.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
                      <Clock3 className="h-3 w-3" />
                      <span>
                        A partir de R$ {item.pricePix.toFixed(2).replace(".", ",")} no Pix
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-cyan-100 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {[
            "Mídia validada, prévia técnica e imagem conceitual aparecem com selo claro na vitrine.",
            "Pix, acompanhamento e atendimento assistido seguem no mesmo fluxo de compra.",
            "Consultor e WhatsApp ajudam a escolher sem tirar o cliente do caminho de compra.",
            "Projetos sob medida aceitam STL, imagem e briefing com análise humana.",
          ].map((item) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white/66 backdrop-blur-sm">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <Link
          href="#home-featured"
          className="group inline-flex flex-col items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/65 transition hover:text-cyan-100"
        >
          <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 backdrop-blur-sm">
            ver catálogo
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_22px_rgba(3,233,244,0.12)]">
            <ChevronDown className="h-4 w-4 animate-bounce text-cyan-100" />
          </span>
        </Link>
      </div>
    </section>
  );
}
