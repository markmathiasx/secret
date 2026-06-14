import type { Metadata } from "next";
import { PolicyPage } from "@/components/mdh-store/PolicyPage";

export const metadata: Metadata = {
  title: "Política de envio",
  description: "Política de envio para produtos MDH3D feitos sob encomenda ou comprados em checkout externo.",
  alternates: { canonical: "/politica-de-envio" },
};

export default function PoliticaDeEnvioPage() {
  return (
    <PolicyPage
      title="Política de envio"
      description="O prazo final depende de produção, acabamento e modalidade combinada no atendimento ou checkout externo."
      sections={[
        { title: "Produção antes do envio", body: "Produtos sob encomenda entram em fila de produção antes da postagem ou retirada." },
        { title: "Endereço e confirmação", body: "Dados de entrega devem ser confirmados no checkout externo ou no atendimento via WhatsApp." },
        { title: "Acompanhamento", body: "A MDH3D informa o status do pedido pelo canal usado na compra." },
      ]}
    />
  );
}
