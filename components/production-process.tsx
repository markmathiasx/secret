import { CheckCircle2, Cpu, Layers, ScanLine } from "lucide-react";

const STEPS = [
  {
    icon: Layers,
    step: "01",
    title: "Modelagem 3D",
    body: "Cada peça é modelada ou adaptada para garantir encaixe, proporção e viabilidade de impressão. Usamos Fusion 360 e Bambu Studio.",
    color: "text-cyan-100",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "Fatiamento preciso",
    body: "Configurações de camada, suporte e preenchimento definidas por tipo de peça. Filamento PLA+ e PETG certificados.",
    color: "text-violet-100",
  },
  {
    icon: Cpu,
    step: "03",
    title: "Impressão Bambu Lab",
    body: "Impressoras X1C e P1S com multi-material opcional. Precisão de 0.05mm. Cada lote monitorado em tempo real.",
    color: "text-emerald-100",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Controle de qualidade",
    body: "Inspeção visual e dimensional antes de embalar. Peças com defeito são descartadas e reimpressas sem custo extra.",
    color: "text-white",
  },
];

export function ProductionProcess() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="section-kicker">Transparência total</p>
        <h2 className="section-title">Do arquivo 3D até a sua mão — cada etapa documentada.</h2>
        <p className="section-copy mx-auto mt-4 max-w-2xl">
          Não é fábrica anônima na China. É produção local no Rio de Janeiro, com equipamento de ponta e rastreabilidade de cada pedido.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.step}
              className="relative rounded-[28px] border border-white/10 bg-black/20 p-6 transition hover:border-white/20"
            >
              {index < STEPS.length - 1 && (
                <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
                  <div className="h-px w-4 bg-white/20" />
                </div>
              )}
              <div className={`flex items-center gap-3 ${step.color}`}>
                <Icon className="h-6 w-6" />
                <span className="text-3xl font-black opacity-30">{step.step}</span>
              </div>
              <h3 className={`mt-4 text-lg font-bold ${step.color}`}>{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{step.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
