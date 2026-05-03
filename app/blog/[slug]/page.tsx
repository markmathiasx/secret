import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { blogPosts, getBlogPost, getBlogPostUrl } from "@/lib/blog";
import { getSiteUrl } from "@/lib/env";

export const revalidate = 3600;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Post não encontrado" };
  }

  const url = getBlogPostUrl(post);

  return {
    title: `${post.title} | MDH 3D Rio`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: `${getSiteUrl()}/backgrounds/hero-printer-fallback.jpg`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${getSiteUrl()}/backgrounds/hero-printer-fallback.jpg`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "MDH 3D",
      logo: {
        "@type": "ImageObject",
        url: `${getSiteUrl()}/logo-mdh-3d.webp`,
      },
    },
    mainEntityOfPage: getBlogPostUrl(post),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 md:py-18">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Voltar para loja
      </Link>

      <article className="mt-8">
        <div className="rounded-[8px] border border-white/10 bg-white/5 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/72">Guia técnico MDH 3D</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-8 text-white/72">{post.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/52">
            <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>
            <span>•</span>
            <span>{post.author}</span>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {post.sections.map((section) => (
            <section key={section.heading} className="rounded-[8px] border border-white/10 bg-black/20 p-6">
              <h2 className="text-2xl font-black text-white">{section.heading}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-white/70">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[8px] border border-emerald-300/18 bg-emerald-300/[0.08] p-6">
          <h2 className="text-2xl font-black text-white">Checklist antes de enviar</h2>
          <div className="mt-4 grid gap-3">
            {["Unidade em milímetros", "Paredes e malha revisadas", "Material, cor e prazo definidos", "Referência visual anexada quando aparência importa"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-emerald-50">
                <CheckCircle2 className="h-4 w-4" />
                {item}
              </div>
            ))}
          </div>
          <Link href="/imagem-para-impressao-3d" className="btn-primary mt-6 inline-flex">
            Enviar arquivo para orçamento
          </Link>
        </section>

        <section className="mt-8 rounded-[8px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-black text-white">Perguntas frequentes</h2>
          <div className="mt-4 divide-y divide-white/10">
            {post.faq.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer text-base font-semibold text-white">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-white/70">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
