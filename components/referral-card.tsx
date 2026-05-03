"use client";

import { useState } from "react";
import { Gift, Copy, Check, Users } from "lucide-react";

interface ReferralCardProps {
  code: string;
  referralUrl: string;
  rewardPoints: number;
  usedCount: number;
}

/**
 * Displays the user's referral code with copy-to-clipboard functionality.
 */
export function ReferralCard({ code, referralUrl, rewardPoints, usedCount }: ReferralCardProps) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(text: string, type: "code" | "link") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/3 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-400/10">
          <Gift className="h-5 w-5 text-violet-400" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Indique e ganhe</p>
          <p className="text-xs text-white/50">
            Você ganha 15% off e {rewardPoints} pontos de bônus
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1.5">Seu código</p>
          <div className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/5 px-4 py-3">
            <span className="flex-1 font-mono text-lg font-bold text-violet-300">{code}</span>
            <button
              onClick={() => copy(code, "code")}
              className="rounded-lg p-1.5 hover:bg-violet-400/10 transition text-violet-300"
              aria-label="Copiar código"
            >
              {copied === "code" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1.5">Link de indicação</p>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="flex-1 truncate text-xs text-white/60">{referralUrl}</span>
            <button
              onClick={() => copy(referralUrl, "link")}
              className="shrink-0 rounded-lg p-1.5 hover:bg-white/10 transition text-white/40"
              aria-label="Copiar link"
            >
              {copied === "link" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {usedCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
          <Users className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300">
            {usedCount} {usedCount === 1 ? "amigo indicado" : "amigos indicados"}
          </p>
        </div>
      )}

      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: "MDH 3D Store", url: referralUrl }).catch(() => {});
          } else {
            copy(referralUrl, "link");
          }
        }}
        className="btn-primary w-full rounded-2xl py-3 text-sm font-semibold"
      >
        Compartilhar indicação
      </button>
    </div>
  );
}
