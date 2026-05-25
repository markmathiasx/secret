import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, Instagram, MessageCircleMore, ShoppingBag } from "lucide-react";
import { GameHub } from "@/components/game/GameHub";
import { CinematicVideoBackground } from "@/components/media/CinematicVideoBackground";
import { whatsappNumber } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Arcade MDH 3D — Games de Impressão 3D",
  description: "Divirta-se com mini-games originais da MDH 3D. Desvie de falhas, colete filamentos e ganhe benefícios exclusivos.",
};

export default function JoguePage() {
  return (
    <main className="relative min-h-screen bg-slate-950">
      <CinematicVideoBackground
        variant="catalog"
        overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.95),rgba(2,6,23,0.75)_50%,rgba(2,6,23,0.92)),linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.96))]"
      />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
              <Gamepad2 className="h-3.5 w-3.5" />
              Arcade Experimental
            </div>
            <h1 className="mt-4 text-5xl font-black text-white md:text-6xl tracking-tight">
              Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">MDH 3D</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Transformamos falhas de impressão em diversão. Explore nosso hub de mini-games originais e mostre que você é um mestre da manufatura aditiva.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="btn-zap gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              Suporte VIP
            </a>
            <a
              href="https://www.instagram.com/mdh_3d.com.br/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary gap-2"
            >
              <Instagram className="h-4 w-4" />
              @mdh_3d.com.br
            </a>
            <Link href="/catalogo" className="btn-primary gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver Catálogo
            </Link>
          </div>
        </div>

        <GameHub />
      </section>

      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/backgrounds/grid-pattern.svg')] bg-center opacity-[0.03]" />
    </main>
  );
}
