"use client";

import { useEffect, useState } from "react";
import { isCanonicalOrigin, siteUrl } from "@/lib/site";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const RECOVERY_VERSION = "2026-03-18-cache-recovery-v1";
const RECOVERY_KEY = "mdh-sw-recovery-version";
const CACHE_PREFIXES = ["mdh3d-", "mdh-static-", "mdh-3d-"];

async function clearMdhCaches() {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))).map((key) => caches.delete(key)));
}

async function unregisterServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  return registrations.length > 0;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canonicalOrigin = new URL(siteUrl).origin;
    const currentOrigin = window.location.origin;
    const onCanonicalOrigin = isCanonicalOrigin(currentOrigin) || currentOrigin === canonicalOrigin;

    async function bootServiceWorker() {
      if (!("serviceWorker" in navigator)) return;

      const needsRecovery = window.localStorage.getItem(RECOVERY_KEY) !== RECOVERY_VERSION;
      const hadController = Boolean(navigator.serviceWorker.controller);

      if (!onCanonicalOrigin) {
        if (needsRecovery) {
          await unregisterServiceWorkers();
          await clearMdhCaches();
          window.localStorage.setItem(RECOVERY_KEY, RECOVERY_VERSION);
          if (hadController) {
            window.location.reload();
          }
        }
        return;
      }

      if (needsRecovery) {
        await unregisterServiceWorkers();
        await clearMdhCaches();
        window.localStorage.setItem(RECOVERY_KEY, RECOVERY_VERSION);
      }

      const registration = await navigator.serviceWorker.register(`/sw.js?v=${RECOVERY_VERSION}`);
      await registration.update().catch(() => {
        // ignore
      });

      if (needsRecovery && hadController) {
        window.location.reload();
      }
    }

    void bootServiceWorker().catch(() => {
      // ignore
    });

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowHint(true);
    };

    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setCompact(true), 9_000);
    return () => window.clearTimeout(timer);
  }, [showHint]);

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

  if (compact) {
    return (
      <button
        onClick={() => setCompact(false)}
        className="fixed bottom-20 right-5 z-50 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-xs font-semibold text-white backdrop-blur"
      >
        Instalar app MDH 3D
      </button>
    );
  }

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
        <button onClick={() => setCompact(true)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white">
          Recolher
        </button>
        <button onClick={() => setShowHint(false)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white">
          Fechar
        </button>
      </div>
    </div>
  );
}
