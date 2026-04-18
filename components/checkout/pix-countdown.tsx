"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function PixCountdown({ expiresAt }: { expiresAt: string | null | undefined }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const target = new Date(expiresAt).getTime();

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSecondsLeft(diff);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt || secondsLeft === null) return null;

  const expired = secondsLeft === 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2 rounded-[16px] border px-3 py-2 text-sm font-semibold ${
        expired
          ? "border-rose-300/30 bg-rose-300/10 text-rose-200"
          : secondsLeft < 60
          ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
          : "border-emerald-300/25 bg-emerald-300/8 text-emerald-100"
      }`}
    >
      <Clock className="h-4 w-4 shrink-0" />
      {expired ? "QR Code expirado — gere um novo pedido." : `QR válido por ${timeStr}`}
    </div>
  );
}
