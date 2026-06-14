import type { Metadata } from "next";
import { PolicyPage } from "@/components/mdh-store/PolicyPage";

export const metadata: Metadata = {
  title: "Termos de compra",
  description: "Termos de compra da loja inteligente MDH3D.",
  alternates: { canonical: "/termos-de-compra" },
};

export default function TermosDeCompraPage() {
  return (
    <PolicyPage
      title="Termos de compra"
      description="Ao comprar ou solicitar orçamento, você concorda com os prazos, condições e canais descritos no site."
      sections={[
        { title: "Checkout externo", body: "A Nuvemshop pode ser usada como checkout externo quando houver link de produto no CSV." },
        { title: "Orçamento pelo WhatsApp", body: "Produtos sem link de checkout são negociados pelo WhatsApp com validação de preço, cor, prazo e disponibilidade." },
        { title: "Preço estimado", body: "O carrinho local calcula subtotal estimado; personalizações e frete podem alterar o valor final confirmado no atendimento." },
      ]}
    />
  );
}
