import type { Metadata } from "next";
import { supportEmail, whatsappNumber } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description:
    "Condições para análise de defeito, divergência de produção, itens personalizados e devoluções na MDH 3D.",
  alternates: {
    canonical: "/trocas-e-devolucoes",
  },
};

const sections = [
  {
    title: "1. Peças com defeito de produção",
    body: [
      "Se a peça chegar com falha de produção, quebra operacional, deformação relevante ou divergência material daquilo que foi aprovado, a MDH 3D analisa o caso para reimpressão, ajuste ou solução equivalente.",
      "Para acelerar a análise, envie fotos claras da peça, código do pedido e um resumo objetivo do problema encontrado.",
    ],
  },
  {
    title: "2. Itens personalizados",
    body: [
      "Projetos sob medida, personalizados e produzidos a partir de briefing do cliente exigem revisão prévia de referência, escala e material. Nesses casos, troca ou devolução não se aplica por simples arrependimento após a produção já alinhada.",
      "Se houver erro comprovado de execução em relação ao que foi aprovado, a MDH 3D revisa o pedido e define a melhor solução operacional.",
    ],
  },
  {
    title: "3. Prazo para reporte",
    body: [
      "O ideal é reportar qualquer problema assim que o produto for recebido. Quanto mais cedo a divergência for registrada, mais rápida tende a ser a tratativa.",
      "Em situações de transporte, embalagem avariada ou peça quebrada no recebimento, registre imagens do pacote e do item no mesmo contato.",
    ],
  },
  {
    title: "4. O que normalmente não entra como defeito",
    body: [
      "Pequenas variações naturais de acabamento, marca de camada compatível com impressão 3D, leve diferença tonal entre lotes e decisões já aprovadas de material não configuram automaticamente defeito de produção.",
      "Peças expostas a mau uso, calor excessivo, queda ou alteração posterior feita fora da MDH 3D também podem ficar fora de cobertura.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Pós-venda</p>
        <h1 className="mt-3 text-4xl font-black text-white">Trocas, devoluções e análise de divergência</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
          A MDH 3D trata troca e devolução com foco em defeito de produção, divergência operacional e análise justa do
          que foi aprovado no pedido.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          "Defeito real de produção entra em análise para reimpressão ou ajuste.",
          "Projeto personalizado depende do briefing aprovado antes da fabricação.",
          "Fotos do item e do pacote ajudam a resolver o caso mais rápido.",
        ].map((item) => (
          <div key={item} className="glass-panel p-6 text-sm leading-7 text-white/68">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5">
        {sections.map((section) => (
          <article key={section.title} className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-white/68">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="glass-panel mt-8 p-6 text-sm leading-7 text-white/68">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Como abrir a análise</p>
        <p className="mt-3">
          Envie o número do pedido, fotos do item e um resumo do ocorrido para <span className="text-white">{supportEmail}</span> ou pelo
          WhatsApp <span className="text-white">+{whatsappNumber.replace(/\D/g, "")}</span>.
        </p>
      </div>
    </section>
  );
}
