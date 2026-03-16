import Link from 'next/link';
import { PlayCircle, Sparkles } from 'lucide-react';
import { getProductionMedia } from '@/lib/media';

export function MediaStrip() {
  const items = getProductionMedia();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 max-w-3xl">
        <p className="section-kicker">Mídia da produção</p>
        <h2 className="section-title">Processo, acabamento e prova visual de que a peça sai com presença</h2>
        <p className="section-copy">
          O vídeo da impressora e as imagens do processo entram como prova de produção e qualidade, não como fundo agressivo do site inteiro.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <article key={item.id} className="video-card">
            <div className="relative aspect-video overflow-hidden">
              {item.type === 'video' ? (
                <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster={item.poster}>
                  <source src={item.src} type="video/mp4" />
                </video>
              ) : (
                <img src={item.src} alt={item.title} className="h-full w-full object-cover" />
              )}
              <div className="absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/75">
                Cena {String(index + 1).padStart(2, '0')}
              </div>
              <div className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/80">
                {item.type === 'video' ? <PlayCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {item.type === 'video' ? 'Vídeo real' : 'Foto real'}
              </div>
            </div>
            <div className="relative z-10 p-5">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/65">{item.description}</p>
              <div className="mt-4">
                <Link href="/catalogo" className="btn-dark">
                  Ver produtos relacionados
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
