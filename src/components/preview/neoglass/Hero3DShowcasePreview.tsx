"use client";

import Image from "next/image";
import Link from "next/link";
import { Cpu, DatabaseZap, Gauge, RadioTower, Sparkles } from "lucide-react";
import type { NeoGlassPreviewMetrics, NeoGlassPreviewProduct } from "@/src/components/preview/neoglass/types";

type Hero3DShowcasePreviewProps = {
  product: NeoGlassPreviewProduct;
  metrics: NeoGlassPreviewMetrics;
  whatsappUrl: string;
  catalogUrl: string;
};

export function Hero3DShowcasePreview({ product, metrics, whatsappUrl, catalogUrl }: Hero3DShowcasePreviewProps) {
  const stats = [
    { label: "Produtos ativos", value: metrics.activeProducts.toLocaleString("pt-BR") },
    { label: "Pix/cartão", value: "R$ +1" },
    { label: "Produção", value: product.productionWindow },
    { label: "Marketplace ready", value: metrics.scoreLabel },
  ];

  const floating = [
    { title: "Product Master", value: `${metrics.activeProducts} SKUs`, icon: DatabaseZap },
    { title: "PriceOps", value: "Pix + cartão", icon: Gauge },
    { title: "ChannelOps", value: "7 canais", icon: RadioTower },
  ];

  return (
    <section className="neo-hero" data-testid="neoglass-hero">
      <div className="neo-hero-copy">
        <p className="neo-eyebrow">
          <Sparkles aria-hidden="true" />
          MDH3D Commerce OS 2026
        </p>
        <h1>Impressão 3D sob encomenda com visual de futuro.</h1>
        <p className="neo-hero-subtitle">
          Preview isolado de uma vitrine premium para produtos reais da MDH3D: busca rápida, catálogo neon,
          orçamento no WhatsApp e operação pronta para canais de marketplace.
        </p>
        <div className="neo-hero-actions">
          <a className="neo-btn neo-btn-solid neo-btn-large" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Orçar no WhatsApp
          </a>
          <Link className="neo-btn neo-btn-ghost neo-btn-large" href={catalogUrl}>
            Ver catálogo
          </Link>
        </div>
        <dl className="neo-hero-stats" aria-label="Métricas principais do preview">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="neo-hero-stage" aria-label={`Produto em destaque: ${product.name}`}>
        <div className="neo-product-hologram">
          <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 900px) 82vw, 470px" priority />
        </div>
        <div className="neo-hero-product-card">
          <span>{product.sku}</span>
          <strong>{product.name}</strong>
          <small>
            Pix {product.pricePixLabel} · cartão {product.priceCardLabel}
          </small>
        </div>
        <div className="neo-floating-stack" aria-label="Sistemas operacionais do comércio MDH3D">
          {floating.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="neo-floating-stat">
                <Icon aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.value}</small>
                </span>
              </div>
            );
          })}
        </div>
        <div className="neo-printer-core" aria-hidden="true">
          <Cpu />
          <span>Live print queue</span>
        </div>
      </div>
    </section>
  );
}
