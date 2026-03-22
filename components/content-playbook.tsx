"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type ContentAngle = {
  title: string;
  body: string;
};

export function ContentPlaybook({ angles }: { angles: ContentAngle[] }) {
  const [copiedTitle, setCopiedTitle] = useState("");

  async function copyText(item: ContentAngle) {
    try {
      await navigator.clipboard.writeText(`${item.title}\n\n${item.body}`);
      setCopiedTitle(item.title);
      window.setTimeout(() => setCopiedTitle(""), 1800);
    } catch {
      setCopiedTitle("");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {angles.map((item) => (
        <article key={item.title} className="glass-panel p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-bold text-white">{item.title}</h3>
            <button
              type="button"
              onClick={() => copyText(item)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100"
            >
              <span className="inline-flex items-center gap-2">
                {copiedTitle === item.title ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedTitle === item.title ? "Copiado" : "Copiar"}
              </span>
            </button>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
