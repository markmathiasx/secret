"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/favorites-context";

type FavoriteButtonProps = {
  productId: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
};

export function FavoriteButton({ productId, label = "favoritos", showLabel = false, className = "" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${label} dos favoritos` : `Favoritar ${label}`}
      onClick={() => toggleFavorite(productId)}
      className={`inline-flex items-center justify-center rounded-full border border-[#eadcc8] bg-white text-slate-600 transition hover:border-orange-300 hover:text-orange-700 ${
        showLabel ? "h-auto gap-2 px-4 py-2" : "h-10 w-10"
      } ${className}`.trim()}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current text-orange-500" : ""}`} />
      {showLabel ? <span className="text-sm font-semibold">{active ? "Favoritado" : "Favoritar"}</span> : null}
      <span aria-live="polite" className="sr-only">
        {active ? `${label} está nos favoritos` : `${label} fora dos favoritos`}
      </span>
    </button>
  );
}
