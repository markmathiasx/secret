import { ProductCardSkeleton } from "@/components/ui/product-card-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#071016] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl space-y-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-emerald-300/15" />
          <div className="h-10 w-full animate-pulse rounded-full bg-white/[0.08]" />
          <div className="h-10 w-4/5 animate-pulse rounded-full bg-white/[0.08]" />
        </div>
        <ProductCardSkeleton count={8} />
      </div>
    </main>
  );
}

