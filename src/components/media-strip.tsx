import Image from "next/image";
import { getProductionVideoMedia } from "@/lib/media";

const processSteps = [
  {
    title: "Modelagem e preparação",
    text: "Ajustamos escala, orientação, suportes e tempo de impressão para garantir qualidade e repetibilidade."
  },
  {
    title: "Impressão",
    text: "A peça é produzida em camadas com controle de temperatura e monitoramento contínuo da máquina."
  },
  {
    title: "Acabamento",
    text: "Removemos suportes, fazemos limpeza final e conferência visual antes de separar para envio."
  }
];

export function MediaStrip() {
  const productionMedia = getProductionVideoMedia();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Processo MDH 3D</p>
        <h2 className="mt-2 text-3xl font-black text-white">Como produzimos as peças</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Nosso fluxo de produção combina preparação técnica, impressão estável e acabamento cuidadoso para entregar peças consistentes e com aparência premium.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-4">
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            {productionMedia.hasVideo ? (
              <video className="h-[360px] w-full object-cover" poster={productionMedia.posterSrc} autoPlay muted loop playsInline preload="metadata">
                {productionMedia.sources.map((source) => (
                  <source key={source.src} src={source.src} type={source.type} />
                ))}
              </video>
            ) : (
              <div className="relative h-[360px] w-full">
                <Image src={productionMedia.fallbackImageSrc} alt="Processo de acabamento MDH 3D" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 flex items-end p-5 text-sm text-white/85">Processo de acabamento local da MDH 3D</div>
              </div>
            )}
          </div>
        </article>

        <div className="grid gap-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
