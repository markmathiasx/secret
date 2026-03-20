export default function TermsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">Termos de uso</h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
          <p>
            A loja opera como marketplace tecnico de pecas e itens impressos em 3D. Prazos, disponibilidade e acabamento
            podem variar por SKU, lote e complexidade.
          </p>
          <p>
            Marcas de terceiros podem ser citadas apenas para identificacao de compatibilidade. O uso e descritivo e nao
            implica afiliacao oficial, salvo contrato expresso.
          </p>
          <p>
            Conteudos CAD/STL enviados por clientes devem respeitar propriedade intelectual. Solicita-se remocao de
            conteudo quando houver denuncia procedente.
          </p>
          <p>
            Para itens de manutencao e operacao termica, siga sempre os avisos de seguranca: desligar, desconectar da
            tomada e aguardar resfriamento completo antes de intervir.
          </p>
        </div>
      </div>
    </section>
  );
}

