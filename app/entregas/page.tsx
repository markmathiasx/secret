import Link from 'next/link';
import { DeliveryCalculator } from '@/components/delivery-calculator';
import { deliveryZones, whatsappMessage, whatsappNumber } from '@/lib/constants';

export default function EntregasPage() {
  const cheapestZone = [...deliveryZones].sort((a, b) => a.fee - b.fee)[0];
  const fastestZone = [...deliveryZones].sort((a, b) => a.eta.localeCompare(b.eta))[0];
  const buyingScenarios = [
    {
      title: 'Presente com data próxima',
      description: 'Vale priorizar pronta entrega e confirmar o bairro antes de fechar, para reduzir risco de prazo.',
      href: '/catalogo?status=Pronta%20entrega&intent=Presente&mode=all',
    },
    {
      title: 'Projeto sob encomenda',
      description: 'Primeiro feche material e acabamento, depois use a página de entregas para validar a janela final.',
      href: '/imagem-para-impressao-3d',
    },
    {
      title: 'Pedido em lote no RJ',
      description: 'Use a rota local para revisar prazo de produção e distribuição antes de ampliar a quantidade.',
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\nQuero revisar entrega local para um pedido em lote.`)}`,
      external: true,
    },
  ];
  const deliveryRules = [
    'O prazo final combina produção da peça e agenda de entrega da região.',
    'Peças volumosas, lotes ou itens muito delicados podem pedir revisão manual antes da confirmação.',
    'A operação local no Rio ajuda a reduzir ruído entre aprovação, finalização e saída do pedido.',
  ];

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

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Faixa mais leve</p>
          <p className="mt-3 text-2xl font-black text-white">{cheapestZone.region}</p>
          <p className="mt-2 text-sm text-white/65">a partir de R$ {cheapestZone.fee}</p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Janela mais curta</p>
          <p className="mt-3 text-2xl font-black text-white">{fastestZone.region}</p>
          <p className="mt-2 text-sm text-white/65">{fastestZone.eta}</p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Próximo passo</p>
          <p className="mt-3 text-2xl font-black text-white">Validar CEP</p>
          <p className="mt-2 text-sm text-white/65">Use o simulador abaixo para sair da faixa genérica.</p>
        </div>
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

      <div className="mt-8">
        <DeliveryCalculator />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Caminhos por cenário</p>
          <h2 className="mt-3 text-3xl font-black text-white">Escolha a rota certa antes de fechar o frete.</h2>
          <div className="mt-5 grid gap-3">
            {buyingScenarios.map((item) =>
              item.external ? (
                <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70 transition hover:border-cyan-300/25 hover:text-white">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2">{item.description}</p>
                </a>
              ) : (
                <Link key={item.title} href={item.href} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70 transition hover:border-cyan-300/25 hover:text-white">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2">{item.description}</p>
                </Link>
              )
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Regras práticas</p>
          <h2 className="mt-3 text-3xl font-black text-white">O que normalmente muda o prazo final.</h2>
          <div className="mt-5 grid gap-3">
            {deliveryRules.map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
