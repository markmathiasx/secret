import { getHomepageMedia } from "@/lib/media";

export function MediaStrip() {
  const media = getHomepageMedia();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
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
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">10s</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
