import type { Metadata } from "next";
import Link from "next/link";
import { CustomQuoteForm } from "@/components/mdh-store/CustomQuoteForm";
import { StoreAnimatedBackground } from "@/components/mdh-store/StoreAnimatedBackground";
import { getStorefrontWhatsappNumber } from "@/lib/mdh-store/config";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Orçamento personalizado de impressão 3D",
  description: "Solicite orçamento de peça 3D personalizada com cor, material, quantidade, upload de referência e estimativa inicial.",
  alternates: { canonical: "/orcamento-personalizado" },
};

export default function OrcamentoPersonalizadoPage() {
  const siteUrl = getSiteUrl();
  const whatsappNumber = getStorefrontWhatsappNumber();

  return (
    <main className="store-animated-shell min-h-screen pb-14 text-white">
      <StoreAnimatedBackground />
      <section className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(3,7,13,0.76),rgba(3,7,13,0.42))] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/loja" className="text-sm font-bold text-cyan-100 underline-offset-4 hover:underline">
            Voltar para loja
          </Link>
          <p className="section-kicker mt-6">Personalizador 3D</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
            Orçamento sob medida com cálculo inicial
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
            Informe tipo de peça, medidas, cor, material, quantidade e referência. O site gera uma estimativa e abre o WhatsApp com o briefing pronto.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CustomQuoteForm whatsappNumber={whatsappNumber} siteUrl={siteUrl} />
      </section>
    </main>
  );
}
