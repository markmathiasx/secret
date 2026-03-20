const faqItems = [
  {
    question: "Como validar se um item serve na A1 Mini?",
    answer: "Use o filtro de compatibilidade no topo do site e confirme o bloco tecnico na pagina do produto.",
  },
  {
    question: "Tem desconto no Pix?",
    answer: "Sim. O preco Pix fica em destaque no card e na pagina de produto.",
  },
  {
    question: "Posso comparar produtos antes de comprar?",
    answer: "Sim. Adicione ate 4 itens no comparador e veja os campos tecnicos lado a lado.",
  },
  {
    question: "Onde encontro guias de instalacao e seguranca?",
    answer: "Na pagina de guias voce encontra passo a passo, ferramentas e alertas de seguranca.",
  },
  {
    question: "Vocês atendem B2B?",
    answer: "Sim. Existe area B2B com cadastro e condicoes por nivel comercial.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">FAQ</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Perguntas frequentes</h1>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {faqItems.map((item) => (
          <article key={item.question} className="rounded-[28px] border border-[#e8dac7] bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

