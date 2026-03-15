const policy = [
  "Defeitos de fabricação comprovados podem ser corrigidos ou refeitos.",
  "Danos no transporte local devem ser reportados com foto ou vídeo.",
  "Itens personalizados seguem análise técnica para retrabalho ou solução equivalente.",
  "Atendimento pós-venda é feito com prioridade para preservar a experiência do cliente."
];

export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Trocas e devoluções</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>Nossa política prioriza solução ágil e justa para qualquer ocorrência após o recebimento da peça.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {policy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
