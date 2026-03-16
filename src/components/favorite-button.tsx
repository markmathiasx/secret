"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

type FavoriteButtonProps = {
  productId: string;
  className?: string;
};

export function FavoriteButton({ productId, className = "" }: FavoriteButtonProps) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${productId} dos favoritos` : `Favoritar ${productId}`}
      onClick={() => setActive((current) => !current)}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/75 transition hover:border-cyan-300/35 hover:text-white ${className}`.trim()}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current text-cyan-200" : ""}`} />
    </button>
  );
}
