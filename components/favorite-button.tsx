"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCustomerSession } from "@/lib/customer-session-client";
import { getMemberKey, listFavorites, toggleFavorite } from "@/lib/member-store";

type FavoriteButtonProps = {
  productId: string;
  className?: string;
};

export function FavoriteButton({ productId, className = "" }: FavoriteButtonProps) {
  const session = useCustomerSession();
  const [active, setActive] = useState(false);
  const [memberKey, setMemberKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!session.ready) return;

    const key = getMemberKey({ id: session.user?.id, email: session.user?.email });
    setMemberKey(key);
    setActive(listFavorites(key).includes(productId));
    setReady(true);
  }, [productId, session.ready, session.user?.email, session.user?.id]);

  useEffect(() => {
    function onStoreChange() {
      const key = memberKey || getMemberKey({ id: session.user?.id, email: session.user?.email });
      setActive(listFavorites(key).includes(productId));
    }

    window.addEventListener("mdh:member-store", onStoreChange);
    return () => {
      window.removeEventListener("mdh:member-store", onStoreChange);
    };
  }, [memberKey, productId, session.user?.email, session.user?.id]);

  function onToggle() {
    const key = memberKey || getMemberKey({ id: session.user?.id, email: session.user?.email });
    const next = toggleFavorite(key, productId);
    setMemberKey(key);
    setActive(next.includes(productId));
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${productId} dos favoritos` : `Favoritar ${productId}`}
      onClick={onToggle}
      disabled={!ready}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/75 transition hover:border-cyan-300/35 hover:text-white ${className}`.trim()}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current text-cyan-200" : ""}`} />
    </button>
  );
}
