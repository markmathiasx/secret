"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

/**
 * Native share button with clipboard fallback.
 * Uses Web Share API on mobile; copies URL to clipboard on desktop.
 */
export function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  async function handleShare() {
    if (typeof navigator === "undefined") return;

    // Native share (mobile)
    if ("share" in navigator) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Last resort: prompt
      window.prompt("Copie o link:", shareUrl);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className}
      aria-label={copied ? "Link copiado!" : "Compartilhar produto"}
      title={copied ? "Link copiado!" : "Compartilhar"}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
      <span className="sr-only">{copied ? "Copiado" : "Compartilhar"}</span>
    </button>
  );
}
