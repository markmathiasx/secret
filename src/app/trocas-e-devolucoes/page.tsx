<<<<<<< ours
<<<<<<< ours
const sections = [
  {
    title: "Pecas com defeito de fabricacao",
    text: "Se houver falha estrutural ou problema gerado na producao, a MDH 3D avalia o caso para correcoes, reimpressao ou solucao comercial adequada."
  },
  {
    title: "Danos no transporte local",
    text: "Danos ocorridos durante entrega local devem ser informados rapidamente para que a equipe valide o ocorrido e proponha o melhor encaminhamento."
  },
  {
    title: "Itens personalizados",
    text: "Pecas personalizadas dependem da aprovacao previa do briefing e por isso nao seguem a mesma logica de devolucao de itens prontos de prateleira."
  },
  {
    title: "Atendimento de pos-venda",
    text: "Em caso de duvida, fale com a MDH 3D pelos canais oficiais para analisar fotos, detalhes de uso e possiveis ajustes."
  }
];

export default function ReturnsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Trocas e devolucoes</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
        Esta pagina resume como a MDH 3D trata ajustes, retrabalho e pos-venda em pedidos diretos e personalizados.
      </p>

      <div className="mt-8 grid gap-5">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{section.text}</p>
          </article>
        ))}
=======
=======
>>>>>>> theirs
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
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
      </div>
    </section>
  );
}
