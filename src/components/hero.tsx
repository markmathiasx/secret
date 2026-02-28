import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24">
        <div>
          <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            PWA + catálogo com imagens locais + checkout Pix + atendimento híbrido
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
            {brand.name}: peças 3D com visual premium, frete local no RJ e atendimento rápido.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            Estrutura pensada para vender anime, geek, utilidades, decoração, oficina e personalizados, com identidade premium, catálogo com imagens locais e transição fluida para atendimento humano.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalogo" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
              Ver catálogo completo
            </Link>
            <Link href="/entregas" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10">
              Calcular frete por CEP
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["1000", "exemplos navegáveis"],
              ["RJ", "frete local com CEP"],
              ["PWA", "instalável no celular"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-400/25 blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-violet">
            <Image src="/logo-mdh.jpg" alt="Logo MDH" width={1200} height={900} className="h-auto w-full rounded-[24px] object-cover" priority />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Vitrine</p>
                <p className="mt-2 text-sm text-white/75">Cards com visual mais futurista, imagens locais, coleções fortes e navegação mobile-first.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Atendimento</p>
                <p className="mt-2 text-sm text-white/75">Bot educado atende, entende saudação, sugere peças e transfere para humano quando o cliente quiser.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
