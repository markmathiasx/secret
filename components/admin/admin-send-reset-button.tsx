"use client";

import { useState } from "react";

export function AdminSendResetButton({
  userId,
  userEmail,
  userName,
}: {
  userId: string;
  userEmail: string;
  userName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendReset() {
    if (!confirm(`Enviar link de redefinição de senha para ${userName} (${userEmail})?\n\nO link será enviado para o e-mail do administrador.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || "Erro ao enviar link.");
        return;
      }

      setSent(true);
    } catch {
      setError("Falha de rede.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <span className="text-xs text-emerald-300">✓ Link enviado</span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSendReset}
        disabled={loading || !userEmail}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
      >
        {loading ? "Enviando..." : "Redefinir senha"}
      </button>
      {error && <span className="text-[10px] text-rose-300">{error}</span>}
    </div>
  );
}
