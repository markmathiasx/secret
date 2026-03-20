"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, MessageCircleMore, QrCode, ShieldCheck, Upload } from "lucide-react";
import { pix, whatsappNumber } from "@/lib/constants";
import { getProductUrl } from "@/lib/catalog";
import { verifiedCatalog } from "@/lib/verified-catalog";
import { SafeProductImage } from "@/components/safe-product-image";

const highlights = [
  "Presentes personalizados, utilidades, decoração e projetos sob medida",
  "Portfólio com foto real para reduzir dúvida e melhorar a confiança",
  "Pix direto, atendimento humano e produção local no Rio de Janeiro",
];

const quickFacts = [
  { label: "Prova visual", value: "Fotos reais" },
  { label: "Pagamento", value: "Pix imediato" },
  { label: "Atendimento", value: "Humano" },
];

export function Hero() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const featuredRealPieces = verifiedCatalog.slice(0, 3);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = [".stl", ".obj", ".3mf"];
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(extension)) {
      alert("Arquivo inválido. Aceite apenas .stl, .obj ou .3mf.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo excede 50MB.");
      return;
    }

    setSelectedFile(file.name);
  }

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pb-24 md:pt-32">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(92,225,230,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(45,198,124,0.12),transparent_26%),linear-gradient(180deg,rgba(2,7,11,0.75),rgba(2,7,11,0.92))]" />
      <div className="absolute inset-0 -z-30">
        <video
          className="h-full w-full object-cover opacity-15"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/images/placeholders/hero-fallback.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="animate-fadeInUp">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-50">
            <ShieldCheck className="h-4 w-4" />
            Produção local no Rio de Janeiro
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
            Impressão 3D com cara de produto pronto para vender, presentear e usar.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            A MDH 3D reúne presentes criativos, peças geek, utilidades e projetos personalizados com catálogo claro, prova visual real e atendimento direto para fechar o pedido sem ruído.
          </p>

          <div className="mt-8 grid gap-3 md:max-w-2xl">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/76">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-glow" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary gap-2">
              <Upload className="h-4 w-4" />
              Enviar STL
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.3mf"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Enviar arquivo STL"
            />
          </div>

          {selectedFile ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-50">
              <Upload className="h-4 w-4" />
              Arquivo pronto para orçamento: {selectedFile}
            </div>
          ) : null}
        </div>

        <div className="glass-panel relative overflow-hidden border-white/12 p-6 md:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Destaques comerciais</p>
          <h2 className="mt-3 text-3xl font-black text-white">Uma vitrine pensada para convencer pelo valor e pela prova real.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            O cliente encontra preço no Pix, caminho de personalização, referências reais de acabamento e um canal humano para fechar a compra com segurança.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {quickFacts.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-base font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="flex items-center gap-3 text-emerald-50">
              <QrCode className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Pix em destaque</p>
            </div>
            <p className="mt-3 text-2xl font-black text-white">Chave {pix.key}</p>
            <p className="mt-2 text-sm leading-7 text-white/68">
              O checkout mostra chave, QR Code e código copia e cola para acelerar o fechamento de pedidos simples.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {featuredRealPieces.map((item) => (
              <Link
                key={item.id}
                href={getProductUrl(item)}
                className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/5 p-3 transition hover:border-cyan-300/30"
              >
                <div className="h-20 w-20 overflow-hidden rounded-[18px] border border-white/10 bg-black/20">
                  <SafeProductImage candidates={[item.image || item.images[0]]} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Foto real</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-white/55">A partir de R$ {item.pricePix.toFixed(2).replace(".", ",")} no Pix</p>
                </div>
                <ArrowRight className="h-4 w-4 text-cyan-100" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
