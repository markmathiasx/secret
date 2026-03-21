import Link from "next/link";
import { Boxes, Gift, Users } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const lanes = [
  {
    id: "comprar",
    title: "Comprar algo pronto para pedir",
    description: "Comece pelas peças com foto real, preço confirmado e caminho direto para checkout.",
    proof: "Foto real • preço claro • Pix em destaque",
    href: "/catalogo?mode=verified",
    cta: "Ver peças validadas",
    icon: Gift,
  },
  {
    id: "personalizar",
    title: "Transformar uma ideia em presente",
    description: "Envie imagem, referência ou arquivo 3D para receber material, prazo e acabamento indicados.",
    proof: "Personalização • análise humana • produção local",
    href: "/imagem-para-impressao-3d",
    cta: "Enviar referência",
    icon: Boxes,
  },
  {
    id: "lote",
    title: "Fechar lote para evento, marca ou lembrança",
    description: "A loja já atende chaveiros, brindes, nomes 3D e peças em quantidade com alinhamento por WhatsApp.",
    proof: "Lote • brindes • atendimento comercial",
    href: `https://wa.me/${whatsappNumber}?text=Quero%20fechar%20um%20lote%20de%20pecas%20personalizadas%20com%20a%20MDH%203D.`,
    cta: "Falar sobre lote",
    icon: Users,
    external: true,
  },
];

export function HomeConversionLanes() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid gap-5 lg:grid-cols-3">
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
              <span className="btn-secondary mt-6 inline-flex">{lane.cta}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
