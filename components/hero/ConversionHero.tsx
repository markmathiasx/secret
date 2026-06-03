"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Clock3, MapPin, ShieldCheck, Star } from "lucide-react";
import { verifiedCatalog } from "@/lib/verified-catalog";
import { getProductUrl } from "@/lib/catalog";
import { getCachedData, cacheKeys, cacheTtl } from "@/lib/cache";
import { useState, useEffect } from "react";

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
  const [userCity, setUserCity] = useState<string>("Rio de Janeiro");
  const [showcase, setShowcase] = useState(verifiedCatalog.slice(0, 3));

  // Detect user city by IP (cached)
  useEffect(() => {
    const detectCity = async () => {
      try {
        const city = await getCachedData(
          'user:city',
          async () => {
            const response = await fetch('/api/location/city');
            if (!response.ok) return 'Rio de Janeiro';
            const data = await response.json();
            return data.city || 'Rio de Janeiro';
          },
          { memoryTtl: cacheTtl.long, redisTtl: cacheTtl.daily }
        );
        setUserCity(city);
      } catch {
        setUserCity('Rio de Janeiro');
      }
    };
    detectCity();
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#08111b] px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 sm:px-4 sm:py-2">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Produção RJ • </span>Entrega em {userCity} em 24-48h • 7 dias para troca
          </div>

          <h1 className="mt-4 max-w-4xl font-sans text-3xl font-black leading-[1.02] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Impressão 3D premium no Rio com mídia validada antes de comprar.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
            Compare peças prontas, personalize material e cor, calcule frete no checkout e feche como visitante sem criar conta.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
            <Link 
              href="/catalogo?mode=real" 
              prefetch={false}
              className="btn-primary min-h-12 justify-center gap-2 px-6 text-base font-semibold sm:min-h-12 sm:px-7 sm:text-base"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <Camera className="h-5 w-5" />
              <span className="hidden xs:inline">Ver Ofertas com Foto Real</span>
              <span className="xs:hidden">Ver Ofertas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-white/60 sm:gap-x-5 sm:text-sm">
              <Link href="/imagem-para-impressao-3d" prefetch={false} className="transition-colors hover:text-cyan-100 focus:text-cyan-100">Enviar STL</Link>
              <Link href="/blog/como-preparar-stl-impressao-3d-perfeita" prefetch={false} className="transition-colors hover:text-cyan-100 focus:text-cyan-100">Guia STL</Link>
              <Link href="/checkout" prefetch={false} className="transition-colors hover:text-cyan-100 focus:text-cyan-100">Checkout</Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 sm:grid-cols-4">
            {[
              { label: "Catálogo", value: catalogCount.toLocaleString("pt-BR"), icon: BadgeCheck },
              { label: "Mídia validada", value: String(realPhotoCount).padStart(2, "0"), icon: Camera },
              { label: "Pronta entrega", value: String(readyRealCount).padStart(2, "0"), icon: Clock3 },
              { label: reviewCount ? `${reviewCount} reviews` : "Prova social", value: ratingLabel, icon: Star },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[6px] border border-white/10 bg-white/[0.07] p-3 sm:rounded-[8px] sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/50 sm:text-[11px]">{item.label}</p>
                    <Icon className="h-3.5 w-3.5 text-cyan-100 sm:h-4 sm:w-4" />
                  </div>
                  <p className="mt-1.5 text-xl font-black text-white sm:mt-2 sm:text-2xl">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
          <div className="grid auto-cols-[minmax(140px,160px)] grid-flow-col gap-3 overflow-x-auto pb-1 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:gap-4">
            {showcase.map((product, index) => (
              <Link
                key={product.id}
                href={getProductUrl(product)}
                prefetch={false}
                className="group overflow-hidden rounded-[6px] border border-white/10 bg-black/30 sm:rounded-[8px]"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={product.image || product.images[0]}
                    alt={product.name}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 40vw, (max-width: 768px) 33vw, 220px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
                <div className="p-2.5 sm:p-3">
                  <p className="line-clamp-2 text-xs font-semibold text-white sm:text-sm">{product.name}</p>
                  <p className="mt-1 text-xs text-emerald-100">Mídia validada validada</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid gap-3 rounded-[6px] border border-cyan-300/18 bg-cyan-300/[0.08] p-3 sm:rounded-[8px] sm:p-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 sm:h-11 sm:w-11">
              <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </span>
            <p className="text-xs leading-6 text-white/75 sm:text-sm sm:leading-7">
              Produção local no RJ, rastreio por pedido e atendimento direto para validar cor, escala e acabamento antes de produzir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
