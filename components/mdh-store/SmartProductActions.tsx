"use client";

import { useEffect } from "react";
import { ArrowRight, MessageCircleMore, Share2, ShoppingBag } from "lucide-react";
import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import { buildWhatsappUrl } from "@/lib/mdh-store/links";
import { trackSmartStoreEvent } from "@/lib/mdh-store/analytics";
import { useSmartCart } from "@/components/mdh-store/smart-cart";

export function SmartProductActions({
  product,
  productUrl,
  whatsappNumber,
}: {
  product: SmartStoreProduct;
  productUrl: string;
  whatsappNumber: string;
}) {
  const cart = useSmartCart();
  const whatsappUrl = buildWhatsappUrl(product, { pageUrl: productUrl, whatsappNumber });

  async function shareProduct() {
    trackSmartStoreEvent("share_product", { item_id: product.sku, item_name: product.name });
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url: productUrl }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(productUrl).catch(() => undefined);
  }

  useEffect(() => {
    trackSmartStoreEvent("view_product", {
      item_id: product.sku,
      item_name: product.name,
      value: product.pixPrice,
      currency: "BRL",
    });
  }, [product.name, product.pixPrice, product.sku]);

  return (
    <div className="space-y-3">
      {product.nuvemshopUrl ? (
        <a
          href={product.nuvemshopUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackSmartStoreEvent("click_buy_nuvemshop", { item_id: product.sku, item_name: product.name });
            trackSmartStoreEvent("start_checkout", { item_id: product.sku, item_name: product.name, value: product.pixPrice, currency: "BRL" });
          }}
          className="btn-primary flex min-h-14 w-full justify-center gap-2 px-5 text-base"
        >
          Comprar com Pix ou Cartão <ArrowRight className="h-5 w-5" />
        </a>
      ) : (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackSmartStoreEvent("click_whatsapp_budget", { item_id: product.sku, item_name: product.name });
            trackSmartStoreEvent("purchase_lead", { item_id: product.sku, item_name: product.name, source: "product_primary_whatsapp" });
          }}
          className="btn-whatsapp flex min-h-14 w-full justify-center gap-2 px-5 text-base"
        >
          Pedir orçamento no WhatsApp <MessageCircleMore className="h-5 w-5" />
        </a>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            cart.add({
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              price: product.pixPrice,
              image: product.image,
            })
          }
          className="btn-secondary min-h-12 justify-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSmartStoreEvent("click_whatsapp_budget", { item_id: product.sku, item_name: product.name, secondary: true })}
          className="btn-secondary min-h-12 justify-center gap-2"
        >
          <MessageCircleMore className="h-4 w-4" /> Orçamento pelo WhatsApp
        </a>
      </div>
      <button type="button" onClick={() => void shareProduct()} className="btn-secondary min-h-12 w-full justify-center gap-2">
        <Share2 className="h-4 w-4" /> Compartilhar produto
      </button>
    </div>
  );
}
