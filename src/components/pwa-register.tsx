"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Service worker registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        console.log('SW registered:', registration);
      }).catch((error) => {
        console.log('SW registration failed:', error);
      });
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt handler
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowHint(true);

      // Auto-hide after 10 seconds
      setTimeout(() => setShowHint(false), 10000);
    };

    window.addEventListener("beforeinstallprompt", handler as any);

    // App installed handler
    const installedHandler = () => {
      setIsInstalled(true);
      setShowHint(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as any);
      window.removeEventListener('appinstalled', installedHandler);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof window !== "undefined" && /Android/.test(navigator.userAgent);

  async function onInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      console.log('User choice:', choice.outcome);
    } finally {
      setDeferredPrompt(null);
      setShowHint(false);
    }
  }

  if (isInstalled || !showHint) return null;

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm text-orange-100 backdrop-blur">
          Você está offline
        </div>
      )}

      {/* PWA Install Prompt */}
      <div className="fixed bottom-20 right-5 z-50 w-[320px] rounded-[24px] border border-white/10 bg-black/90 p-4 backdrop-blur-xl shadow-2xl animate-fadeInUp">
        <button
          onClick={() => setShowHint(false)}
          className="absolute right-3 top-3 rounded-full p-1 hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-cyan-400/20 p-2">
            <Smartphone className="w-5 h-5 text-cyan-glow" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Instalar MDH 3D</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Adicione à tela inicial para acesso rápido e experiência nativa
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onInstall}
                className="btn-primary text-xs px-3 py-1.5 rounded-full"
              >
                <Download className="w-3 h-3 mr-1 inline" />
                Instalar
              </button>
              {isIOS && (
                <div className="text-xs text-white/50 self-center">
                  Toque em <span className="inline-block w-4 h-4 bg-white/20 rounded text-[10px] leading-4 text-center">⌃</span> → &ldquo;Adicionar à Tela Inicial&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
