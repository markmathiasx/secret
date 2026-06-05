import { MessageCircleMore } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

export function buildCommerceWhatsAppHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppQuoteCta({
  message,
  label = "Pedir orçamento no WhatsApp",
  className = "btn-whatsapp justify-center gap-2 px-5 py-3",
}: {
  message: string;
  label?: string;
  className?: string;
}) {
  return (
    <a href={buildCommerceWhatsAppHref(message)} target="_blank" rel="noreferrer" className={className}>
      <MessageCircleMore className="h-4 w-4" />
      {label}
    </a>
  );
}
