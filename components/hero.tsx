import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Truck, WandSparkles } from 'lucide-react';
import { getHeroBackgroundMedia } from '@/lib/media';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';

const trustSignals = [
  'Produção local no Rio de Janeiro',
  'Acabamento premium revisado',
  'Linha validada para A1 Mini',
  'Atendimento humano no WhatsApp'
];

const metrics = [
  { label: 'Linhas de venda', value: '6+' },
  { label: 'Foco em presente', value: '24h' },
  { label: 'Acabamento', value: 'Premium' }
];

export function Hero() {
  const heroMedia = getHeroBackgroundMedia();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="hero-noise relative isolate overflow-hidden rounded-[44px] border border-white/10 bg-slate-950">
      <div className="absolute inset-0">
        <Image
          src={heroMedia.fallbackImageSrc}
          alt="Impressora 3D em funcionamento"
          fill
          className="object-cover opacity-45"
        />
        {heroMedia.hasVideo ? (
          <video
            className="hero-video absolute inset-0 h-full w-full object-cover opacity-50"
            poster={heroMedia.posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            {heroMedia.sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : null}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.52),rgba(2,6,23,0.82)_52%,rgba(2,6,23,0.96)_100%)]" />

      <div className="relative mx-auto grid min-h-[80vh] max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.18fr_0.82fr] md:items-end md:py-18">
        <div className="max-w-4xl">
          <span className="glass-chip">Atelier MDH 3D • Rio de Janeiro</span>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/72">
              Geek & Anime
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/72">
              Setup & Organização
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/72">
              Sob encomenda
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
            Uma loja 3D com estética premium, catálogo forte e pedido rápido no ponto de venda.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
            Presentes criativos, linha geek, organização premium, peças decorativas e projetos sob encomenda com produção própria, acabamento revisado e comunicação clara.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalogo" className="btn-gradient">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={whatsappHref} className="btn-zap">
              Falar no WhatsApp
            </a>
            <Link href="/checkout" className="btn-glass">
              Comprar agora
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trustSignals.map((item) => (
              <div key={item} className="glass-card px-4 py-4 text-sm text-white/82">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:justify-self-end">
          <div className="promo-banner p-6">
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/80">Vitrine pronta para vender</p>
              <h2 className="mt-3 text-3xl font-black text-white">Layout mais forte, mais confiança e mais conversão.</h2>
              <p className="mt-3 text-sm leading-7 text-white/78">
                Aplicando linguagem visual mais próxima de uma loja séria: contraste melhor, botões com hierarquia forte, prova de produção e discurso comercial mais claro.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/catalogo" className="btn-neon">
                  Ver lançamentos
                </Link>
                <a href={whatsappHref} className="btn-slide">
                  Pedir orçamento
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {metrics.map((item) => (
              <div key={item.label} className="metric-card">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-violet-200/80">Linha A1 Mini Validada</p>
            <div className="mt-4 grid gap-4 text-sm text-white/78">
              <div className="flex gap-3">
                <WandSparkles className="mt-0.5 h-5 w-5 text-cyan-200" />
                <span>Peças que performam bem no volume de 180 × 180 × 180 mm com acabamento comercial forte.</span>
              </div>
              <div className="flex gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-cyan-200" />
                <span>Operação local no RJ com comunicação clara de prazo, produção e entrega.</span>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-200" />
                <span>Pix, cartão e atendimento humano, com fluxo simples para fechar rápido.</span>
              </div>
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-cyan-200" />
                <span>Catálogo orientado a presente, setup, decoração e pedidos personalizados de alto apelo visual.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
