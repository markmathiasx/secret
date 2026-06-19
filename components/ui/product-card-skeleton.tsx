export function ProductCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045]">
          <div className="aspect-square animate-pulse bg-white/[0.07]" />
          <div className="space-y-3 p-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/[0.08]" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-emerald-300/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

