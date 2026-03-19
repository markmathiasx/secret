export default function DivulgacaoPage() {
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
    </section>
  );
}
