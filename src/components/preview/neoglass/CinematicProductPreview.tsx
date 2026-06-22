"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Box, Clock3, MessageCircleMore, Ruler } from "lucide-react";
import type { NeoGlassPreviewProduct } from "@/src/components/preview/neoglass/types";

function buildWhatsappUrl(product: NeoGlassPreviewProduct) {
  const message = `Olá, vim pelo preview NeoGlass da MDH3D e quero falar sobre o produto: ${product.name}. SKU: ${product.sku}. Link: ${product.href}.`;
  return `https://wa.me/5521974137662?text=${encodeURIComponent(message)}`;
}

export function CinematicProductPreview({ product }: { product: NeoGlassPreviewProduct }) {
  const specs = [
    { label: "SKU", value: product.sku, icon: BadgeCheck },
    { label: "Material", value: product.material, icon: Box },
    { label: "Prazo", value: product.productionWindow, icon: Clock3 },
    { label: "Categoria", value: product.category, icon: Ruler },
  ];

  return (
    <section className="neo-section neo-cinematic" data-testid="neoglass-cinematic-product">
      <div className="neo-cinematic-media">
        <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 900px) 88vw, 520px" />
      </div>
      <div className="neo-cinematic-copy">
        <p className="neo-eyebrow">Product detail simulation</p>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="neo-cinematic-price">
          <span>Preço Pix</span>
          <strong>{product.pricePixLabel}</strong>
          <small>Cartão {product.priceCardLabel}</small>
        </div>
        <div className="neo-spec-grid">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.label}>
                <Icon aria-hidden="true" />
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            );
          })}
        </div>
        <div className="neo-hero-actions">
          <Link className="neo-btn neo-btn-solid neo-btn-large" href={product.href}>
            Comprar com Pix ou Cartão
          </Link>
          <a className="neo-btn neo-btn-ghost neo-btn-large" href={buildWhatsappUrl(product)} target="_blank" rel="noopener noreferrer">
            <MessageCircleMore aria-hidden="true" />
            Orçamento pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
