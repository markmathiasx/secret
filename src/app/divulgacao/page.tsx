import type { Metadata } from "next";
import { brand, socialLinks } from "@/lib/constants";
import { buildPageMetadata, getBreadcrumbStructuredData, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Kit de divulgacao e redes sociais",
  description:
    "Guia rapido da MDH 3D para Instagram, WhatsApp e conteudo organico com foco em vendas e presenca local.",
  path: "/divulgacao"
});

const actions = [
  { title: "Reels de processo", text: "Mostre impressão, acabamento e resultado final com CTA para orçamento no WhatsApp." },
  { title: "Stories diários", text: "Publique bastidores, enquetes de cor e fila de produção para gerar desejo contínuo." },
  { title: "Vitrine social", text: "Mantenha destaques atualizados para Anime, Geek, Setup e Personalizados." },
  { title: "Oferta local RJ", text: "Reforce entrega no Rio de Janeiro para aumentar conversão regional." },
  { title: "Conteúdo de utilidade", text: "Mostre peças que resolvem organização de casa, escritório e setup." },
  { title: "Prova social", text: "Compartilhe fotos de clientes e resultado pós-entrega para construir confiança." }
];

export default function DivulgacaoPage() {
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Divulgacao", item: `${getSiteUrl()}/divulgacao` }
  ]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Divulgação</p>
      <h1 className="mt-3 text-4xl font-black text-white">Kit de divulgação</h1>
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
>>>>>>> theirs
      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">
        Use o site como hub de conversão e as redes sociais como motor diário de descoberta e retorno.
      </p>

      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Instagram oficial: <a className="font-semibold text-cyan-200" href={socialLinks.instagram} target="_blank" rel="noreferrer">@{brand.instagramHandle}</a>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((a) => (
          <article key={a.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">{a.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{a.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Bio comercial</p>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/72">
            <p>MDH 3D • Impressão 3D no RJ</p>
            <p>Peças geek, decoração e utilidades</p>
            <p>Personalização sob encomenda</p>
            <p>Orçamento rápido via WhatsApp</p>
            <p>⬇️ Catálogo oficial no link</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Pautas da semana</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Peça em alta da semana",
              "Top setup gamer",
              "Antes e depois de personalizado",
              "Bastidores da produção",
              "Organização de mesa",
              "Entrega no RJ",
              "Feedback de cliente",
              "Acabamento premium"
            ].map((idea, idx) => (
              <div key={idea} className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/68">#{idx + 1} {idea}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
