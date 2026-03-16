import Link from "next/link";
import { MapPin, MessageCircleMore, ShieldCheck, Truck } from "lucide-react";
import { brand, whatsappMessage, whatsappNumber } from "@/lib/constants";

const trustPoints = [
  {
    title: "Entrega local no RJ",
    text: "Rotas próprias, retirada combinada e estimativa de frete por CEP."
  },
  {
    title: "Atendimento consultivo",
    text: "Você aprova material, cor, prazo e acabamento antes de fechar."
  },
  {
    title: "Produção com acabamento",
    text: "Cada peça passa por revisão visual antes de seguir para retirada ou entrega."
  }
];

export function Hero() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="relative isolate min-h-[calc(100vh-5.5rem)] overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/backgrounds/hero-printer-fallback.jpg"
        >
          <source src="/media/hero-printer-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,22,0.42),rgba(4,8,22,0.82)_42%,rgba(4,8,22,0.96)),radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_26%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-7xl flex-col justify-between px-6 py-10">
        <div className="max-w-4xl pt-6 md:pt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
            <MapPin className="h-3.5 w-3.5" />
            {brand.city}, {brand.state}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
            Impressão 3D sob medida para presentes, utilidades e colecionáveis com acabamento premium no Rio de Janeiro.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            Produzimos peças personalizadas, presentes, utilidades e linhas geek com operação local, vídeo real de processo e experiência de compra limpa para visitante e cliente logado.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalogo" className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]">
              Ver catálogo
            </Link>
            <a
              href={whatsappHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/12"
            >
              <MessageCircleMore className="h-4 w-4" />
              Pedir orçamento
            </a>
          </div>
        </div>

        <div className="grid gap-4 pb-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {trustPoints.map((item) => (
              <div key={item.title} className="glass-panel rounded-[28px] p-5">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-[28px] p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-white/10 bg-black/25 p-2 text-amber-100">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
              <p className="text-sm font-semibold text-white">Compra orientada para conversão</p>
                <p className="text-sm text-white/62">Pix, cartão e boleto com briefing claro, confirmação manual e WhatsApp sempre visível.</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
              <Truck className="h-5 w-5 text-cyan-100" />
              <p>Pedidos locais podem sair por entrega própria ou retirada combinada, com janela de prazo alinhada antes do fechamento.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
