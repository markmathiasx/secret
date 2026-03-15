const items = [
  {
    q: "Como faço um pedido na MDH 3D?",
    a: "Escolha a peça no catálogo, clique em pedir orçamento e envie seu briefing. Nossa equipe confirma acabamento, prazo e entrega antes da produção."
  },
  {
    q: "Vocês entregam em todo o Rio de Janeiro?",
    a: "Atendemos o Rio de Janeiro com logística local e confirmação de prazo por região. Você pode simular o frete e ajustar no atendimento."
  },
  {
    q: "Posso personalizar tamanho, cor e tema?",
    a: "Sim. Trabalhamos com personalização sob encomenda para presentes, decoração, setup, organização e ações de marca."
  },
  {
    q: "Quais formas de pagamento estão disponíveis?",
    a: "Pix, cartão e boleto. O pagamento é confirmado antes da produção ou conforme combinado no atendimento."
  },
  {
    q: "Como funciona garantia e pós-venda?",
    a: "Se houver defeito de fabricação ou dano no transporte local, avaliamos rapidamente e seguimos com correção, retrabalho ou solução adequada."
  },
  {
    q: "Consigo falar com atendimento humano?",
    a: "Sim. O WhatsApp pode iniciar com fluxo rápido, mas você pode pedir atendimento humano a qualquer momento."
  }
];

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">FAQ</p>
      <h1 className="mt-3 text-4xl font-black text-white">Perguntas frequentes sobre pedidos e produção</h1>
      <p className="mt-4 max-w-3xl text-white/70">Respostas rápidas para ajudar na decisão de compra com mais segurança.</p>
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
