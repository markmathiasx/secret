const steps = [
  ["Escolha", "Abra um produto, página por intenção ou fale no atendimento."],
  ["Confirme", "Veja Pix, cartão, prazo, personalização e material."],
  ["Envie", "Para sob medida, mande uso, medidas, quantidade, cor e referência."],
  ["Produza", "A equipe confirma o pedido e orienta pagamento em canal oficial."],
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="text-2xl font-black text-white sm:text-3xl">Como funciona</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {steps.map(([title, text], index) => (
          <article key={title} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-sm font-black text-emerald-100">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
