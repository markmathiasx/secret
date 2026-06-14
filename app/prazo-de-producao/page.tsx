import type { Metadata } from "next";
import { PolicyPage } from "@/components/mdh-store/PolicyPage";

export const metadata: Metadata = {
  title: "Prazo de produção",
  description: "Prazos de produção para peças MDH3D em impressão 3D.",
  alternates: { canonical: "/prazo-de-producao" },
};

export default function PrazoDeProducaoPage() {
  return (
    <PolicyPage
      title="Prazo de produção"
      description="Cada peça passa por preparação, impressão, acabamento e conferência antes da entrega."
      sections={[
        { title: "Prazo padrão", body: "Produtos da vitrine local usam prazo estimado de 2 a 5 dias úteis quando o CSV não informar prazo específico." },
        { title: "Fila e personalização", body: "Pedidos personalizados podem exigir mais tempo por ajuste de arquivo, cor, escala e acabamento." },
        { title: "Confirmação final", body: "O prazo final é confirmado no checkout externo ou pelo WhatsApp antes da conclusão do pedido." },
      ]}
    />
  );
}
