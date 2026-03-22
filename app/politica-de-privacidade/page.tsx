import type { Metadata } from "next";
import { brand, supportEmail, whatsappNumber } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Entenda como a MDH 3D trata dados enviados pelo site, formulários, checkout, WhatsApp e pedidos personalizados.",
  alternates: {
    canonical: "/politica-de-privacidade",
  },
};

const sections = [
  {
    title: "1. Dados que coletamos",
    body: [
      "Podemos coletar nome, email, telefone, dados de entrega, arquivos enviados para orçamento, histórico de navegação, favoritos, pedidos e interações feitas pelo site.",
      "Quando você envia uma referência, STL, OBJ, 3MF, imagem ou briefing, esses dados entram no fluxo operacional da MDH 3D para análise comercial, técnica e produção.",
    ],
  },
  {
    title: "2. Como usamos esses dados",
    body: [
      "Usamos os dados para responder atendimento, montar orçamento, validar arquivo, confirmar material, calcular prazo, preparar pedido, organizar entrega e manter histórico básico da jornada do cliente.",
      "Também podemos usar os dados para retomar um atendimento iniciado por você, enviar confirmação de pedido ou concluir ajustes que ficaram pendentes no briefing.",
    ],
  },
  {
    title: "3. Compartilhamento e parceiros",
    body: [
      "Os dados podem ser compartilhados apenas com parceiros e serviços necessários para a operação do site, do pagamento, do armazenamento e da entrega.",
      "A MDH 3D não vende base de dados de clientes. O compartilhamento operacional ocorre apenas quando necessário para processar pedido, pagamento, contato ou hospedagem.",
    ],
  },
  {
    title: "4. Arquivos e referências visuais",
    body: [
      "Arquivos enviados para orçamento ou produção são tratados como material operacional da solicitação. Eles podem ser usados para analisar viabilidade, escala, acabamento e preparação técnica do pedido.",
      "Quando houver necessidade de divulgação de peça produzida, a MDH 3D preserva o direito de revisar isso caso a caso, especialmente em projetos personalizados ou sensíveis.",
    ],
  },
  {
    title: "5. Retenção e segurança",
    body: [
      "Mantemos dados pelo tempo necessário para atendimento, organização do pedido, suporte pós-venda, obrigações operacionais e histórico comercial básico.",
      "Aplicamos medidas técnicas razoáveis de segurança no site e nos fluxos internos, mas nenhum ambiente conectado à internet oferece risco zero.",
    ],
  },
  {
    title: "6. Seus direitos",
    body: [
      "Você pode pedir atualização, correção ou exclusão de dados pessoais que não precisem ser mantidos por obrigação operacional, financeira ou legal.",
      "Também pode solicitar esclarecimentos sobre como seus dados foram usados em um atendimento específico da loja.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Privacidade</p>
        <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade da MDH 3D</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
          Esta política resume como a {brand.name} trata dados enviados pelo site, pelo checkout, pelo WhatsApp e pelos
          formulários de personalização para manter atendimento, orçamento e produção com clareza.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          "Dados usados apenas para atendimento, produção e operação do pedido.",
          "Arquivos enviados entram no fluxo técnico da solicitação.",
          "Pedidos de atualização ou remoção podem ser tratados pelo suporte.",
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
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Contato para privacidade</p>
        <p className="mt-3">
          Para revisar um atendimento, corrigir dados ou pedir esclarecimentos, use o email <span className="text-white">{supportEmail}</span> ou o
          WhatsApp <span className="text-white">+{whatsappNumber.replace(/\D/g, "")}</span>.
        </p>
      </div>
    </section>
  );
}
