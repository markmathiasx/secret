import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Clock3, MapPin, ShieldCheck, Star } from "lucide-react";
import { verifiedCatalog } from "@/lib/verified-catalog";
import { getProductUrl } from "@/lib/catalog";

type ConversionHeroProps = {
  catalogCount: number;
  realPhotoCount: number;
  readyRealCount: number;
  ratingLabel: string;
  reviewCount?: number;
};

export function ConversionHero({
  catalogCount,
  realPhotoCount,
  readyRealCount,
  ratingLabel,
  reviewCount,
}: ConversionHeroProps) {
  const showcase = verifiedCatalog.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#08111b] px-6 py-10 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            Produção RJ • Entrega em 24-48h • 7 dias para troca
          </div>

          <h1 className="mt-6 max-w-4xl font-sans text-4xl font-black leading-[1.02] text-white md:text-6xl">
            Impressão 3D premium no Rio com foto real antes de comprar.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
            Compare peças prontas, personalize material e cor, calcule frete no checkout e feche como visitante sem criar conta antes do pagamento.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/catalogo?mode=real" prefetch={false} className="btn-primary min-h-12 justify-center gap-2 px-7 text-base">
              <Camera className="h-5 w-5" />
              Ver Ofertas com Foto Real
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/75">
              <Link href="/imagem-para-impressao-3d" prefetch={false} className="transition hover:text-cyan-100">Enviar STL</Link>
              <Link href="/blog/como-preparar-stl-impressao-3d-perfeita" prefetch={false} className="transition hover:text-cyan-100">Guia STL</Link>
              <Link href="/checkout" prefetch={false} className="transition hover:text-cyan-100">Checkout</Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Catálogo", value: catalogCount.toLocaleString("pt-BR"), icon: BadgeCheck },
              { label: "Foto real", value: String(realPhotoCount).padStart(2, "0"), icon: Camera },
              { label: "Pronta entrega", value: String(readyRealCount).padStart(2, "0"), icon: Clock3 },
              { label: reviewCount ? `${reviewCount} reviews` : "Prova social", value: ratingLabel, icon: Star },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{item.label}</p>
                    <Icon className="h-4 w-4 text-cyan-100" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid auto-cols-[minmax(148px,170px)] grid-flow-col gap-4 overflow-x-auto pb-1 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            {showcase.map((product, index) => (
              <Link
                key={product.id}
                href={getProductUrl(product)}
                prefetch={false}
                className="group overflow-hidden rounded-[8px] border border-white/10 bg-black/30"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={product.image || product.images[0]}
                    alt={product.name}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 33vw, 220px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-emerald-100">Foto real validada</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid gap-3 rounded-[8px] border border-cyan-300/18 bg-cyan-300/[0.08] p-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
              <MapPin className="h-5 w-5" />
            </span>
            <p className="text-sm leading-7 text-white/75">
              Produção local no RJ, rastreio por pedido e atendimento direto para validar cor, escala e acabamento antes de produzir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
