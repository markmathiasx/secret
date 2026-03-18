"use client";

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { Wifi, WifiOff, Download, RefreshCw } from 'lucide-react';

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    // Check initial status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hide offline message after 5 seconds when back online
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => setShowOfflineMessage(false), 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, showOfflineMessage]);

  return (
    <>
      {children}
      <OfflineIndicator isOnline={isOnline} showMessage={showOfflineMessage} />
    </>
  );
}

interface OfflineIndicatorProps {
  isOnline: boolean;
  showMessage: boolean;
}

function OfflineIndicator({ isOnline, showMessage }: OfflineIndicatorProps) {
  if (isOnline && !showMessage) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300
      ${isOnline
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
      }
    `}>
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {isOnline ? 'Conexão restaurada' : 'Sem conexão'}
      </span>
    </div>
  );
}

// Hook for offline detection
export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset wasOffline after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

// PWA Install Prompt
interface PwaInstallPromptProps {
  className?: string;
}

export function PwaInstallPrompt({ className = '' }: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 md:left-auto md:right-4 md:max-w-sm ${className}`}>
      <div className="flex items-start gap-3">
        <Download className="h-6 w-6 text-cyan-glow flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Instalar App</h3>
          <p className="text-sm text-gray-600 mt-1">
            Instale nossa app para uma experiência melhor com acesso offline e notificações.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-cyan-glow text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors text-sm"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Worker Manager
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              setInstalling(true);
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  setInstalling(false);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    registration,
    updateAvailable,
    installing,
    updateServiceWorker,
  };
}

// Update notification
interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white rounded-lg shadow-lg p-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start gap-3">
        <RefreshCw className="h-6 w-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">Atualização Disponível</h3>
          <p className="text-sm opacity-90 mt-1">
            Uma nova versão está disponível. Atualize para obter as últimas funcionalidades.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onUpdate}
              className="px-4 py-2 bg-white text-blue-500 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Atualizar
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-blue-100 hover:text-white transition-colors text-sm"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cache status hook
export function useCacheStatus() {
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'cached' | 'uncached'>('checking');

  useEffect(() => {
    const checkCache = async () => {
      try {
        const cacheNames = await caches.keys();
        const hasCache = cacheNames.some(name => name.includes('mdh-cache'));
        setCacheStatus(hasCache ? 'cached' : 'uncached');
      } catch (error) {
        setCacheStatus('uncached');
      }
    };

    checkCache();
  }, []);

  return cacheStatus;
}

// Network status with retry functionality
export function useNetworkRetry() {
  const { isOnline } = useOffline();
  const [retrying, setRetrying] = useState(false);

  const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 3) => {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        setRetrying(true);
        const result = await requestFn();
        setRetrying(false);
        return result;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          setRetrying(false);
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
  };

  return { retryRequest, retrying, isOnline };
}

// Offline queue for actions
interface QueuedAction {
  id: string;
  action: () => Promise<any>;
  timestamp: number;
  retries: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const { isOnline, wasOffline } = useOffline();

  const addToQueue = (action: () => Promise<any>) => {
    const queuedAction: QueuedAction = {
      id: Date.now().toString(),
      action,
      timestamp: Date.now(),
      retries: 0,
    };

    setQueue(prev => [...prev, queuedAction]);
    localStorage.setItem('offline-queue', JSON.stringify([...queue, queuedAction]));
  };

  const processQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0) return;

    const remainingActions: QueuedAction[] = [];

    for (const queuedAction of queue) {
      try {
        await queuedAction.action();
      } catch (error) {
        // Retry logic
        if (queuedAction.retries < 3) {
          remainingActions.push({
            ...queuedAction,
            retries: queuedAction.retries + 1,
          });
        }
      }
    }

    setQueue(remainingActions);
    localStorage.setItem('offline-queue', JSON.stringify(remainingActions));
  }, [isOnline, queue]);

  // Load queue from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('offline-queue');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setQueue(parsed);
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    }
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      processQueue();
    }
  }, [wasOffline, isOnline, processQueue]);

  return {
    queue,
    addToQueue,
    processQueue,
    queueLength: queue.length,
  };
}

// Background sync for PWA
export function useBackgroundSync() {
  const registerBackgroundSync = async (tag: string, request: Request) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);

        // Store the request for the service worker
        const syncData = { tag, request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          body: await request.text(),
        }};

        localStorage.setItem(`sync-${tag}`, JSON.stringify(syncData));
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  };

  return { registerBackgroundSync };
}