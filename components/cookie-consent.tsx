"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "mdh_cookie_consent";

type ConsentState = "accepted" | "rejected" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
      setConsent(stored);
    } catch {
      setConsent(null);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // ignore storage errors
    }
    setConsent("accepted");
  }

  function reject() {
    try {
      localStorage.setItem(CONSENT_KEY, "rejected");
    } catch {
      // ignore storage errors
    }
    setConsent("rejected");
  }

  if (consent !== null && consent !== "loading") return null;
  if (consent === "loading") return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Aviso de uso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[200] flex flex-col gap-4 border-t border-white/10 bg-slate-950/96 px-4 py-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6 sm:px-6 md:px-10"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
        <p className="text-sm leading-6 text-white/75">
          Usamos cookies para melhorar sua experiência, lembrar o carrinho e analisar acessos.
          Ao continuar navegando você concorda com nossa{" "}
          <Link
            href="/politica-de-privacidade"
            className="font-semibold text-cyan-200 underline underline-offset-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            política de privacidade
          </Link>
          .
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          onClick={reject}
          aria-label="Recusar cookies não essenciais"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Recusar
        </button>
        <button
          onClick={accept}
          aria-label="Aceitar cookies e continuar navegando"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-400/90 px-5 py-2 text-sm font-bold text-black transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Aceitar cookies
        </button>
      </div>
    </div>
  );
}
