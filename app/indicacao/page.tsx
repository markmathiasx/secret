import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Share2, TicketPercent, Users } from "lucide-react";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Indique um amigo e ganhe 15% off | MDH 3D Rio",
  description: "Programa de indicação MDH 3D: indique um amigo para impressão 3D e ganhe 15% off em uma próxima compra.",
  alternates: {
    canonical: `${siteUrl}/indicacao`,
  },
  openGraph: {
    title: "Indique um amigo, ganhe 15% off",
    description: "Compartilhe a MDH 3D com um amigo e transforme indicação em desconto real.",
    url: `${siteUrl}/indicacao`,
    images: [{ url: "/backgrounds/hero-printer-fallback.jpg", width: 1200, height: 630, alt: "MDH 3D" }],
  },
};

export default function ReferralLandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-18">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div>
          <p className="section-kicker">Programa de indicação</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Indique um amigo, ganhe 15% off.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
            Compartilhe a MDH 3D com quem precisa imprimir uma peça, presente ou arquivo STL. Quando a indicação vira compra, você recebe desconto para usar no próximo pedido.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login?next=/conta" className="btn-primary justify-center gap-2">
              <Gift className="h-4 w-4" />
              Entrar e pegar meu link
            </Link>
            <Link href="/catalogo?mode=real" className="btn-secondary justify-center">
              Ver peças com mídia validada
            </Link>
          </div>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4">
            {[
              { icon: Share2, title: "Compartilhe seu link", body: "O link fica disponível na conta do cliente depois do login." },
              { icon: Users, title: "Amigo compra na MDH 3D", body: "A indicação é vinculada ao cadastro e ao primeiro pedido elegível." },
              { icon: TicketPercent, title: "15% off liberado", body: "O desconto entra como benefício comercial auditável para a próxima compra." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-white/64">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
