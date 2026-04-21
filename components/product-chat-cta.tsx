"use client";

/**
 * ProductChatCTA
 *
 * A minimal "use client" button that writes the product context to localStorage
 * and dispatches the mdh:openchat custom event, which the LiveChatWidget listens
 * for to auto-open pre-filled with the product subject.
 *
 * This keeps the PDP (a static Server Component) architecture intact.
 */

import { MessageCircleMore } from "lucide-react";

interface ProductChatCTAProps {
  productName: string;
  sku: string;
  className?: string;
}

const PENDING_SUBJECT_KEY = "mdh-chat-pending-subject";

export function ProductChatCTA({ productName, sku, className }: ProductChatCTAProps) {
  function handleClick() {
    if (typeof window === "undefined") return;
    const subject = `Dúvida sobre "${productName}" (SKU ${sku})`;
    window.localStorage.setItem(PENDING_SUBJECT_KEY, subject);
    window.dispatchEvent(new CustomEvent("mdh:openchat"));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "btn-secondary inline-flex items-center gap-2"
      }
    >
      <MessageCircleMore className="h-4 w-4" />
      Tirar dúvida no chat
    </button>
  );
}
