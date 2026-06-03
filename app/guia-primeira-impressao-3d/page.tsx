import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { getSiteUrl } from "@/lib/env";
import { LeadMagnetForm } from "@/components/lead-magnet-form";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Guia: Como escolher sua primeira impressão 3D | MDH 3D Rio",
  description: "Baixe o guia prático da MDH 3D para escolher material, acabamento, prazo e orçamento da sua primeira impressão 3D.",
  alternates: { canonical: `${siteUrl}/guia-primeira-impressao-3d` },
};

export default function LeadMagnetPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-18">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.88fr] lg:items-center">
        <div>
          <p className="section-kicker">Guia gratuito</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Como escolher sua primeira impressão 3D.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
            Um checklist direto para decidir material, cor, tamanho, acabamento e prazo sem cair em orçamento confuso.
          </p>
          <div className="mt-8 grid gap-3">
            {["Material certo para o uso", "Como estimar tamanho e resistência", "O que enviar no briefing", "Quando pedir mídia validada ou render"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/78">
                <CheckCircle2 className="h-4 w-4 text-emerald-100" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Captura de lead</p>
              <h2 className="text-2xl font-black text-white">Receba o guia e avance para orçamento.</h2>
            </div>
          </div>

          <LeadMagnetForm />

          <p className="mt-4 text-xs leading-6 text-white/52">
            Você também pode ir direto para a página de orçamento se já tiver STL, imagem ou medidas.
          </p>
          <Link href="/imagem-para-impressao-3d" className="mt-3 inline-flex text-sm font-semibold text-cyan-100">
            Enviar projeto agora
          </Link>
        </div>
      </section>
    </main>
  );
}
