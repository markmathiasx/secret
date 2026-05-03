"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CartDrawer = dynamic(() => import("@/components/cart-drawer").then((module) => module.CartDrawer), { ssr: false });
const CartRecoveryDock = dynamic(() => import("@/components/cart-recovery-dock").then((module) => module.CartRecoveryDock), { ssr: false });
const CartSessionBridge = dynamic(() => import("@/components/cart-session-bridge").then((module) => module.CartSessionBridge), { ssr: false });
const ChatwootWidget = dynamic(() => import("@/components/chatwoot-widget").then((module) => module.ChatwootWidget), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/cookie-consent").then((module) => module.CookieConsent), { ssr: false });
const FacebookPixel = dynamic(() => import("@/components/facebook-pixel").then((module) => module.FacebookPixel), { ssr: false });
const LiveChatWidget = dynamic(() => import("@/components/live-chat-widget").then((module) => module.LiveChatWidget), { ssr: false });
const NetworkStatusBanner = dynamic(() => import("@/components/network-status-banner").then((module) => module.NetworkStatusBanner), { ssr: false });
const PwaRegister = dynamic(() => import("@/components/pwa-register").then((module) => module.PwaRegister), { ssr: false });
const RouteActionDock = dynamic(() => import("@/components/route-action-dock").then((module) => module.RouteActionDock), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/scroll-to-top").then((module) => module.ScrollToTop), { ssr: false });
const SiteAssistant = dynamic(() => import("@/components/site-assistant").then((module) => module.SiteAssistant), { ssr: false });
const TikTokPixel = dynamic(() => import("@/components/tiktok-pixel").then((module) => module.TikTokPixel), { ssr: false });
const WebVitals = dynamic(() => import("@/components/web-vitals").then((module) => module.WebVitals), { ssr: false });

type DeferredLayoutWidgetsProps = {
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantModel: string;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "ai_gateway" | "fallback";
  chatwootEnabled: boolean;
  chatwootBaseUrl: string | null;
  chatwootWebsiteToken: string;
  liveChatMode: "chatwoot" | "native" | "whatsapp";
};

export function DeferredLayoutWidgets({
  cardCheckoutReady,
  aiAssistantReady,
  aiAssistantModel,
  aiAssistantProvider,
  chatwootEnabled,
  chatwootBaseUrl,
  chatwootWebsiteToken,
  liveChatMode,
}: DeferredLayoutWidgetsProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    const activate = () => setReady(true);
    const timeoutId = window.setTimeout(activate, 12_000);
    const eventOptions = { once: true, passive: true } as AddEventListenerOptions;

    window.addEventListener("pointerdown", activate, eventOptions);
    window.addEventListener("keydown", activate, { once: true });
    window.addEventListener("scroll", activate, eventOptions);
    window.addEventListener("touchstart", activate, eventOptions);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("scroll", activate);
      window.removeEventListener("touchstart", activate);
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <CartSessionBridge />
      <RouteActionDock />
      <ScrollToTop />
      <SiteAssistant
        cardCheckoutReady={cardCheckoutReady}
        aiAssistantReady={aiAssistantReady}
        aiAssistantModel={aiAssistantModel}
        aiAssistantProvider={aiAssistantProvider}
        liveChatMode={liveChatMode}
      />
      <ChatwootWidget enabled={chatwootEnabled} baseUrl={chatwootBaseUrl} websiteToken={chatwootWebsiteToken} />
      <LiveChatWidget defaultMode={liveChatMode} />
      <PwaRegister />
      <CartDrawer />
      <CartRecoveryDock />
      <CookieConsent />
      <FacebookPixel />
      <TikTokPixel />
      <WebVitals />
      <NetworkStatusBanner />
    </>
  );
}
