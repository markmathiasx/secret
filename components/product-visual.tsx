import { Package, Sparkles, Wrench, House, Gamepad2, PawPrint, Shapes, Laptop, CircleHelp, Gift, Star } from "lucide-react";
import type { Product } from "@/lib/catalog";

const iconByCategory = {
  Anime: Sparkles,
  Games: Gamepad2,
  Casa: House,
  Oficina: Wrench,
  Escritorio: Laptop,
  Decoracao: Shapes,
  Utilidades: Package,
  Geek: Star,
  Pets: PawPrint,
  Personalizados: Gift
} as const;

const gradientByCategory = {
  Anime: "from-fuchsia-500/25 via-violet-500/10 to-cyan-400/20",
  Games: "from-cyan-500/25 via-blue-500/10 to-violet-400/20",
  Casa: "from-emerald-500/25 via-cyan-500/10 to-slate-500/20",
  Oficina: "from-amber-500/25 via-orange-500/10 to-slate-500/20",
  Escritorio: "from-sky-500/25 via-indigo-500/10 to-violet-500/20",
  Decoracao: "from-rose-500/25 via-fuchsia-500/10 to-violet-500/20",
  Utilidades: "from-cyan-500/25 via-emerald-500/10 to-slate-500/20",
  Geek: "from-violet-500/25 via-cyan-500/10 to-indigo-500/20",
  Pets: "from-amber-500/25 via-rose-500/10 to-cyan-500/20",
  Personalizados: "from-slate-300/25 via-violet-500/10 to-cyan-500/20"
} as const;

export function ProductVisual({ product, compact = false }: { product: Product; compact?: boolean }) {
  const Icon = iconByCategory[product.category as keyof typeof iconByCategory] || CircleHelp;
  const gradient = gradientByCategory[product.category as keyof typeof gradientByCategory] || "from-cyan-500/25 via-violet-500/10 to-slate-500/20";

  return (
    <div className={`relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br ${gradient} ${compact ? "p-4" : "p-6"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(42,212,255,0.12),transparent_30%)]" />
      <div className="relative flex h-full min-h-40 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">{product.collection}</p>
            <h3 className={`${compact ? "mt-2 text-lg" : "mt-3 text-2xl"} font-black text-white`}>{product.theme}</h3>
          </div>
          <span className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white/80">
            <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {product.colors.slice(0, compact ? 3 : 5).map((color) => (
            <span key={color} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/75">
              {color}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-white/75">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
            <div className="font-semibold text-white">{product.grams} g</div>
            <div>Peso</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
            <div className="font-semibold text-white">{product.hours} h</div>
            <div>Impressão</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
            <div className="font-semibold text-white">{product.productionWindow}</div>
            <div>Prazo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
