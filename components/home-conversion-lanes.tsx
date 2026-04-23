import Link from "next/link";
import { Boxes, Gift, Users } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const lanes = [
  {
    id: "catalogo",
    title: "Comprar pelo catalogo",
    description:
      "Entre por itens prontos com preco visivel, foto sinalizada, comparacao mais rapida e caminho direto para checkout ou WhatsApp.",
    proof: "catalogo filtrado • preco no Pix • prova visual",
    budget: "Faixa de entrada a partir de itens compactos e pronta entrega quando existir.",
    href: "/catalogo",
    cta: "Abrir catalogo comercial",
    detail: "Melhor rota para quem ja quer comparar opcoes reais e decidir sem briefing longo.",
    icon: Gift,
  },
  {
    id: "personalizado",
    title: "Personalizar presente ou projeto",
    description:
      "Use esta rota para miniatura, nome 3D, presente afetivo, peca funcional ou qualquer ideia que precise de referencia, arquivo ou medida.",
    proof: "briefing simples • atendimento humano • projeto sob medida",
    budget: "Faixa inicial definida pelo briefing, escala, acabamento e nivel de ajuste pedido.",
    href: "/projetos-sob-medida-3d-rio-de-janeiro",
    cta: "Enviar referencia ou ideia",
    detail: "Boa entrada para STL, imagem, medida, nome, personagem, suporte e presente personalizado.",
    icon: Boxes,
  },
  {
    id: "lote",
    title: "Fechar lote, brinde ou acao comercial",
    description:
      "Comece aqui quando quantidade, prazo, logo e repeticao do modelo importam mais do que navegar item por item no catalogo.",
    proof: "lote comercial • chaveiros e medalhas • atendimento direto",
    budget: "Faixa por quantidade, acabamento e repeticao do modelo, sem promessa vaga de valor unico.",
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero fechar um lote personalizado com a MDH 3D. Pode me orientar sobre quantidade, prazo e faixa inicial?")}`,
    cta: "Falar sobre lote agora",
    detail: "Melhor rota para empresa, escola, evento, lembranca e campanha com volume pequeno ou medio.",
    icon: Users,
    external: true,
  },
] as const;

export function HomeConversionLanes() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-kicker">Tres funis principais</p>
          <h2 className="section-title">A home agora empurra cada visitante para a rota comercial certa ja no primeiro scroll util.</h2>
          <p className="section-copy mt-4">
            Em vez de tentar vender tudo com a mesma linguagem, a MDH 3D separa compra pronta, personalizado/projeto e lote comercial como entradas principais de aquisicao.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip-nav">catalogo</span>
          <span className="chip-nav">personalizado</span>
          <span className="chip-nav">lote comercial</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {lanes.map((lane) => {
          const Icon = lane.icon;
          const className = "glass-panel flex h-full flex-col p-8 transition-all duration-300 hover:-translate-y-1";

          const content = (
            <>
              <span className="inline-flex w-fit rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-100/75">{lane.proof}</p>
              <h3 className="mt-3 text-3xl font-black text-white">{lane.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/68">{lane.description}</p>
              <div className="mt-4 rounded-[18px] border border-emerald-300/15 bg-emerald-300/8 px-4 py-3 text-sm leading-7 text-emerald-50/90">
                {lane.budget}
              </div>
              <p className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-xs leading-6 text-white/62">
                {lane.detail}
              </p>
              <span className="btn-secondary mt-6 inline-flex">{lane.cta}</span>
            </>
          );

          return lane.external ? (
            <a key={lane.id} href={lane.href} target="_blank" rel="noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <Link key={lane.id} href={lane.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
