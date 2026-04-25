"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface NpsSurveyProps {
  orderId?: string;
  onClose?: () => void;
}

/**
 * Post-purchase NPS survey (0-10 scale).
 * Shown after order confirmation. Submits to /api/nps.
 */
export function NpsSurvey({ orderId, onClose }: NpsSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment, orderId }),
      });
      const data = await res.json();
      setStatus(data.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  function scoreLabel(s: number) {
    if (s <= 6) return "Detrator";
    if (s <= 8) return "Neutro";
    return "Promotor";
  }

  function scoreColor(s: number) {
    if (s <= 6) return "border-red-400/30 bg-red-400/10 text-red-300";
    if (s <= 8) return "border-amber-400/30 bg-amber-400/10 text-amber-300";
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "success") {
    return (
      <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/8 p-6 text-center">
        <Star className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
        <p className="text-sm font-semibold text-emerald-300">Obrigado pelo feedback!</p>
        <p className="text-xs text-white/50 mt-1">Sua opinião nos ajuda a melhorar.</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 text-xs text-white/40 hover:text-white/60 transition">
            Fechar
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/3 p-6 space-y-5">
      <div>
        <p className="text-sm font-semibold text-white">De 0 a 10, o quanto você recomendaria a MDH 3D para um amigo?</p>
        <p className="text-xs text-white/40 mt-1">0 = nunca recomendaria · 10 = com certeza recomendaria</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
              score === n
                ? scoreColor(n)
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {score !== null && (
        <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${scoreColor(score)}`}>
          {scoreLabel(score)} — {score <= 6 ? "O que poderíamos melhorar?" : score <= 8 ? "O que faltou para um 10?" : "Ótimo! O que você mais gostou?"}
        </div>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Deixe um comentário (opcional)…"
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none resize-none"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={score === null || status === "loading"}
          className="btn-primary flex-1 rounded-2xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {status === "loading" ? "Enviando…" : "Enviar avaliação"}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/50 hover:text-white/70 transition">
            Depois
          </button>
        )}
      </div>
    </form>
  );
}
