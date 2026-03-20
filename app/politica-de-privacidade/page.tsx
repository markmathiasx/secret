export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">Politica de privacidade (LGPD)</h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
          <p>
            Os dados pessoais coletados no checkout e no atendimento sao usados para processar pedidos, suporte,
            antifraude, logistica e obrigacoes legais/fiscais.
          </p>
          <p>
            Aplicamos principio de minimizacao: solicitamos apenas dados necessarios para cada etapa da compra e
            atendimento.
          </p>
          <p>
            O titular pode solicitar acesso, correcao e eliminacao de dados pessoais conforme regras da LGPD e limites
            legais aplicaveis.
          </p>
          <p>
            Contato para assuntos de privacidade: use o canal oficial de suporte da loja.
          </p>
        </div>
      </div>
    </section>
  );
}

