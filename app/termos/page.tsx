import type { Metadata } from "next";
import { brand, supportEmail } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Regras de compra, orçamento, produção, personalização, arquivos enviados e uso do site da MDH 3D.",
  alternates: {
    canonical: "/termos",
  },
};

const sections = [
  {
    title: "1. Escopo da loja",
    body: [
      "A MDH 3D comercializa peças do catálogo, projetos sob medida, arquivos enviados para validação e itens personalizados produzidos sob demanda.",
      "Cada produto pode ter uma rota diferente de fechamento: compra direta, orçamento guiado ou personalização com análise humana.",
    ],
  },
  {
    title: "2. Orçamento, briefing e aprovação",
    body: [
      "Prazos, materiais, cores, escala e acabamento dependem do briefing final aprovado. Em itens personalizados, o cliente é responsável por revisar o que foi alinhado antes da produção começar.",
      "Quando a compra depende de arquivo, referência ou medida, a MDH 3D pode recusar, pausar ou revisar a produção se o material enviado estiver incompleto ou incompatível.",
    ],
  },
  {
    title: "3. Preços e pagamento",
    body: [
      "Os valores exibidos no site podem representar preço auditado para compra direta ou faixa inicial para encomenda. O atendimento pode confirmar ou ajustar o valor final conforme complexidade, escala, material e quantidade.",
      "O fechamento do pedido depende da confirmação de pagamento pelos meios oferecidos pela operação no momento da compra.",
    ],
  },
  {
    title: "4. Produção e prazo",
    body: [
      "O prazo final considera produção, acabamento e entrega. Itens em pronta entrega e projetos sob encomenda seguem janelas diferentes.",
      "A MDH 3D pode reorganizar a fila quando houver revisão técnica, volume elevado, mudança de briefing ou necessidade de reimpressão.",
    ],
  },
  {
    title: "5. Personalização e arquivos enviados",
    body: [
      "Ao enviar imagem, STL, OBJ, 3MF ou qualquer referência, o cliente declara que possui autorização para usar esse material no contexto solicitado.",
      "A MDH 3D não assume autoria intelectual do arquivo enviado pelo cliente e também não responde por limitações do modelo original quando elas não puderem ser corrigidas no fluxo de impressão.",
    ],
  },
  {
    title: "6. Uso do site",
    body: [
      "Não é permitido usar o site para fraude, tentativa de invasão, extração abusiva de dados, envio de arquivo malicioso ou qualquer atividade que comprometa a operação.",
      "A loja pode remover pedidos, acessos ou solicitações que violem este termo ou gerem risco técnico, jurídico ou operacional.",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Termos</p>
        <h1 className="mt-3 text-4xl font-black text-white">Termos de uso e compra da {brand.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
          Este documento organiza as regras de navegação, orçamento, compra, produção e personalização usadas na operação
          da loja para reduzir ruído antes do fechamento.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          "Produtos do catálogo podem ter compra direta ou aprovação comercial antes da produção.",
          "Projetos personalizados dependem de briefing claro, arquivo compatível e validação humana.",
          "Prazos e valores podem mudar quando o escopo real divergir da referência inicial.",
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
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Suporte e revisão</p>
        <p className="mt-3">
          Se você precisar revisar um pedido, um briefing ou uma condição comercial, fale com a equipe pelo email{" "}
          <span className="text-white">{supportEmail}</span> antes do início da produção.
        </p>
      </div>
    </section>
  );
}
