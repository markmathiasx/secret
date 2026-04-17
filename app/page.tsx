import Link from "next/link";
import { Hero } from "@/components/hero-professional";
import { CatalogGrid } from "@/components/catalog-grid";
import { STLUploader } from "@/components/stl-uploader";
import { TrustSignals } from "@/components/trust-signals";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { getProductUrl, type Product } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { isProductRealPhoto, summarizeProductVisuals } from "@/lib/product-visuals";
import { whatsappNumber, whatsappMessage } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const visualSummary = summarizeProductVisuals(catalog);
  const realShowcase = catalog.filter((product) => isProductRealPhoto(product)).slice(0, 4);
  const readyRealCount = catalog.filter((product) => product.readyToShip && isProductRealPhoto(product)).length;
  const customizableRealCount = catalog.filter((product) => product.customizable && isProductRealPhoto(product)).length;

  return (
    <main>
      <Hero />

      <section id="home-featured" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="section-kicker">Catálogo com foto real</p>
          <h2 className="section-title">748 peças em estoque. Acesso rápido aos itens mais confiáveis.</h2>
          <p className="section-copy mt-4 max-w-3xl">
            Navegue entre peças com prova visual forte, orçamentos customizados ou busque material específico.
          </p>
        </div>

        <div className="grid gap-4 mb-8 sm:grid-cols-3">
          {[
            { label: "Foto real", value: String(visualSummary.fotoReal).padStart(2, "0") },
            { label: "Pronta entrega", value: String(readyRealCount).padStart(2, "0") },
            { label: "Customizável", value: String(customizableRealCount).padStart(2, "0") },
          ].map((item) => (
            <div key={item.label} className="glass-card p-4 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <CatalogGrid products={realShowcase} />

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/catalogo" className="btn-primary px-8 py-3">
            Ver catálogo completo
          </Link>
          <Link href="/imagem-para-impressao-3d" className="btn-secondary px-8 py-3">
            Enviar referência para orçamento
          </Link>
        </div>
      </section>

      <section id="home-paths" className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel p-8 md:p-10">
          <p className="section-kicker">Como começar</p>
          <h2 className="section-title">Três caminhos para encontrar exatamente o que você precisa.</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-3xl font-black text-cyan-300">1</p>
              <h3 className="mt-3 text-lg font-bold text-white">Browsar o catálogo</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                748 peças prontas. Filtre por material, preço, disponibilidade ou categoria. Pronto para comprar hoje.
              </p>
              <Link href="/catalogo" className="btn-glass mt-4 inline-block px-4 py-2 text-sm">
                Abrir catálogo
              </Link>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-3xl font-black text-emerald-300">2</p>
              <h3 className="mt-3 text-lg font-bold text-white">Orçar um projeto</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Envie uma imagem, STL ou briefing. Receba análise de viabilidade, material e prazo direto no WhatsApp.
              </p>
              <Link href="/imagem-para-impressao-3d" className="btn-glass mt-4 inline-block px-4 py-2 text-sm">
                Abrir orçador
              </Link>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-3xl font-black text-rose-300">3</p>
              <h3 className="mt-3 text-lg font-bold text-white">Falar com atendimento</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Dúvidas sobre material, prazo ou customização? Tire dúvidas direto pelo WhatsApp. Resposta em até 2h.
              </p>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} className="btn-glass mt-4 inline-block px-4 py-2 text-sm">
                WhatsApp
              </a>
            </article>
          </div>
        </div>
      </section>

      <section id="home-upload" className="bg-gradient-to-b from-black to-slate-950/20 py-6">
        <STLUploader />
      </section>

      <TrustSignals />

      <section id="home-cta-final" className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel p-8 md:p-10 text-center">
          <p className="section-kicker">Pronto para começar?</p>
          <h2 className="section-title">Escolha seu caminho: catálogo, orçamento ou conversa direta.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/catalogo" className="btn-primary px-8 py-3">
              Navegar catálogo
            </Link>
            <Link href="/imagem-para-impressao-3d" className="btn-secondary px-8 py-3">
              Enviar projeto
            </Link>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} className="btn-glass px-8 py-3">
              Falar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
