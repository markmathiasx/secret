"use client";

import { MessageCircleMore } from "lucide-react";

export function SupportHumanHandoff({
  whatsappUrl,
  label = "Falar com humano",
}: {
  whatsappUrl: string;
  label?: string;
}) {
  return (
    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2 px-4 py-2 text-sm">
      <MessageCircleMore className="h-4 w-4" />
      {label}
    </a>
  );
}
