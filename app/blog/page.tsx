import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { blogPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Guias técnicos e comerciais da MDH 3D para preparar arquivos, escolher material e comprar impressão 3D com menos erro.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const featured = blogPosts[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="section-kicker">Blog MDH 3D</p>
          <h1 className="section-title mt-3">Guias práticos para comprar e produzir peças 3D com menos retrabalho.</h1>
          <p className="section-copy mt-4 max-w-3xl">
            Conteúdo direto para quem quer enviar STL, escolher material, validar escala, comparar acabamento e fechar pedido com mais clareza.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["STL", "material", "escala", "acabamento"].map((item) => (
              <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
          <Image
            src="/backgrounds/hero-printer-fallback.jpg"
            alt="Impressora 3D em operação no ateliê MDH 3D"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 48vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[20px] border border-white/10 bg-slate-950/78 p-4 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Guia em destaque</p>
            <p className="mt-2 text-lg font-black text-white">{featured.title}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-5">
          {blogPosts.map((post) => (
            <article key={post.slug} className="glass-panel p-6 md:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                <CalendarDays className="h-4 w-4 text-cyan-100" />
                <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>
                <span>MDH 3D</span>
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/68">{post.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/62">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={`/blog/${post.slug}`} className="btn-primary mt-6 inline-flex gap-2">
                Ler guia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <aside className="glass-panel h-fit p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Checklist rápido</p>
          <div className="mt-4 grid gap-3">
            {[
              "Confirme medidas em milímetros",
              "Informe uso real da peça",
              "Escolha material com base no ambiente",
              "Envie referência visual quando aparência importar",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/72">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/imagem-para-impressao-3d" className="btn-secondary mt-5 w-full justify-center">
            Enviar referência
          </Link>
        </aside>
      </div>
    </section>
  );
}
