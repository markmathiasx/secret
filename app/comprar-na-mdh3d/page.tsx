import type { Metadata } from "next";
import { PolicyPage } from "@/components/mdh-store/PolicyPage";

export const metadata: Metadata = {
  title: "Como comprar na MDH3D",
  description: "Entenda como comprar produtos MDH3D com checkout externo Nuvemshop ou orçamento pelo WhatsApp.",
  alternates: { canonical: "/comprar-na-mdh3d" },
};

export default function ComprarNaMdh3dPage() {
  return (
    <PolicyPage
      title="Como comprar na MDH3D"
      description="A loja inteligente usa o catálogo local do site e direciona cada produto para o melhor canal disponível."
      sections={[
        {
          title: "Produto com link Nuvemshop",
          body: "Quando o produto tiver link de checkout, o botão principal abre a Nuvemshop em nova aba para compra com Pix ou cartão.",
        },
        {
          title: "Produto sem link Nuvemshop",
          body: "Quando não houver link, o botão abre WhatsApp com nome, SKU e link da página já preenchidos para orçamento.",
        },
        {
          title: "Carrinho local",
          body: "Você pode montar uma lista no carrinho local e finalizar pelo WhatsApp com quantidades e total estimado.",
        },
      ]}
    />
  );
}
