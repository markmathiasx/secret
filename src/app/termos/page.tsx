<<<<<<< ours
<<<<<<< ours
const sections = [
  {
    title: "Escopo do atendimento",
    text: "Os pedidos da MDH 3D podem ser feitos pelo site, WhatsApp e canais parceiros, sempre sujeitos a validacao de material, prazo e capacidade de producao."
  },
  {
    title: "Aprovacao comercial",
    text: "O pedido e confirmado apos alinhamento de briefing, cor, acabamento, entrega e forma de pagamento."
  },
  {
    title: "Personalizacao",
    text: "Projetos personalizados dependem da qualidade das referencias enviadas e podem exigir ajustes tecnicos antes da aprovacao final."
  },
  {
    title: "Prazos e entrega",
    text: "Os prazos informados no site sao estimativas comerciais. A confirmacao definitiva acontece no atendimento, conforme fila de producao e rota."
  }
];

export default function TermsPage() {
=======
=======
>>>>>>> theirs
const terms = [
  "Toda peça pode variar conforme complexidade, material, cor e janela de produção.",
  "Projetos personalizados exigem validação prévia de briefing e escopo.",
  "Prazos e valores são confirmados no orçamento antes da produção.",
  "Conteúdos com propriedade intelectual de terceiros devem respeitar licenças e uso autorizado."
];

export default function Page() {
>>>>>>> theirs
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Termos de uso</h1>
<<<<<<< ours
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
        Estes termos orientam a navegacao, o atendimento e o fechamento de pedidos dentro da operacao da MDH 3D.
      </p>

      <div className="mt-8 grid gap-5">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{section.text}</p>
          </article>
        ))}
=======
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>Estes termos definem as condições comerciais da produção sob encomenda e da operação do site MDH 3D.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {terms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
      </div>
    </section>
  );
}
