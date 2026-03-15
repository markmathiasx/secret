"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ReceiptText, ShoppingBag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { useStore } from "@/components/store-provider";
import { getProductUrl } from "@/lib/catalog";
import { getPaymentMethodLabel } from "@/lib/storefront";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { formatCurrency } from "@/lib/utils";

export default function AccountPage() {
  const { favoriteProducts, favoriteIds, quotes, toggleFavorite, removeQuote, cartCount } = useStore();
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) {
        setReady(true);
        return;
      }
      const { data } = await supabaseBrowser.auth.getUser();
      setEmail(data.user?.email || null);
      setPhone(data.user?.phone || null);
      setReady(true);
    }
    load();
  }, []);

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta</p>
      <h1 className="mt-3 text-4xl font-black text-white">Minha conta</h1>
      <p className="mt-4 max-w-3xl text-white/65">
        Aqui ficam seus favoritos, orçamentos recentes e o atalho para retomar a compra sem depender de login completo.
      </p>

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Acesso</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Entrar / Minha conta</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
              {ready && (email || phone) ? "Logado" : "Modo visitante"}
            </span>
          </div>

          {ready && (email || phone) ? (
            <>
              <p className="mt-5 text-white/70">Logado como</p>
              {email ? <p className="mt-2 font-mono text-white">{email}</p> : null}
              {phone ? <p className="mt-2 font-mono text-white">{phone}</p> : null}
              <button
                onClick={signOut}
                className="mt-6 rounded-full border border-white/10 bg-black/20 px-6 py-3 text-sm font-semibold text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <p className="mt-5 text-white/65">
                Você pode continuar usando favoritos, carrinho e orçamentos sem login. Se quiser autenticar, entre por e-mail, Google ou Apple.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100"
              >
                Ir para login
              </Link>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Favoritos", value: favoriteIds.length, icon: Heart },
            { label: "Orçamentos", value: quotes.length, icon: ReceiptText },
            { label: "Carrinho", value: cartCount, icon: ShoppingBag }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <Icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-4 text-sm text-white/55">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Favoritos</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Peças salvas para comparar</h2>
          </div>
          <Link href="/catalogo" className="text-sm font-semibold text-cyan-100">
            Ver catálogo completo
          </Link>
        </div>

        {favoriteProducts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {favoriteProducts.map((product) => (
              <article key={product.id} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <Link href={getProductUrl(product)} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
                    <ProductImage
                      src={`/catalog-assets/${product.id}.webp`}
                      alt={product.name}
                      label={`${product.name} • ${product.category}`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                  </div>
                </Link>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-200">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
                <p className="mt-2 text-sm text-white/60">{formatCurrency(product.pricePix)} no Pix</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={getProductUrl(product)}
                    className="flex-1 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-center text-sm font-semibold text-cyan-100"
                  >
                    Ver produto
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/60">
            Você ainda não salvou nenhum produto. Use o coração nos cards ou na página do produto.
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Orçamentos</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Solicitações recentes</h2>
        </div>

        {quotes.length ? (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{quote.productName}</p>
                  <p className="mt-2 text-sm text-white/60">
                    {quote.id} • {getPaymentMethodLabel(quote.paymentMethod)} • {quote.neighborhood}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {new Date(quote.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-white/45">Total estimado no Pix</p>
                    <p className="text-lg font-bold text-cyan-100">{formatCurrency(quote.estimatedTotalPix)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuote(quote.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/60">
            Seus orçamentos enviados pelo formulário vão aparecer aqui.
          </div>
        )}
      </div>
    </section>
  );
}
