import { deliveryZones } from '@/lib/constants';

export default function EntregasPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Entrega RJ</p>
        <h1 className="mt-3 text-4xl font-black text-white">Frete local, prazo e operação no Rio de Janeiro</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
          A operação principal é local. Isso melhora a revisão final, reduz ruído de prazo e deixa o atendimento mais preciso para quem compra no Rio.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          'Confirmação de prazo conforme tipo de peça e acabamento.',
          'Entrega local com previsão por região e apoio do atendimento.',
          'Projetos personalizados podem exigir janela adicional de produção.',
        ].map((item) => (
          <div key={item} className="glass-panel p-6 text-sm leading-7 text-white/68">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deliveryZones.map((zone) => (
          <article key={zone.region} className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white">{zone.region}</h2>
            <p className="mt-3 text-sm text-white/65">Frete médio: R$ {zone.fee}</p>
            <p className="mt-2 text-sm text-white/65">Prazo estimado: {zone.eta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
