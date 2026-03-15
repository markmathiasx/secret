import Image from "next/image";
import { getHomepageMedia } from "@/lib/media";

export function MediaStrip() {
  const media = getHomepageMedia();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Detalhes da marca</p>
          <h2 className="mt-2 text-3xl font-black text-white">Acabamento, textura e presença visual ajudam você a comprar com mais confiança</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            Quando a peça aparece em contexto, com boa luz e acabamento visível, o valor percebido sobe e a compra fica mais segura.
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
=======
            Seleção de mídia com registros do processo de produção e acabamento das peças.
>>>>>>> theirs
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {media.map((item, index) => (
          <article key={`${item.src}-${index}`} className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-4">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
<<<<<<< ours
              <div className="relative h-64 w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(42,212,255,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.58))]" />
                <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                  {item.eyebrow}
=======
              {item.kind === "video" ? (
                <video className="h-64 w-full object-cover" src={item.src} poster={item.poster} autoPlay muted loop playsInline preload="metadata" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(42,212,255,0.2),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 text-center text-white/70">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Destaque visual</p>
                    <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-white/55">Imagem institucional da produção MDH 3D.</p>
                  </div>
>>>>>>> theirs
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-white/50">{item.description}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Foto</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
