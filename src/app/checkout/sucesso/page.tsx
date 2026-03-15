import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-[36px] border border-emerald-400/20 bg-emerald-400/10 p-10 text-center shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">Pagamento iniciado</p>
        <h1 className="mt-4 text-4xl font-black text-white">Pedido registrado</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/72">
          Seu pedido já está dentro da operação da MDH 3D. {params.order ? `Referência: ${params.order}.` : ""} Você pode acompanhar o status pela página de consulta.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/acompanhar-pedido${params.order ? `?order=${params.order}` : ""}`} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80">
            Acompanhar pedido
          </Link>
          <Link href="/catalogo" className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-6 py-3 text-sm font-semibold text-cyan-100">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}

