"use client";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

const SIGNALS = [
  { name: "Lucas B.", city: "São Paulo" },
  { name: "Fernanda R.", city: "Rio de Janeiro" },
  { name: "Rafael S.", city: "Belo Horizonte" },
  { name: "Camila M.", city: "Curitiba" },
  { name: "Pedro A.", city: "Porto Alegre" },
  { name: "Ana C.", city: "Brasília" },
  { name: "Marcos T.", city: "Salvador" },
  { name: "Juliana F.", city: "Recife" },
];

function randomMinutesAgo() {
  return Math.floor(Math.random() * 55) + 5;
}

export function RecentPurchaseToast({ productName }: { productName: string }) {
  const [visible, setVisible] = useState(false);
  const [signal, setSignal] = useState({ name: "", city: "", minutes: 0 });

  useEffect(() => {
    const initial = Math.random() * 7000 + 8000;
    const timer = setTimeout(() => {
      const s = SIGNALS[Math.floor(Math.random() * SIGNALS.length)];
      setSignal({ name: s.name, city: s.city, minutes: randomMinutesAgo() });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, initial);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-[110] max-w-[280px] rounded-[20px] border border-white/10 bg-[rgba(9,17,25,0.96)] p-4 shadow-[0_8px_40px_rgba(2,8,23,0.5)] backdrop-blur-xl transition-all lg:bottom-6"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
          <ShoppingBag className="h-4 w-4 text-emerald-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {signal.name} de {signal.city}
          </p>
          <p className="mt-0.5 text-xs text-white/60">
            comprou {productName} há {signal.minutes} min
          </p>
        </div>
      </div>
    </div>
  );
}
