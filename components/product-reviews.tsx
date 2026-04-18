"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { trackReviewRequest, trackReviewSubmitted } from "@/lib/analytics";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} dias atrás`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} meses atrás`;
  return `${Math.floor(months / 12)} anos atrás`;
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5" role="group" aria-label={`Nota: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-white/25"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productSlug, productSku }: { productSlug: string; productSku: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    authorName: "",
    authorEmail: "",
    rating: 0,
    title: "",
    body: "",
  });

  useEffect(() => {
    fetch(`/api/products/${productSlug}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setReviews(data.reviews ?? []);
          setTotal(data.total ?? 0);
          setAvgRating(data.avgRating ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) {
      setError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        setShowForm(false);
        trackReviewSubmitted(productSlug, productSku);
      } else {
        setError(data.error || "Erro ao enviar avaliação.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Avaliações</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">
            Reviews ficam visíveis após moderação e podem aparecer como compra verificada quando vierem de um pedido real.
          </p>
          {avgRating !== null ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-black text-amber-400">{avgRating.toFixed(1)}</span>
              <div>
                <StarRating value={Math.round(avgRating)} readonly />
                <p className="mt-1 text-xs text-white/55">{total} avaliação{total !== 1 ? "ões" : ""}</p>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-white/55">
              Este item ainda está reunindo avaliações reais. Se você já comprou, sua nota ajuda outros clientes.
            </p>
          )}
        </div>
        <button
          onClick={() => {
            if (!showForm) trackReviewRequest(productSlug, productSku);
            setShowForm((v) => !v);
          }}
          className="btn-secondary"
        >
          {showForm ? "Cancelar" : "Escrever avaliação"}
        </button>
      </div>

      {submitted && (
        <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Avaliação enviada com sucesso! Ela ficará visível após moderação.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[24px] border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="font-semibold text-white">Sua avaliação</h3>
          <div>
            <label className="mb-2 block text-sm text-white/70">Nota *</label>
            <StarRating value={form.rating} onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">Seu nome *</label>
            <input
              required
              value={form.authorName}
              onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
              className="field-base w-full"
              placeholder="Ex: João S."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">E-mail (não será publicado)</label>
            <input
              type="email"
              value={form.authorEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, authorEmail: e.target.value }))}
              className="field-base w-full"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">Título (opcional)</label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="field-base w-full"
              placeholder="Resumo da sua experiência"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">Comentário (opcional)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              className="field-base w-full min-h-24 resize-y"
              placeholder="Conte sua experiência com o produto..."
            />
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-white/50">Carregando avaliações...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{review.authorName}</p>
                    {review.verifiedPurchase && (
                      <span className="text-xs text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <StarRating value={review.rating} readonly />
                </div>
                <p className="text-xs text-white/40">
                  {timeAgo(review.createdAt)}
                </p>
              </div>
              {review.title && <p className="mt-3 font-semibold text-white">{review.title}</p>}
              {review.body && <p className="mt-2 text-sm leading-7 text-white/70">{review.body}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm text-white/55">Ainda estamos reunindo avaliações reais deste produto.</p>
        </div>
      )}
    </div>
  );
}
