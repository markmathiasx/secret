import { brand, socialLinks } from "@/lib/constants";

const actions = [
<<<<<<< ours
<<<<<<< ours
  { title: "Reels de processo", text: "Mostre impressao, acabamento e resultado final com CTA para orcamento no WhatsApp." },
  { title: "Stories diarios", text: "Publique bastidores, enquete de cor e fila de producao para gerar desejo continuo." },
  { title: "Vitrine social", text: "Mantenha destaques atualizados para Anime, Geek, Setup e Personalizados." },
  { title: "Oferta local RJ", text: "Reforce entrega no Rio de Janeiro para aumentar conversao regional." },
  { title: "Conteudo de utilidade", text: "Mostre pecas que resolvem organizacao de casa, escritorio e setup." },
  { title: "Prova social", text: "Compartilhe fotos de clientes e resultado pos-entrega para construir confianca." }
=======
=======
>>>>>>> theirs
  { title: "Reels de processo", text: "Mostre impressão, acabamento e resultado final com CTA para orçamento no WhatsApp." },
  { title: "Stories diários", text: "Publique bastidores, enquetes de cor e fila de produção para gerar desejo contínuo." },
  { title: "Vitrine social", text: "Mantenha destaques atualizados para Anime, Geek, Setup e Personalizados." },
  { title: "Oferta local RJ", text: "Reforce entrega no Rio de Janeiro para aumentar conversão regional." },
  { title: "Conteúdo de utilidade", text: "Mostre peças que resolvem organização de casa, escritório e setup." },
  { title: "Prova social", text: "Compartilhe fotos de clientes e resultado pós-entrega para construir confiança." }
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
];

export default function DivulgacaoPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
<<<<<<< ours
<<<<<<< ours
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conteudo e divulgacao</p>
      <h1 className="mt-3 text-4xl font-black text-white">Use o site como vitrine e as redes como motor de descoberta</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">
        A operacao comercial fica mais forte quando o catalogo, os canais sociais e o atendimento trabalham com a mesma linguagem visual.
      </p>

      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Instagram oficial:{" "}
        <a className="font-semibold text-cyan-200" href={socialLinks.instagram} target="_blank" rel="noreferrer">
          @{brand.instagramHandle}
        </a>
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">
        Use o site como hub de conversão e as redes sociais como motor diário de descoberta e retorno.
      </p>

      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Instagram oficial: <a className="font-semibold text-cyan-200" href={socialLinks.instagram} target="_blank" rel="noreferrer">@{brand.instagramHandle}</a>
>>>>>>> theirs
=======
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Social Growth</p>
      <h1 className="mt-3 text-4xl font-black text-white">Estratégia de conteúdo para vender mais</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">
        Use o site como hub de conversão e as redes sociais como motor diário de descoberta e retorno.
      </p>

      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Instagram oficial: <a className="font-semibold text-cyan-200" href={socialLinks.instagram} target="_blank" rel="noreferrer">@{brand.instagramHandle}</a>
>>>>>>> theirs
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <article key={action.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">{action.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{action.text}</p>
          </article>
        ))}
      </div>
<<<<<<< ours
=======

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
>>>>>>> theirs
    </section>
  );
}
