"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  answer: string | null;
  guestName: string | null;
  createdAt: string;
}

interface ProductQaProps {
  productId: string;
  questions: Question[];
}

/**
 * Product Q&A section.
 * Shows approved questions/answers and lets users submit new questions.
 */
export function ProductQa({ productId, questions: initialQuestions }: ProductQaProps) {
  const [questions] = useState<Question[]>(initialQuestions);
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const visible = expanded ? questions : questions.slice(0, 3);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/products/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, question, guestName: name || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        setQuestion("");
        setName("");
      } else {
        setStatus("error");
        setErrorMsg(data.message ?? "Erro ao enviar pergunta.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão.");
    }
  }

  return (
    <section className="mt-8 space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50">
        <MessageCircle className="h-4 w-4" />
        Perguntas e Respostas
      </h3>

      {questions.length === 0 && (
        <p className="text-sm text-white/40">Seja o primeiro a fazer uma pergunta.</p>
      )}

      <div className="space-y-3">
        {visible.map((q) => (
          <div key={q.id} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm">
            <p className="font-medium text-white/90">
              <span className="text-white/40 mr-1.5">P:</span>
              {q.question}
            </p>
            {q.answer ? (
              <p className="mt-2 text-white/60">
                <span className="text-cyan-400 mr-1.5">R:</span>
                {q.answer}
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/30 italic">Aguardando resposta da loja.</p>
            )}
            {q.guestName && (
              <p className="mt-1 text-xs text-white/30">— {q.guestName}</p>
            )}
          </div>
        ))}
      </div>

      {questions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Ver menos</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Ver todas as {questions.length} perguntas</>
          )}
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-white/8">
        <p className="text-xs uppercase tracking-widest text-white/40">Fazer uma pergunta</p>
        {status === "success" ? (
          <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-300">
            Pergunta enviada! A equipe responderá pelo canal de atendimento.
          </p>
        ) : (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome (opcional)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Sua pergunta sobre o produto…"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm"
              >
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            {status === "error" && (
              <p role="alert" className="text-xs text-red-400">{errorMsg}</p>
            )}
          </>
        )}
      </form>
    </section>
  );
}
