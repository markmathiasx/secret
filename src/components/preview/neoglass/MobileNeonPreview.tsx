"use client";

import Image from "next/image";
import { Home, MessageCircleMore, Search, ShoppingCart, UserRound } from "lucide-react";
import type { NeoGlassPreviewProduct } from "@/src/components/preview/neoglass/types";

export function MobileNeonPreview({ products, whatsappUrl }: { products: NeoGlassPreviewProduct[]; whatsappUrl: string }) {
  const cartItems = products.slice(0, 2);
  const subtotal = cartItems.reduce((sum, product) => sum + product.pricePix, 0);

  return (
    <section className="neo-section neo-mobile-section" data-testid="neoglass-mobile-preview">
      <div className="neo-section-heading">
        <p className="neo-eyebrow">Mobile neon flow</p>
        <h2>Compra mobile com busca fixa, carrinho visual e WhatsApp sempre presente.</h2>
      </div>

      <div className="neo-phone-frame" aria-label="Mockup mobile NeoGlass">
        <div className="neo-phone-status" />
        <div className="neo-phone-header">
          <strong>MDH3D</strong>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir WhatsApp">
            <MessageCircleMore />
          </a>
        </div>
        <label className="neo-phone-search">
          <Search aria-hidden="true" />
          <input placeholder="Buscar chaveiro, geek, setup..." aria-label="Busca mobile preview" />
        </label>
        <div className="neo-phone-list">
          {products.slice(0, 3).map((product) => (
            <article key={product.id}>
              <Image src={product.image} alt={product.imageAlt} width={80} height={80} />
              <span>
                <strong>{product.name}</strong>
                <small>Pix {product.pricePixLabel}</small>
              </span>
            </article>
          ))}
        </div>
        <aside className="neo-cart-drawer" aria-label="Carrinho visual">
          <span>Carrinho</span>
          <strong>{cartItems.length} itens · {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
        </aside>
        <div className="neo-bottom-menu" aria-label="Menu inferior mobile">
          <span>
            <Home />
            Home
          </span>
          <span>
            <Search />
            Catálogo
          </span>
          <span>
            <ShoppingCart />
            Carrinho
          </span>
          <span>
            <MessageCircleMore />
            WhatsApp
          </span>
          <span>
            <UserRound />
            Conta
          </span>
        </div>
      </div>
    </section>
  );
}
