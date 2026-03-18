"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CreditCard, MessageCircleMore, QrCode, ShieldCheck, Upload } from "lucide-react";

const highlights = [
  "Peças prontas, presentes criativos e produção sob encomenda",
  "Pix direto para fechamento rápido e cartão com checkout seguro",
  "Atendimento humano no WhatsApp com operação local no Rio de Janeiro"
];

const quickFacts = [
  { label: "Pix direto", value: "21974137662" },
  { label: "Cartão", value: "Mercado Pago" },
  { label: "Login", value: "Conta segura" }
];

export function Hero() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          className="h-full w-full object-cover opacity-20"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/images/placeholders/hero-fallback.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
      </div>

      <div className={`mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end ${mounted ? "animate-fadeInUp" : "opacity-0"}`}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-50">
            <ShieldCheck className="h-4 w-4" />
            Estúdio 3D com operação local no Rio de Janeiro
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
            Impressão 3D com apresentação premium, checkout forte e atendimento direto.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            A MDH 3D foi reorganizada para vender melhor: catálogo mais profissional, pedido com código, Pix visível no checkout, cartão via provedor seguro e conta própria para o cliente voltar e comprar de novo.
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
            <Link href="/checkout" className="btn-primary gap-2">
              Fechar pedido agora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/5521920137249?text=Oi! Vim pelo site da MDH 3D e quero atendimento para comprar."
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
              Arquivo pronto para envio: {selectedFile}
            </div>
          ) : null}
        </div>

        <div className="glass-panel relative overflow-hidden border-white/12 p-6 md:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Painel comercial</p>
          <h2 className="mt-3 text-3xl font-black text-white">Uma vitrine mais pronta para vender.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            O fluxo foi redesenhado para reduzir abandono: o cliente entende o valor, escolhe a forma de pagamento e encontra suporte sem precisar improvisar.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {quickFacts.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-base font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-5">
              <div className="flex items-center gap-3 text-emerald-50">
                <QrCode className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Pix em destaque</p>
              </div>
              <p className="mt-3 text-2xl font-black text-white">Chave 21974137662</p>
              <p className="mt-2 text-sm leading-7 text-white/68">O checkout exibe QR Code, copia e cola e a chave direta para acelerar o fechamento de pedidos simples.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <CreditCard className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Cartão de crédito</p>
              </div>
              <p className="mt-3 text-base font-bold text-white">Checkout hospedado pelo Mercado Pago</p>
              <p className="mt-2 text-sm leading-7 text-white/68">O cliente sai do site apenas para concluir o pagamento em ambiente seguro e depois retorna com o status da cobrança.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
