import Image from "next/image";
import { getProductionVideoMedia } from "@/lib/media";

const processSteps = [
  {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  }
];

export function MediaStrip() {
  const productionMedia = getProductionVideoMedia();

  return (
<<<<<<< ours
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
=======
    <section className="mx-auto max-w-7xl px-6 py-16">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mídia da produção</p>
          <h2 className="mt-2 text-3xl font-black text-white">Vídeos curtos da impressora, acabamento e peças prontas</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
            Seleção de mídia com registros do processo de produção e acabamento das peças.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {media.map((item, index) => (
          <article key={`${item.src}-${index}`} className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-4">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              {item.kind === "video" ? (
                <video className="h-64 w-full object-cover" src={item.src} poster={item.poster} autoPlay muted loop playsInline preload="metadata" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(42,212,255,0.2),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 text-center text-white/70">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Destaque visual</p>
                    <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-white/55">Imagem institucional da produção MDH 3D.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-white/50">Loop automático, mobile-friendly, pronto para Safari e Chrome.</p>
>>>>>>> theirs
=======
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Processo MDH 3D</p>
        <h2 className="mt-2 text-3xl font-black text-white">Como produzimos as peças</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Nosso fluxo de produção combina preparação técnica, impressão estável e acabamento cuidadoso para entregar peças consistentes e com aparência premium.
        </p>
      </div>

=======
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Processo MDH 3D</p>
        <h2 className="mt-2 text-3xl font-black text-white">Como produzimos as peças</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Nosso fluxo de produção combina preparação técnica, impressão estável e acabamento cuidadoso para entregar peças consistentes e com aparência premium.
        </p>
      </div>

>>>>>>> theirs
=======
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Processo MDH 3D</p>
        <h2 className="mt-2 text-3xl font-black text-white">Como produzimos as peças</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Nosso fluxo de produção combina preparação técnica, impressão estável e acabamento cuidadoso para entregar peças consistentes e com aparência premium.
        </p>
      </div>

>>>>>>> theirs
=======
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Processo MDH 3D</p>
        <h2 className="mt-2 text-3xl font-black text-white">Como produzimos as peças</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          Nosso fluxo de produção combina preparação técnica, impressão estável e acabamento cuidadoso para entregar peças consistentes e com aparência premium.
        </p>
      </div>

>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
              </div>
            )}
          </div>
        </article>

        <div className="grid gap-4">
          {processSteps.map((step, index) => (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            <article key={step.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
=======
            <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
>>>>>>> theirs
=======
            <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
>>>>>>> theirs
=======
            <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
>>>>>>> theirs
=======
            <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Etapa 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
>>>>>>> theirs
              <p className="mt-3 text-sm leading-7 text-white/65">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
