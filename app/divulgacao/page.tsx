import Link from "next/link";
import type { Metadata } from "next";
import { ContentPlaybook } from "@/components/content-playbook";

export const metadata: Metadata = {
  title: "Portfólio e conteúdo",
  description:
    "Bastidores, ângulos de divulgação e repertório visual para mostrar peças reais, processo e diferenciais da MDH 3D.",
  alternates: {
    canonical: "/divulgacao",
  },
};

export default function DivulgacaoPage() {
  const channelPlans = [
    {
      title: "Instagram Reels",
      description: "Use bastidores curtos, retirada da mesa, antes/depois e close de acabamento para construir confiança visual rápido.",
    },
    {
      title: "WhatsApp Status",
      description: "Mostre pronta entrega, peças do dia e blocos de urgência para gerar resposta rápida sem exigir edição longa.",
    },
    {
      title: "Catálogo do site",
      description: "Suba fotos mais claras, provas reais e narrativas de uso para reduzir abandono antes do clique no produto.",
    },
  ];
  const weeklyCadence = [
    "Segunda: bastidor real de produção ou retirada da mesa.",
    "Quarta: comparação de acabamento, material ou antes/depois.",
    "Sexta: peça pronta com preço, prazo e CTA direto para WhatsApp ou catálogo.",
    "Fim de semana: prova social, presente, pronta entrega ou lote em destaque.",
  ];
  const contentAngles = [
    {
      title: "Antes e depois da referência",
      body: "Mostre a imagem ou ideia inicial e depois a peça já impressa em contexto real. Isso reduz dúvida sobre fidelidade e dá autoridade visual para a MDH 3D.",
    },
    {
      title: "Peça pronta para presente",
      body: "Enquadre a peça em ambiente limpo, cite prazo, uso e impacto visual. Feche com CTA curto para presente, sem excesso de texto promocional.",
    },
    {
      title: "Utilidade real em bancada ou setup",
      body: "Mostre o problema primeiro e a peça resolvendo depois. Esse formato costuma converter melhor para suportes, organizadores e itens funcionais.",
    },
    {
      title: "Conteúdo de lote ou repetição",
      body: "Agrupe várias unidades, explique consistência de produção e chame para orçamento comercial no WhatsApp. Isso ajuda quando a venda não é unitária.",
    },
  ];
  const routeCards = [
    { label: "Curar catálogo", href: "/catalogo?mode=verified", note: "abrir itens com visual mais forte para reutilizar em divulgação" },
    { label: "Mandar referência", href: "/imagem-para-impressao-3d", note: "levar uma ideia nova para virar peça e conteúdo ao mesmo tempo" },
    { label: "Falar no WhatsApp", href: "https://wa.me/5521920137249", note: "alinhar pedido, prova visual e material antes da postagem" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conteúdo</p>
        <h1 className="mt-3 text-4xl font-black text-white">Bastidores, portfólio e repertório visual da MDH 3D</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
          Esta área concentra o tipo de conteúdo que ajuda o cliente a confiar no acabamento, no processo e na capacidade de personalização da loja.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Portfólio real',
            description: 'Mostre peças prontas, ângulos diferentes e detalhes de acabamento para reforçar confiança visual.',
          },
          {
            title: 'Processo de produção',
            description: 'Grave bastidores de impressão, retirada da mesa, lixamento, pintura e embalagem.',
          },
          {
            title: 'Conteúdo de venda',
            description: 'Use vídeos curtos, comparativos antes/depois e personalizações para alimentar Instagram, WhatsApp e catálogo.',
          },
        ].map((item) => (
          <article key={item.title} className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {channelPlans.map((item) => (
          <article key={item.title} className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Playbook semanal</p>
        <h2 className="mt-3 text-3xl font-black text-white">Uma cadência simples para não deixar a divulgação morrer.</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {weeklyCadence.map((item) => (
            <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ContentPlaybook angles={contentAngles} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {routeCards.map((item) =>
          item.href.startsWith("http") ? (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-cyan-300/25 hover:text-white">
              <p className="font-semibold text-white">{item.label}</p>
              <p className="mt-2">{item.note}</p>
            </a>
          ) : (
            <Link key={item.label} href={item.href} className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-cyan-300/25 hover:text-white">
              <p className="font-semibold text-white">{item.label}</p>
              <p className="mt-2">{item.note}</p>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
