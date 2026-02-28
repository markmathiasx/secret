const items = [
  {
    q: "Como faço um pedido?",
    a: "Escolha um item no catálogo, abra a página do produto e envie o orçamento. Se preferir, chame no WhatsApp e diga o nome do projeto."
  },
  {
    q: "Vocês entregam onde?",
    a: "A operação inicial é local no Rio de Janeiro. O site calcula uma estimativa de frete por CEP e você confirma o prazo no fechamento."
  },
  {
    q: "Consigo falar com humano?",
    a: "Sim. O bot filtra e organiza o pedido, mas o cliente pode pedir HUMANO no WhatsApp e a conversa segue para atendimento pessoal."
  },
  {
    q: "Quais pagamentos entram no site?",
    a: "Pix, cartão e boleto via provedor. O projeto já fica preparado para Mercado Pago."
  },
  {
    q: "As imagens do catálogo são definitivas?",
    a: "O catálogo-base já traz cards visuais premium, mas a ideia é você substituir por fotos e vídeos reais das suas impressões conforme produzir."
  }
];

export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">FAQ</p>
      <h1 className="mt-3 text-4xl font-black text-white">Perguntas frequentes</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.q} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">{item.q}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
