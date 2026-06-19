"use client";

import { useMemo, useState } from "react";
import { HelpCircle, ImageIcon, PackageCheck, Ruler, Star, Truck, X } from "lucide-react";
import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import type { LocalQuestion, LocalReview } from "@/lib/mdh-store/social-proof";
import { trackSmartStoreEvent } from "@/lib/mdh-store/analytics";
import { formatCurrency } from "@/lib/utils";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} aria-hidden="true" className={`h-4 w-4 ${star <= value ? "fill-amber-300 text-amber-300" : "text-white/25"}`} />
      ))}
    </span>
  );
}

export function ProductMediaGallery({ product }: { product: SmartStoreProduct }) {
  const images = product.gallery.length ? product.gallery : [product.image || "/catalog-assets/product-placeholder.webp"];
  const [active, setActive] = useState(images[0]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const activeIsPlaceholder = active.includes("/catalog-assets/product-placeholder");

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="group relative block w-full overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-left"
        aria-label={`Abrir zoom de ${product.name}`}
      >
        <span className="absolute right-5 top-5 z-10 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs font-black text-white/82 backdrop-blur">
          Zoom
        </span>
        {activeIsPlaceholder ? (
          <span className="absolute bottom-5 left-5 z-10 max-w-[80%] rounded-[8px] border border-amber-200/25 bg-amber-300/14 px-3 py-2 text-xs font-black text-amber-50 backdrop-blur">
            Foto ilustrativa - produto real sob aprovação
          </span>
        ) : null}
        <span className="block aspect-square overflow-hidden rounded-[8px] bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        </span>
      </button>

      <div className="grid grid-cols-5 gap-2">
        {images.slice(0, 10).map((image, index) => (
          <button
            type="button"
            key={`${image}-${index}`}
            onClick={() => setActive(image)}
            className={`aspect-square overflow-hidden rounded-[8px] border bg-black/30 transition ${
              active === image ? "border-cyan-200" : "border-white/10 hover:border-white/30"
            }`}
            aria-label={`Ver imagem ${index + 1} de ${product.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={`${product.name} - imagem ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {product.videoUrl ? (
        <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center gap-2">
          <ImageIcon className="h-4 w-4" /> Ver vídeo do produto
        </a>
      ) : null}

      {zoomOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/82 p-4 backdrop-blur" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[8px] border border-white/10 bg-[#071016] p-3">
            <button type="button" onClick={() => setZoomOpen(false)} className="absolute right-5 top-5 z-10 rounded-full bg-black/70 p-3 text-white" aria-label="Fechar zoom">
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active} alt={`${product.name} ampliado`} className="max-h-[86vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProductSpecsPanel({ product }: { product: SmartStoreProduct }) {
  return (
    <section className="mt-8 rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
      <p className="section-kicker">Detalhes completos</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/46">
            <PackageCheck className="h-4 w-4 text-cyan-100" /> Material
          </p>
          <p className="mt-2 font-bold text-white">{product.material}</p>
        </div>
        <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/46">
            <Ruler className="h-4 w-4 text-cyan-100" /> Personalização
          </p>
          <p className="mt-2 font-bold text-white">{product.personalizable ? "Aceita cor, nome, logo ou ajuste sob consulta" : "Ajustes sob consulta"}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/46">Cores disponíveis</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <span key={color} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-bold text-white/76">
              {color}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/46">Cuidados de uso</p>
        <ul className="mt-2 grid gap-2 text-sm leading-6 text-white/62">
          {product.careInstructions.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProductShippingEstimator({ product }: { product: SmartStoreProduct }) {
  const [cep, setCep] = useState("");
  const cleanCep = cep.replace(/\D/g, "").slice(0, 8);
  const ready = cleanCep.length === 8;
  const local = cleanCep.startsWith("20") || cleanCep.startsWith("21") || cleanCep.startsWith("22") || cleanCep.startsWith("23");
  const shipping = ready ? (local ? 12 : 24) + Math.max(0, product.weightKg || 0) * 8 : 0;

  return (
    <section className="mt-8 rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
      <p className="section-kicker">Frete e prazo</p>
      <label className="mt-4 block">
        <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/46">
          <Truck className="h-4 w-4 text-cyan-100" /> CEP
        </span>
        <input
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          inputMode="numeric"
          placeholder="00000-000"
          className="industrial-input"
          aria-describedby="shipping-estimate"
        />
      </label>
      <div id="shipping-estimate" className="mt-3 rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/64">
        {ready ? (
          <>
            <p className="font-black text-white">Estimativa: {formatCurrency(shipping)} de envio/combinação local</p>
            <p>Produção: {product.productionWindow}. Entrega ou retirada são confirmadas no WhatsApp.</p>
          </>
        ) : (
          <p>Digite o CEP para ver uma estimativa inicial. O valor final é confirmado no atendimento.</p>
        )}
      </div>
    </section>
  );
}

export function LocalReviewsAndQuestions({
  product,
  reviews,
  questions,
}: {
  product: SmartStoreProduct;
  reviews: LocalReview[];
  questions: LocalQuestion[];
}) {
  const [localReview, setLocalReview] = useState("");
  const [localQuestion, setLocalQuestion] = useState("");
  const average = useMemo(() => {
    if (!reviews.length) return null;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-2">
      <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-kicker">Avaliações</p>
            <h2 className="mt-1 text-2xl font-black text-white">Fotos e comentários</h2>
          </div>
          {average ? (
            <div className="text-right">
              <p className="text-2xl font-black text-amber-200">{average.toFixed(1)}</p>
              <Stars value={Math.round(average)} />
            </div>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={`${review.productSlug}-${review.author}-${review.createdAt}`} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  {review.photo ? (
                    <span className="block h-16 w-16 overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={review.photo} alt={`Foto enviada por ${review.author}`} className="h-full w-full object-cover" loading="lazy" />
                    </span>
                  ) : null}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-white">{review.author}</strong>
                      {review.verified ? <span className="rounded-full bg-emerald-300/10 px-2 py-0.5 text-xs font-bold text-emerald-100">Compra verificada</span> : null}
                    </div>
                    <Stars value={review.rating} />
                    <p className="mt-2 font-bold text-white">{review.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/62">{review.comment}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[8px] border border-dashed border-white/12 p-4 text-sm text-white/56">Este produto ainda está reunindo avaliações locais.</p>
          )}
        </div>
        <form
          className="mt-4 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!localReview.trim()) return;
            trackSmartStoreEvent("purchase_lead", { item_id: product.sku, item_name: product.name, source: "review_form" });
            setLocalReview("");
          }}
        >
          <label className="text-sm font-bold text-white/70" htmlFor="local-review">
            Escrever avaliação rápida
          </label>
          <textarea id="local-review" value={localReview} onChange={(event) => setLocalReview(event.target.value)} className="industrial-input min-h-24 resize-y" placeholder="Conte o que achou da peça..." />
          <button type="submit" className="btn-secondary justify-center">Enviar para moderação local</button>
        </form>
      </div>

      <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
        <p className="section-kicker">Perguntas</p>
        <h2 className="mt-1 text-2xl font-black text-white">Q&A do produto</h2>
        <div className="mt-4 space-y-3">
          {[...questions, ...product.faqs.map((faq) => ({ productSlug: product.slug, question: faq.question, answer: faq.answer }))].map((item) => (
            <article key={item.question} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
              <p className="flex items-start gap-2 font-black text-white">
                <HelpCircle className="mt-0.5 h-4 w-4 text-cyan-100" /> {item.question}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/62">{item.answer}</p>
            </article>
          ))}
        </div>
        <form
          className="mt-4 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!localQuestion.trim()) return;
            trackSmartStoreEvent("purchase_lead", { item_id: product.sku, item_name: product.name, source: "question_form" });
            setLocalQuestion("");
          }}
        >
          <label className="text-sm font-bold text-white/70" htmlFor="local-question">
            Enviar pergunta
          </label>
          <textarea id="local-question" value={localQuestion} onChange={(event) => setLocalQuestion(event.target.value)} className="industrial-input min-h-24 resize-y" placeholder="Digite sua dúvida..." />
          <button type="submit" className="btn-secondary justify-center">Registrar pergunta</button>
        </form>
      </div>
    </section>
  );
}
