import type { Metadata } from "next";
import { PolicyPage } from "@/components/mdh-store/PolicyPage";

export const metadata: Metadata = {
  title: "Política de troca",
  description: "Regras de troca para produtos MDH3D em impressão 3D.",
  alternates: { canonical: "/politica-de-troca" },
};

export default function PoliticaDeTrocaPage() {
  return (
    <PolicyPage
      title="Política de troca"
      description="A análise de troca considera o tipo de produto, personalização e condição da peça recebida."
      sections={[
        { title: "Direito de arrependimento", body: "Compras online têm direito de arrependimento em até 7 dias corridos, conforme o Código de Defesa do Consumidor, art. 49. Peças personalizadas exigem análise do briefing aprovado e do estágio de produção." },
        { title: "Peças personalizadas", body: "Produtos feitos com nome, tema, cor ou medida específica podem ter restrição de troca por arrependimento quando já houver produção alinhada ao briefing aprovado." },
        { title: "Defeito de fabricação", body: "Caso exista defeito de produção, envie fotos e número do pedido pelo WhatsApp para avaliação." },
        { title: "Prazo de contato", body: "Entre em contato assim que identificar o problema para preservar histórico, embalagem e evidências da peça." },
      ]}
    />
  );
}
