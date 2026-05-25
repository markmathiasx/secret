import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MessageCircleMore, ShoppingBag } from "lucide-react";
import { PrintQuestGame } from "@/components/game/PrintQuestGame";
import { CinematicVideoBackground } from "@/components/media/CinematicVideoBackground";
import { whatsappNumber } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Print Quest | MDH 3D",
  description: "Mini-game original da MDH 3D com tema de impressão 3D retrô, pontos e atendimento manual pelo WhatsApp.",
  alternates: { canonical: "/jogue" },
};

function whatsappHref() {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Vim pelo Print Quest e quero escolher um produto MDH 3D com Pix e cartão.")}`;
}

export default function JoguePage() {
  return (
    <main className="min-h-screen bg-[#071016] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 py-10 sm:px-6 lg:py-14">
        <CinematicVideoBackground
          variant="catalog"
          overlayClassName="bg-[linear-gradient(90deg,rgba(2,6,23,0.95),rgba(2,6,23,0.68)_50%,rgba(2,6,23,0.90)),linear-gradient(180deg,rgba(2,6,23,0.10),rgba(2,6,23,0.96))]"
          objectPosition="center"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="section-kicker">Jogue no site</p>
              <h1 className="mt-3 text-5xl font-black leading-none text-white sm:text-7xl">Print Quest</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                Um mini-game original de impressão 3D retrô para segurar a visita no site e puxar atendimento humano no WhatsApp.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/catalogo" className="btn-primary justify-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Ver catálogo
                </Link>
                <a href={whatsappHref()} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2">
                  <MessageCircleMore className="h-4 w-4" />
                  Comprar pelo WhatsApp
                </a>
                <Link href="/" className="btn-secondary justify-center gap-2">
                  Voltar à home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <PrintQuestGame />
          </div>
        </div>
      </section>
    </main>
  );
}
