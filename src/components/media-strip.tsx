import Image from "next/image";
import { getProductionVideoMedia } from "@/lib/media";

const processSteps = [
  {
    title: "Modelagem e preparacao",
    text: "Validamos escala, orientacao, suportes e viabilidade antes de liberar a peca para impressao."
  },
  {
    title: "Impressao monitorada",
    text: "A producao roda com parametros revisados, acompanhamento tecnico e ajuste de material quando necessario."
  },
  {
    title: "Acabamento e conferencia",
    text: "Retiramos suportes, limpamos a peca e revisamos o visual antes da embalagem e da entrega local."
  }
];

export function MediaStrip() {
  const productionMedia = getProductionVideoMedia();

  return (
    <section className="mx-auto max-w-7xl px-6 py-18">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Processo MDH 3D</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Como produzimos as pecas</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
          O fluxo combina preparacao tecnica, impressao estavel e acabamento cuidadoso para manter padrao visual e prazo claro.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4">
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            {productionMedia.hasVideo ? (
              <video
                className="aspect-video w-full object-cover"
                poster={productionMedia.posterSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                {productionMedia.sources.map((source) => (
                  <source key={source.src} src={source.src} type={source.type} />
                ))}
              </video>
            ) : (
              <div className="relative aspect-video w-full">
                <Image
                  src={productionMedia.fallbackImageSrc}
                  alt="Acabamento e revisao final das pecas MDH 3D"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </article>

        <div className="grid gap-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
