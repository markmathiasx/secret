"use client";

import { useEffect, useRef, useState } from "react";
import { useCustomerSession } from "@/lib/customer-session-client";

declare global {
  interface Window {
    chatwootSettings?: Record<string, unknown>;
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      toggle: (state?: "open" | "close") => void;
      setUser: (
        identifier: string,
        attributes: {
          email?: string;
          name?: string;
          avatar_url?: string;
          phone_number?: string;
          identifier_hash?: string;
        }
      ) => void;
      reset: () => void;
    };
    __mdhChatwootReady?: boolean;
    __mdhChatwootBootKey?: string;
  }
}

const CHATWOOT_READY_EVENT = "mdh:chatwoot-ready";
const CHATWOOT_ERROR_EVENT = "mdh:chatwoot-error";

type ChatwootIdentityPayload = {
  ok: boolean;
  user?: {
    identifier: string;
    identifierHash?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
};

async function fetchChatwootIdentity() {
  const response = await fetch("/api/chatwoot/identity", {
    credentials: "same-origin",
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as ChatwootIdentityPayload;
  if (!response.ok || !data?.ok || !data.user?.identifier) {
    return null;
  }

  return data.user;
}

export function ChatwootWidget({
  enabled,
  baseUrl,
  websiteToken,
}: {
  enabled: boolean;
  baseUrl: string | null;
  websiteToken: string;
}) {
  const session = useCustomerSession();
  const hadAuthenticatedUserRef = useRef(false);
  const pendingOpenRef = useRef(false);
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    if (!enabled || !baseUrl || !websiteToken || typeof window === "undefined") {
      return;
    }

    const bootKey = `${baseUrl}::${websiteToken}`;

    const handleReady = () => {
      window.__mdhChatwootReady = true;
      setWidgetReady(true);
      if (pendingOpenRef.current && window.$chatwoot) {
        window.$chatwoot.toggle("open");
        pendingOpenRef.current = false;
      }
      window.dispatchEvent(new CustomEvent(CHATWOOT_READY_EVENT));
    };

    const handleError = () => {
      window.__mdhChatwootBootKey = undefined;
      setWidgetReady(false);
      window.dispatchEvent(new CustomEvent(CHATWOOT_ERROR_EVENT));
    };

    const handleOpen = () => {
      if (!window.$chatwoot) {
        pendingOpenRef.current = true;
        return;
      }
      window.$chatwoot?.toggle("open");
    };

    const handleClose = () => {
      window.$chatwoot?.toggle("close");
    };

    window.chatwootSettings = {
      hideMessageBubble: true,
      position: "right",
      locale: "pt_BR",
      useBrowserLanguage: true,
      darkMode: "auto",
      type: "standard",
      launcherTitle: "Atendimento MDH",
      welcomeTitle: "Fale com a MDH 3D",
      welcomeDescription: "Use o chat para tirar dúvidas e seguir com o atendimento comercial.",
      availableMessage: "Equipe pronta para continuar sua compra.",
      unavailableMessage: "Deixe sua mensagem que a equipe continua o atendimento.",
      showUnreadMessagesDialog: false,
    };

    window.addEventListener("chatwoot:ready", handleReady);
    window.addEventListener("chatwoot:error", handleError);
    window.addEventListener("mdh:chatwoot-open", handleOpen);
    window.addEventListener("mdh:closechat", handleClose);

    if (window.__mdhChatwootBootKey !== bootKey) {
      window.__mdhChatwootBootKey = bootKey;
      const script = document.createElement("script");
      script.src = `${baseUrl}/packs/js/sdk.js`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.chatwootSDK?.run({
          websiteToken,
          baseUrl,
        });
      };
      script.onerror = handleError;
      document.body.appendChild(script);
    } else if (window.__mdhChatwootReady) {
      handleReady();
    }

    return () => {
      window.removeEventListener("chatwoot:ready", handleReady);
      window.removeEventListener("chatwoot:error", handleError);
      window.removeEventListener("mdh:chatwoot-open", handleOpen);
      window.removeEventListener("mdh:closechat", handleClose);
    };
  }, [baseUrl, enabled, websiteToken]);

  useEffect(() => {
    if (!enabled || !session.ready || !widgetReady || typeof window === "undefined" || !window.__mdhChatwootReady) {
      return;
    }

    let cancelled = false;

    async function syncUser() {
      if (!window.$chatwoot) {
        return;
      }

      if (!session.loggedIn || !session.user) {
        if (hadAuthenticatedUserRef.current) {
          window.$chatwoot.reset();
          hadAuthenticatedUserRef.current = false;
        }
        return;
      }

      const identity = await fetchChatwootIdentity().catch(() => null);
      if (cancelled || !identity) {
        return;
      }

      hadAuthenticatedUserRef.current = true;
      window.$chatwoot.setUser(identity.identifier, {
        email: identity.email || session.user.email,
        name: identity.name || session.user.displayName,
        identifier_hash: identity.identifierHash || undefined,
      });
    }

    void syncUser();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    session.loggedIn,
    session.ready,
    session.user,
    session.user?.displayName,
    session.user?.email,
    session.user?.id,
    widgetReady,
  ]);

  return null;
}

export default ChatwootWidget;
