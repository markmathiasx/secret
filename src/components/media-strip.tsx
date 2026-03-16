import Link from "next/link";

const processSteps = [
  {
    step: "01",
    title: "Briefing e validação",
    text: "Entendemos referência, uso da peça, cor, tamanho e urgência antes de colocar a máquina para rodar."
  },
  {
    step: "02",
    title: "Impressão e acabamento",
    text: "Produzimos em PLA premium, cuidamos da limpeza da peça e ajustamos detalhes para chegar com leitura de produto final."
  },
  {
    step: "03",
    title: "Conferência e entrega",
    text: "A peça passa por revisão final, registro para portfólio e segue com prazo combinado para retirada ou entrega local."
  }
];

export function MediaStrip() {
  return (
    <section id="como-produzimos" className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/30">
          <video
            className="h-full min-h-[520px] w-full object-cover"
            src="/media/finishing-closeup.mp4"
            poster="/backgrounds/process-detail.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.08),rgba(5,7,13,0.82))]" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="premium-panel rounded-[28px] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Como produzimos as peças</p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/72">
                O vídeo de acabamento mostra o trecho mais sensível da jornada: é onde a peça deixa de parecer teste e começa a parecer produto pronto para vender.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="section-divider pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Processo premium</p>
            <h2 className="mt-4 text-3xl font-black text-white">Produção em 3 etapas para passar confiança antes mesmo do primeiro pedido.</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              A jornada foi desenhada para reduzir dúvida, valorizar acabamento e transformar o orçamento em uma conversa comercial mais simples.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {processSteps.map((item) => (
              <article key={item.step} className="premium-panel rounded-[28px] p-5">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm font-semibold text-amber-100">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/65">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalogo" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
              Ver peças em produção
            </Link>
            <Link href="/entregas" className="rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white">
              Conferir prazo e frete
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
