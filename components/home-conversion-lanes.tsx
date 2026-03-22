import Link from "next/link";
import { Boxes, Gift, MonitorSpeaker, Users } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const lanes = [
  {
    id: "comprar",
    title: "Comprar algo pronto para pedir",
    description: "Comece pelas peças com foto real, preço confirmado e caminho direto para checkout.",
    proof: "Foto real • preço claro • Pix em destaque",
    href: "/catalogo?mode=real",
    cta: "Ver fotos reais",
    subline: "Ideal para quem quer decidir com menos risco percebido.",
    icon: Gift,
  },
  {
    id: "personalizar",
    title: "Transformar uma ideia em presente",
    description: "Envie imagem, referência ou arquivo 3D para receber material, prazo e acabamento indicados.",
    proof: "Personalização • análise humana • produção local",
    href: "/imagem-para-impressao-3d",
    cta: "Enviar referência",
    subline: "Funciona bem para STL, imagem, ideia ou briefing rápido.",
    icon: Boxes,
  },
  {
    id: "setup",
    title: "Resolver setup, suporte ou organização",
    description: "Entre por itens utilitários quando o cliente quer algo funcional para mesa, estação de trabalho ou rotina.",
    proof: "utilidade real • ticket recorrente • compra objetiva",
    href: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o",
    cta: "Ver setup e organização",
    subline: "Ótima porta de entrada para compra racional e repetida.",
    icon: MonitorSpeaker,
  },
  {
    id: "lote",
    title: "Fechar lote para evento, marca ou lembrança",
    description: "A loja já atende chaveiros, brindes, nomes 3D e peças em quantidade com alinhamento por WhatsApp.",
    proof: "Lote • brindes • atendimento comercial",
    href: `https://wa.me/${whatsappNumber}?text=Quero%20fechar%20um%20lote%20de%20pecas%20personalizadas%20com%20a%20MDH%203D.`,
    cta: "Falar sobre lote",
    subline: "Melhor entrada para evento, empresa, escola ou lembrança em volume.",
    icon: Users,
    external: true,
  },
];

export function HomeConversionLanes() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-kicker">Entradas rápidas</p>
          <h2 className="section-title">Quatro caminhos para o cliente chegar no tipo certo de pedido sem girar a loja inteira.</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip-nav">compra pronta</span>
          <span className="chip-nav">personalização</span>
          <span className="chip-nav">setup útil</span>
          <span className="chip-nav">lote comercial</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {lanes.map((lane) => {
          const Icon = lane.icon;
          const className = "glass-panel p-8 transition-all duration-300 hover:-translate-y-1";

          if (lane.external) {
            return (
              <a
                key={lane.id}
                href={lane.href}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                <span className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-100/75">{lane.proof}</p>
                <h2 className="mt-3 text-2xl font-black text-white">{lane.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/68">{lane.description}</p>
                <p className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-xs leading-6 text-white/62">
                  {lane.subline}
                </p>
                <span className="btn-secondary mt-6 inline-flex">{lane.cta}</span>
              </a>
            );
          }

          return (
            <Link key={lane.id} href={lane.href} className={className}>
              <span className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-100/75">{lane.proof}</p>
              <h2 className="mt-3 text-2xl font-black text-white">{lane.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">{lane.description}</p>
              <p className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-xs leading-6 text-white/62">
                {lane.subline}
              </p>
              <span className="btn-secondary mt-6 inline-flex">{lane.cta}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
