const items = [
  {
    q: "Como faco um pedido?",
    a: "Escolha um item no catalogo, abra a pagina do produto e envie o orcamento. Se preferir, chame no WhatsApp com o nome da peca e sua necessidade."
  },
  {
    q: "Vocês entregam onde?",
    a: "A operacao principal e local no Rio de Janeiro. O site calcula uma estimativa inicial de frete por CEP e o prazo final e confirmado no fechamento."
  },
  {
    q: "Consigo falar com humano?",
    a: "Sim. O site e o assistente ajudam na triagem, mas o cliente pode pedir atendimento humano a qualquer momento."
  },
  {
    q: "Quais pagamentos entram no site?",
    a: "Pix, cartao e boleto. O caminho principal da venda continua sendo a propria loja, com atendimento direto e fechamento pelo WhatsApp quando necessario."
  },
  {
    q: "As imagens do catalogo sao definitivas?",
    a: "Quando a peca ja tem ensaio proprio, a loja usa foto real. Quando ainda nao tem, mostramos render fiel do item para manter a vitrine consistente."
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
