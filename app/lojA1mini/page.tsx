import Link from "next/link";

export default function LojaA1MiniPage() {
  return (
    <section className="mx-auto max-w-[1300px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Landing A1 Mini</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Hub de pecas e upgrades para Bambu Lab A1 Mini</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Entrada rapida para navegar por compatibilidade, configurador, kits e guias tecnicos.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Catalogo tecnico", href: "/catalogo" },
          { label: "Matriz de compatibilidade", href: "/compatibilidade" },
          { label: "Configurador", href: "/configurador/nozzle-hotend" },
          { label: "Kits e bundles", href: "/kits" },
          { label: "Guias", href: "/guias" },
          { label: "Comparador", href: "/comparar" },
          { label: "Area B2B", href: "/b2b" },
          { label: "Suporte", href: "/suporte" },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="rounded-[24px] border border-[#e8dac7] bg-white p-5 text-sm font-semibold text-slate-800 hover:bg-[#fff8ef]">
            {card.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

