"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircleMore, ShoppingBag } from "lucide-react";
import type { NeoGlassPreviewProduct } from "@/src/components/preview/neoglass/types";

function buildProductWhatsappUrl(product: NeoGlassPreviewProduct) {
  const message = `Olá, vim pelo preview NeoGlass da MDH3D e quero orçamento/comprar: ${product.name}. SKU: ${product.sku}. Link: ${product.href}`;
  return `https://wa.me/5521974137662?text=${encodeURIComponent(message)}`;
}

export function ProductGlassCardPreview({ product, compact = false }: { product: NeoGlassPreviewProduct; compact?: boolean }) {
  return (
    <article className={compact ? "neo-product-card neo-product-card-compact" : "neo-product-card"}>
      <Link href={product.href} className="neo-product-media" aria-label={`Abrir ${product.name}`}>
        <Image src={product.image} alt={product.imageAlt} fill sizes={compact ? "180px" : "(max-width: 900px) 46vw, 260px"} />
      </Link>
      <div className="neo-product-content">
        <div className="neo-product-kicker">
          <span>{product.sku}</span>
          <span>{product.category}</span>
        </div>
        <h3>{product.name}</h3>
        {!compact ? <p>{product.description}</p> : null}
        <div className="neo-product-badges">
          {product.badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <div className="neo-product-prices" aria-label={`Preços de ${product.name}`}>
          <strong>Pix {product.pricePixLabel}</strong>
          <small>Cartão {product.priceCardLabel}</small>
        </div>
        <div className="neo-product-actions">
          <Link href={product.href} className="neo-btn neo-btn-solid">
            <ShoppingBag aria-hidden="true" />
            Comprar
          </Link>
          <a className="neo-btn neo-btn-ghost" href={buildProductWhatsappUrl(product)} target="_blank" rel="noopener noreferrer">
            <MessageCircleMore aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
