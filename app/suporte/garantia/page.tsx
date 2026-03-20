import Link from "next/link";

export default function SuporteGarantiaPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">Garantia</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Produtos duraveis seguem garantia legal aplicavel. Garantia contratual adicional pode ser oferecida por
          categoria e sempre vem descrita por escrito.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>• Validacao por numero do pedido e SKU.</li>
          <li>• Registro de evidencia tecnica quando necessario.</li>
          <li>• Solucao por reparo, troca ou estorno conforme politica vigente.</li>
          <li>• Prazos e cobertura informados no atendimento.</li>
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

