import Link from "next/link";

export default function SuporteEnvioPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">Envio e frete</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Cotacao por CEP no produto e no carrinho. O prazo final e informado antes da confirmacao do pedido e o
          rastreio fica disponivel no pos-compra.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>• Cotacao dinamica por CEP, peso e dimensoes da embalagem.</li>
          <li>• Exibicao de prazo e custo antes do pagamento.</li>
          <li>• Codigo de rastreio apos expedicao.</li>
          <li>• Registro de SLA logistica para auditoria interna.</li>
        </ul>
        <div className="mt-5">
          <Link href="/suporte" className="rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
            Voltar para suporte
          </Link>
        </div>
      </div>
    </section>
  );
}

