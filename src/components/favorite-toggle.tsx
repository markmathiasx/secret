"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getMemberKey, listFavorites, toggleFavorite } from "@/lib/member-store";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function FavoriteToggle({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const [ready, setReady] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [memberKey, setMemberKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabaseBrowser) {
        const key = getMemberKey();
        if (!active) return;
        setMemberKey(key);
        setFavorite(listFavorites(key).includes(productId));
        setReady(true);
        return;
      }

      const { data } = await supabaseBrowser.auth.getUser();
      const key = getMemberKey({ id: data.user?.id, email: data.user?.email, phone: data.user?.phone });

      if (!active) return;
      setMemberKey(key);
      setFavorite(listFavorites(key).includes(productId));
      setReady(true);
    }

    void load();

    function onStoreChange() {
      if (!memberKey) return;
      setFavorite(listFavorites(memberKey).includes(productId));
    }

    window.addEventListener("mdh:member-store", onStoreChange);

    return () => {
      active = false;
      window.removeEventListener("mdh:member-store", onStoreChange);
    };
  }, [memberKey, productId]);

  function onToggle() {
    const key = memberKey || getMemberKey();
    const next = toggleFavorite(key, productId);
    setMemberKey(key);
    setFavorite(next.includes(productId));
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 text-white/80 transition hover:border-white/30 hover:text-white ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
      aria-pressed={favorite}
      disabled={!ready}
    >
      <Heart className={`h-4 w-4 ${favorite ? "fill-current text-amber-200" : ""}`} />
      {favorite ? "Salvo" : "Favoritar"}
    </button>
  );
}
