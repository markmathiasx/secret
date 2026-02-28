import { brand, socialLinks } from "@/lib/constants";

const actions = [
  { title: "Reels de processo", text: "Timelapse da impressão, retirada, acabamento e entrega. CTA: orçamento no WhatsApp." },
  { title: "Stories diários", text: "Bastidores, enquetes de cor, fila de impressão e feedbacks. Salve em destaques." },
  { title: "Catálogo em destaques", text: "Destaques: Anime, Utilidades, Geek, RJ, Como Comprar, Feedbacks." },
  { title: "Status do WhatsApp", text: "Republique os melhores vídeos e promoções no status para ativar sua rede sem gastar." },
  { title: "Oferta local RJ", text: "Use a entrega rápida como diferencial: 'entrega no mesmo dia' quando possível." },
  { title: "Conteúdo utilitário", text: "Mostre peças que resolvem problemas: organização, escritório, cozinha, oficina." }
];

export default function DivulgacaoPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Divulgação</p>
      <h1 className="mt-3 text-4xl font-black text-white">Kit de divulgação</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">
        Base para crescer organicamente com Instagram, Facebook e WhatsApp. Use o site como link principal.
      </p>

      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Instagram: <a className="font-semibold text-cyan-200" href={socialLinks.instagram} target="_blank" rel="noreferrer">@{brand.instagramHandle}</a>
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
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Bio sugerida</p>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/72">
            <p>MDH 3D • Impressões 3D no RJ</p>
            <p>Anime, geek, utilidades e personalizados</p>
            <p>Orçamento rápido no WhatsApp</p>
            <p>Entrega local no Rio de Janeiro</p>
            <p>⬇️ Peça pelo site</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">10 ideias de posts</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Peça de anime da semana",
              "Top 5 peças para setup gamer",
              "Antes e depois de personalizado",
              "Quanto custa imprimir esta peça?",
              "Organização de mesa",
              "Peças úteis para cozinha",
              "Peças úteis para oficina",
              "Entrega no RJ em ação",
              "Feedback do cliente",
              "Bastidores da A1 Mini"
            ].map((idea, idx) => (
              <div key={idea} className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/68">#{idx + 1} {idea}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
