"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore
      });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowHint(true);
    };

    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  async function onInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setShowHint(false);
    }
  }

  if (!showHint) return null;

  return (
    <div className="fixed bottom-20 right-5 z-50 w-[320px] rounded-[24px] border border-white/10 bg-black/70 p-4 backdrop-blur">
      <p className="text-sm font-semibold text-white">Adicionar MDH 3D como app</p>
      <p className="mt-2 text-xs leading-6 text-white/65">
        {isIOS
          ? "No iPhone: toque em Compartilhar → Adicionar à Tela de Início."
          : "No Android/Chrome: clique em Instalar para fixar como app."}
      </p>

      <div className="mt-3 flex gap-2">
        {deferredPrompt ? (
          <button onClick={onInstall} className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950">
            Instalar
          </button>
        ) : null}
        <button onClick={() => setShowHint(false)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white">
          Fechar
        </button>
      </div>
    </div>
  );
}
