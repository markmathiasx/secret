"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface FlashSaleTimerProps {
  endsAt: string | Date; // ISO string or Date
  discountPct: number;
  label?: string;
  onExpire?: () => void;
}

function timeLeft(endsAt: Date) {
  const diff = Math.max(0, endsAt.getTime() - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { h, m, s, total: diff };
}

/**
 * Countdown timer for flash sales.
 * Displays hours, minutes, and seconds remaining.
 * Hides itself when the sale expires.
 */
export function FlashSaleTimer({ endsAt, discountPct, label, onExpire }: FlashSaleTimerProps) {
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  const [time, setTime] = useState(() => timeLeft(end));

  useEffect(() => {
    if (time.total === 0) return;
    const interval = setInterval(() => {
      const t = timeLeft(end);
      setTime(t);
      if (t.total === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [end, onExpire, time.total]);

  if (time.total === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3">
      <Zap className="h-5 w-5 shrink-0 text-red-400 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
          {label ?? `Oferta relâmpago — ${discountPct}% OFF`}
        </p>
        <p className="text-xs text-white/50 mt-0.5">Termina em</p>
      </div>
      <div className="flex items-center gap-1 font-mono text-lg font-bold text-white tabular-nums">
        <span className="rounded bg-white/8 px-1.5 py-0.5">{pad(time.h)}</span>
        <span className="text-white/40">:</span>
        <span className="rounded bg-white/8 px-1.5 py-0.5">{pad(time.m)}</span>
        <span className="text-white/40">:</span>
        <span className="rounded bg-white/8 px-1.5 py-0.5">{pad(time.s)}</span>
      </div>
    </div>
  );
}
