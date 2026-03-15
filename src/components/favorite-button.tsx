"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const LOCAL_KEY = "mdh_local_favorites";

function getLocalFavorites() {
  if (typeof window === "undefined") return [] as string[];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function FavoriteButton({ productId }: { productId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsFavorite(getLocalFavorites().includes(productId));

    const client = supabaseBrowser;
    if (!client) return;
    client.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id || null;
      setUserId(uid);
      if (!uid) return;
      const { data: favorite } = await client
        .from("favorites")
        .select("id")
        .eq("user_id", uid)
        .eq("product_id", productId)
        .maybeSingle();
      setIsFavorite(Boolean(favorite));
    });
  }, [productId]);

  async function toggleFavorite() {
    const client = supabaseBrowser;
    if (!client || !userId) {
      const current = getLocalFavorites();
      const next = current.includes(productId) ? current.filter((item) => item !== productId) : [...current, productId];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      setIsFavorite(next.includes(productId));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("mdh:open-login"));
      }
      return;
    }

    if (isFavorite) {
      await client.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
      setIsFavorite(false);
      return;
    }

    await client.from("favorites").upsert({ user_id: userId, product_id: productId });
    setIsFavorite(true);
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
        isFavorite
          ? "border-rose-300/40 bg-rose-400/20 text-rose-100"
          : "border-white/15 bg-black/30 text-white/70 hover:text-white"
      }`}
      aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
    </button>
  );
}
