const terms = [
  "Toda peça pode variar conforme complexidade, material, cor e janela de produção.",
  "Projetos personalizados exigem validação prévia de briefing e escopo.",
  "Prazos e valores são confirmados no orçamento antes da produção.",
  "Conteúdos com propriedade intelectual de terceiros devem respeitar licenças e uso autorizado."
];

export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Termos de uso</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>Estes termos definem as condições comerciais da produção sob encomenda e da operação do site MDH 3D.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {terms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
